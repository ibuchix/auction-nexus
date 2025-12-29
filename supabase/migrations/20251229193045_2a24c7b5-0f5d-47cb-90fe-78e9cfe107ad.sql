-- Update Monitoring Dashboard with both weekly and monthly cleanup stats
DROP VIEW IF EXISTS cleanup_monitoring_dashboard;

CREATE OR REPLACE VIEW cleanup_monitoring_dashboard AS
WITH weekly_job_info AS (
  SELECT j.jobid, j.jobname, j.schedule, j.active
  FROM cron.job j WHERE j.jobname = 'weekly-log-cleanup'
),
monthly_job_info AS (
  SELECT j.jobid, j.jobname, j.schedule, j.active
  FROM cron.job j WHERE j.jobname = 'monthly-vehicle-cleanup'
),
weekly_last_run AS (
  SELECT jrd.jobid, jrd.start_time, jrd.end_time, jrd.status,
    jrd.end_time - jrd.start_time as duration,
    CASE WHEN jrd.return_message LIKE '{%' THEN jrd.return_message::jsonb ELSE NULL END as result
  FROM cron.job_run_details jrd
  WHERE jrd.jobid = (SELECT jobid FROM weekly_job_info)
  ORDER BY jrd.end_time DESC LIMIT 1
),
monthly_last_run AS (
  SELECT jrd.jobid, jrd.start_time, jrd.end_time, jrd.status,
    jrd.end_time - jrd.start_time as duration,
    CASE WHEN jrd.return_message LIKE '{%' THEN jrd.return_message::jsonb ELSE NULL END as result
  FROM cron.job_run_details jrd
  WHERE jrd.jobid = (SELECT jobid FROM monthly_job_info)
  ORDER BY jrd.end_time DESC LIMIT 1
),
weekly_stats AS (
  SELECT COUNT(*) as total_runs,
    COUNT(*) FILTER (WHERE status = 'succeeded') as successful_runs,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_runs
  FROM cron.job_run_details WHERE jobid = (SELECT jobid FROM weekly_job_info)
),
monthly_stats AS (
  SELECT COUNT(*) as total_runs,
    COUNT(*) FILTER (WHERE status = 'succeeded') as successful_runs,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_runs
  FROM cron.job_run_details WHERE jobid = (SELECT jobid FROM monthly_job_info)
),
table_counts AS (
  SELECT 
    (SELECT COUNT(*) FROM system_logs) as system_logs_count,
    (SELECT COUNT(*) FROM system_logs WHERE created_at < NOW() - INTERVAL '90 days') as system_logs_old,
    (SELECT COUNT(*) FROM cars_history) as cars_history_count,
    (SELECT COUNT(*) FROM cars_history WHERE changed_at < NOW() - INTERVAL '90 days') as cars_history_old,
    (SELECT COUNT(*) FROM audit_logs) as audit_logs_count,
    (SELECT COUNT(*) FROM cars WHERE created_at < NOW() - INTERVAL '6 months') as cars_old,
    (SELECT COUNT(*) FROM manual_valuations WHERE created_at < NOW() - INTERVAL '6 months') as manual_valuations_old,
    (SELECT COUNT(*) FROM vin_valuation_cache WHERE created_at < NOW() - INTERVAL '30 days') as vin_cache_old,
    (SELECT COUNT(*) FROM password_reset_tokens WHERE expires_at < NOW()) as expired_tokens,
    (SELECT COUNT(*) FROM notifications WHERE is_read = true AND created_at < NOW() - INTERVAL '30 days') as old_notifications
)
SELECT 
  wji.jobname as weekly_job_name, wji.schedule as weekly_schedule, wji.active as weekly_is_active,
  wlr.start_time as weekly_last_run_started, wlr.end_time as weekly_last_run_ended,
  wlr.status as weekly_last_run_status, wlr.duration as weekly_last_run_duration,
  ws.total_runs as weekly_total_runs, ws.successful_runs as weekly_successful_runs, ws.failed_runs as weekly_failed_runs,
  mji.jobname as monthly_job_name, mji.schedule as monthly_schedule, mji.active as monthly_is_active,
  mlr.start_time as monthly_last_run_started, mlr.end_time as monthly_last_run_ended,
  mlr.status as monthly_last_run_status, mlr.duration as monthly_last_run_duration,
  ms.total_runs as monthly_total_runs, ms.successful_runs as monthly_successful_runs, ms.failed_runs as monthly_failed_runs,
  tc.system_logs_count as current_system_logs, tc.system_logs_old as system_logs_ready_to_clean,
  tc.cars_history_count as current_cars_history, tc.cars_history_old as cars_history_ready_to_clean,
  tc.audit_logs_count as current_audit_logs, tc.vin_cache_old as vin_cache_ready_to_clean,
  tc.expired_tokens as expired_tokens_to_clean, tc.old_notifications as old_notifications_to_clean,
  tc.cars_old as cars_ready_to_clean, tc.manual_valuations_old as manual_valuations_ready_to_clean,
  CASE 
    WHEN wlr.status = 'succeeded' AND (mlr.status = 'succeeded' OR mlr.status IS NULL) THEN 'healthy'
    WHEN wlr.status = 'failed' OR mlr.status = 'failed' THEN 'error'
    WHEN wlr.status IS NULL THEN 'pending_first_run'
    ELSE 'unknown'
  END as health_status,
  CASE 
    WHEN tc.system_logs_old > 1000000 OR tc.cars_history_old > 1000000 THEN 'high_backlog'
    WHEN tc.system_logs_old > 100000 OR tc.cars_history_old > 100000 THEN 'moderate_backlog'
    ELSE 'normal'
  END as cleanup_urgency
FROM weekly_job_info wji
CROSS JOIN weekly_stats ws
CROSS JOIN table_counts tc
LEFT JOIN weekly_last_run wlr ON wlr.jobid = wji.jobid
LEFT JOIN monthly_job_info mji ON true
LEFT JOIN monthly_stats ms ON true
LEFT JOIN monthly_last_run mlr ON mlr.jobid = mji.jobid