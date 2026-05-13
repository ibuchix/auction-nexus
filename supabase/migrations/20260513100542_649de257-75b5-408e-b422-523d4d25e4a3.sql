
CREATE OR REPLACE FUNCTION public.admin_get_cars_history_cleanup_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'cron'
AS $function$
DECLARE
  result jsonb;
  v_total_rows BIGINT;
  v_rows_over_90d BIGINT;
  v_oldest TIMESTAMPTZ;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::user_role) THEN
    RAISE EXCEPTION 'Forbidden: admin role required';
  END IF;

  -- Use approximate count to avoid timeouts on a 100M+ row table
  SELECT reltuples::BIGINT INTO v_total_rows
  FROM pg_class
  WHERE oid = 'public.cars_history'::regclass;

  -- Quick existence-style estimate for >90d rows: use a bounded sample
  SELECT COUNT(*) INTO v_rows_over_90d
  FROM (
    SELECT 1 FROM public.cars_history
    WHERE changed_at < NOW() - INTERVAL '90 days'
    LIMIT 1000000
  ) s;

  SELECT MIN(changed_at) INTO v_oldest FROM public.cars_history;

  result := jsonb_build_object(
    'table_stats', jsonb_build_object(
      'approximate_total_rows', v_total_rows,
      'rows_older_than_90d_sample', v_rows_over_90d,
      'sample_capped_at', 1000000,
      'oldest_row_changed_at', v_oldest
    ),
    'recent_runs', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'created_at', sl.created_at,
        'deleted_count', sl.details->>'deleted_count',
        'duration_seconds', sl.details->>'duration_seconds',
        'batches', sl.details->>'batches',
        'cutoff_date', sl.details->>'cutoff_date'
      ) ORDER BY sl.created_at DESC)
      FROM public.system_logs sl
      WHERE sl.log_type = 'cleanup'
        AND sl.message = 'Daily cars_history cleanup completed'
        AND sl.created_at > NOW() - INTERVAL '30 days'
    ), '[]'::jsonb),
    'cron_jobs', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'jobname', j.jobname,
        'schedule', j.schedule,
        'active', j.active,
        'last_run', latest.start_time,
        'last_status', latest.status,
        'last_message', LEFT(latest.return_message, 200)
      ))
      FROM cron.job j
      LEFT JOIN LATERAL (
        SELECT start_time, status, return_message
        FROM cron.job_run_details d
        WHERE d.jobid = j.jobid
        ORDER BY d.start_time DESC
        LIMIT 1
      ) latest ON true
      WHERE j.jobname IN ('daily-cars-history-cleanup', 'temp-cars-history-backlog-drain')
    ), '[]'::jsonb)
  );

  RETURN result;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.admin_get_cars_history_cleanup_status() TO authenticated;
