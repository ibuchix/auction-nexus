-- Create test cleanup function for verifying batching mechanism
CREATE OR REPLACE FUNCTION test_cleanup_small()
RETURNS jsonb AS $$
DECLARE
  system_logs_deleted INTEGER := 0;
  batch_size INTEGER := 5000;  -- Smaller batches for testing
  max_total_deletes INTEGER := 10000;  -- Stop at 10K
  rows_affected INTEGER;
  total_deleted INTEGER := 0;
  batch_count INTEGER := 0;
BEGIN
  RAISE NOTICE 'Starting TEST cleanup (max 10K rows, 90-day retention)';
  
  -- Delete from system_logs only (largest table)
  LOOP
    EXIT WHEN total_deleted >= max_total_deletes;
    
    DELETE FROM system_logs 
    WHERE id IN (
      SELECT id FROM system_logs 
      WHERE created_at < NOW() - INTERVAL '90 days'
      LIMIT LEAST(batch_size, max_total_deletes - total_deleted)
    );
    
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    system_logs_deleted := system_logs_deleted + rows_affected;
    total_deleted := total_deleted + rows_affected;
    batch_count := batch_count + 1;
    
    RAISE NOTICE 'Batch %: deleted % rows (total: %/%)', 
      batch_count, rows_affected, total_deleted, max_total_deletes;
    
    EXIT WHEN rows_affected = 0 OR rows_affected < batch_size;
    
    -- Small pause between batches
    PERFORM pg_sleep(0.1);
  END LOOP;
  
  -- Light VACUUM (no ANALYZE for speed)
  EXECUTE 'VACUUM system_logs';
  
  RAISE NOTICE 'Test cleanup complete: % rows deleted in % batches', 
    total_deleted, batch_count;
  
  RETURN jsonb_build_object(
    'success', true,
    'test_mode', true,
    'deleted', jsonb_build_object(
      'system_logs', system_logs_deleted,
      'total', total_deleted
    ),
    'batches_executed', batch_count,
    'avg_rows_per_batch', CASE WHEN batch_count > 0 
      THEN total_deleted::numeric / batch_count 
      ELSE 0 END,
    'cleaned_at', NOW()
  );
  
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Test cleanup failed: %', SQLERRM;
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'deleted_before_error', total_deleted
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

COMMENT ON FUNCTION test_cleanup_small() IS 
'Test function to verify cleanup batching works. Deletes max 10K old logs.';

-- Create monitoring function for cron job status
CREATE OR REPLACE FUNCTION get_cleanup_job_status()
RETURNS TABLE (
  job_name text,
  is_active boolean,
  schedule text,
  last_run_time timestamptz,
  last_run_status text,
  last_run_duration interval,
  rows_deleted_last_run bigint,
  next_scheduled_run timestamptz,
  total_runs bigint,
  successful_runs bigint,
  failed_runs bigint,
  avg_duration_seconds numeric
) AS $$
DECLARE
  job_id bigint;
BEGIN
  -- Get the job ID
  SELECT j.jobid INTO job_id
  FROM cron.job j
  WHERE j.jobname = 'weekly-log-cleanup';
  
  IF job_id IS NULL THEN
    RAISE EXCEPTION 'Cleanup job not found';
  END IF;
  
  RETURN QUERY
  SELECT 
    j.jobname::text as job_name,
    j.active as is_active,
    j.schedule::text as schedule,
    
    -- Last run details
    (SELECT MAX(jrd.end_time) 
     FROM cron.job_run_details jrd 
     WHERE jrd.jobid = job_id) as last_run_time,
     
    (SELECT CASE 
       WHEN jrd.status = 'succeeded' THEN '✅ Success'
       WHEN jrd.status = 'failed' THEN '❌ Failed'
       ELSE '⏳ ' || jrd.status
     END
     FROM cron.job_run_details jrd
     WHERE jrd.jobid = job_id
     ORDER BY jrd.end_time DESC LIMIT 1) as last_run_status,
     
    (SELECT jrd.end_time - jrd.start_time
     FROM cron.job_run_details jrd
     WHERE jrd.jobid = job_id
     ORDER BY jrd.end_time DESC LIMIT 1) as last_run_duration,
     
    (SELECT (jrd.return_message::jsonb->'deleted'->>'total')::bigint
     FROM cron.job_run_details jrd
     WHERE jrd.jobid = job_id
     ORDER BY jrd.end_time DESC LIMIT 1) as rows_deleted_last_run,
    
    -- Next run calculation (Saturday at 2 AM UTC)
    (SELECT 
      CASE 
        WHEN EXTRACT(DOW FROM NOW()) < 6 THEN 
          DATE_TRUNC('week', NOW()) + INTERVAL '13 days' + INTERVAL '2 hours'
        WHEN EXTRACT(DOW FROM NOW()) = 6 AND EXTRACT(HOUR FROM NOW()) < 2 THEN
          DATE_TRUNC('day', NOW()) + INTERVAL '2 hours'
        ELSE 
          DATE_TRUNC('week', NOW()) + INTERVAL '13 days' + INTERVAL '2 hours'
      END
    ) as next_scheduled_run,
    
    -- Statistics
    (SELECT COUNT(*) 
     FROM cron.job_run_details jrd 
     WHERE jrd.jobid = job_id) as total_runs,
     
    (SELECT COUNT(*) 
     FROM cron.job_run_details jrd 
     WHERE jrd.jobid = job_id AND jrd.status = 'succeeded') as successful_runs,
     
    (SELECT COUNT(*) 
     FROM cron.job_run_details jrd 
     WHERE jrd.jobid = job_id AND jrd.status = 'failed') as failed_runs,
     
    (SELECT AVG(EXTRACT(EPOCH FROM (jrd.end_time - jrd.start_time)))
     FROM cron.job_run_details jrd
     WHERE jrd.jobid = job_id AND jrd.status = 'succeeded') as avg_duration_seconds
     
  FROM cron.job j
  WHERE j.jobid = job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

