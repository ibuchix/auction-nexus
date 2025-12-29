-- Drop the existing broken view
DROP VIEW IF EXISTS cleanup_monitoring_dashboard;

-- Recreate with safe JSON parsing that handles non-JSON return messages
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
    -- Safely parse JSON only if it looks like JSON (starts with '{')
    CASE 
      WHEN jrd.return_message LIKE '{%' 
      THEN jrd.return_message::jsonb 
      ELSE NULL 
    END as result
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
    -- Safely sum only valid JSON results
    SUM(
      CASE 
        WHEN return_message LIKE '{%' 
        THEN (return_message::jsonb->'deleted'->>'total')::bigint 
        ELSE 0 
      END
    ) FILTER (WHERE status = 'succeeded') as total_rows_deleted_lifetime
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
  
  -- Last Run Results (safely extract from JSON if available)
  (lr.result->'deleted'->>'system_logs')::bigint as last_system_logs_deleted,
  (lr.result->'deleted'->>'cars_history')::bigint as last_cars_history_deleted,
  (lr.result->'deleted'->>'audit_logs')::bigint as last_audit_logs_deleted,
  (lr.result->'deleted'->>'total')::bigint as last_total_deleted,
  
  -- Job Statistics
  js.total_runs,
  js.successful_runs,
  js.failed_runs,
  js.total_rows_deleted_lifetime,
  
  -- Next Run calculation
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