COMMENT ON FUNCTION get_cleanup_job_status() IS 
'Returns status and statistics for the weekly log cleanup cron job.';

-- Create comprehensive monitoring dashboard view
CREATE OR REPLACE VIEW cleanup_monitoring_dashboard AS
WITH job_info AS (
  SELECT j.jobid, j.jobname, j.schedule, j.active
  FROM cron.job j
  WHERE j.jobname = 'weekly-log-cleanup'
),
last_run AS (
  SELECT 
    jrd.jobid,
    jrd.start_time,
    jrd.end_time,
    jrd.status,
    jrd.end_time - jrd.start_time as duration,
    jrd.return_message::jsonb as result
  FROM cron.job_run_details jrd
  WHERE jrd.jobid = (SELECT jobid FROM job_info)
  ORDER BY jrd.end_time DESC
  LIMIT 1
),
job_stats AS (
  SELECT 
    COUNT(*) as total_runs,
    COUNT(*) FILTER (WHERE status = 'succeeded') as successful_runs,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_runs,
    SUM((return_message::jsonb->'deleted'->>'total')::bigint) FILTER (WHERE status = 'succeeded') as total_rows_deleted_lifetime
  FROM cron.job_run_details
  WHERE jobid = (SELECT jobid FROM job_info)
),
table_counts AS (
  SELECT 
    (SELECT COUNT(*) FROM system_logs) as system_logs_count,
    (SELECT COUNT(*) FROM system_logs WHERE created_at < NOW() - INTERVAL '90 days') as system_logs_old,
    (SELECT COUNT(*) FROM cars_history) as cars_history_count,
    (SELECT COUNT(*) FROM cars_history WHERE changed_at < NOW() - INTERVAL '90 days') as cars_history_old,
    (SELECT COUNT(*) FROM audit_logs) as audit_logs_count,
    (SELECT COUNT(*) FROM audit_logs WHERE created_at < NOW() - INTERVAL '90 days') as audit_logs_old
)
SELECT 
  -- Job Configuration
  ji.jobname,
  ji.schedule as cron_schedule,
  ji.active as is_active,
  
  -- Last Run Info
  lr.start_time as last_run_started,
  lr.end_time as last_run_ended,
  lr.status as last_run_status,
  lr.duration as last_run_duration,
  
  -- Last Run Results
  (lr.result->'deleted'->>'system_logs')::bigint as last_system_logs_deleted,
  (lr.result->'deleted'->>'cars_history')::bigint as last_cars_history_deleted,
  (lr.result->'deleted'->>'audit_logs')::bigint as last_audit_logs_deleted,
  (lr.result->'deleted'->>'total')::bigint as last_total_deleted,
  
  -- Job Statistics
  js.total_runs,
  js.successful_runs,
  js.failed_runs,
  js.total_rows_deleted_lifetime,
  
  -- Next Run
  CASE 
    WHEN EXTRACT(DOW FROM NOW()) < 6 THEN 
      DATE_TRUNC('week', NOW()) + INTERVAL '13 days' + INTERVAL '2 hours'
    WHEN EXTRACT(DOW FROM NOW()) = 6 AND EXTRACT(HOUR FROM NOW()) < 2 THEN
      DATE_TRUNC('day', NOW()) + INTERVAL '2 hours'
    ELSE 
      DATE_TRUNC('week', NOW()) + INTERVAL '13 days' + INTERVAL '2 hours'
  END as next_scheduled_run,
  
  -- Current Table Status
  tc.system_logs_count as current_system_logs,
  tc.system_logs_old as system_logs_ready_to_clean,
  tc.cars_history_count as current_cars_history,
  tc.cars_history_old as cars_history_ready_to_clean,
  tc.audit_logs_count as current_audit_logs,
  tc.audit_logs_old as audit_logs_ready_to_clean,
  
  -- Health Indicators
  CASE 
    WHEN lr.status = 'succeeded' THEN 'healthy'
    WHEN lr.status = 'failed' THEN 'error'
    WHEN lr.status IS NULL THEN 'pending_first_run'
    ELSE 'unknown'
  END as health_status,
  
  CASE 
    WHEN tc.system_logs_old > 1000000 THEN 'high_backlog'
    WHEN tc.system_logs_old > 100000 THEN 'moderate_backlog'
    ELSE 'normal'
  END as cleanup_urgency

FROM job_info ji
CROSS JOIN job_stats js
CROSS JOIN table_counts tc
LEFT JOIN last_run lr ON lr.jobid = ji.jobid;

COMMENT ON VIEW cleanup_monitoring_dashboard IS 
'Comprehensive monitoring view for the weekly log cleanup job. Use SELECT * FROM cleanup_monitoring_dashboard;';