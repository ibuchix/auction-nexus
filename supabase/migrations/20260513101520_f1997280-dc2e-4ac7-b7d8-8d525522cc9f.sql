-- 1. Rewrite backlog drain: 90d cutoff, time-budget loop, bigger batches, logs to system_logs
CREATE OR REPLACE FUNCTION public.cleanup_cars_history_backlog()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  cutoff_date TIMESTAMP WITH TIME ZONE;
  deleted_count BIGINT := 0;
  batch_deleted INTEGER;
  batch_size INTEGER := 10000;
  batch_num INTEGER := 0;
  start_time TIMESTAMP := clock_timestamp();
  max_seconds INTEGER := 100; -- leave headroom inside the 2-minute cron interval
  more_to_delete BOOLEAN := false;
BEGIN
  cutoff_date := NOW() - INTERVAL '90 days';

  LOOP
    batch_num := batch_num + 1;

    DELETE FROM public.cars_history
    WHERE id IN (
      SELECT id FROM public.cars_history
      WHERE changed_at < cutoff_date
      LIMIT batch_size
    );

    GET DIAGNOSTICS batch_deleted = ROW_COUNT;
    deleted_count := deleted_count + batch_deleted;

    EXIT WHEN batch_deleted = 0;

    IF EXTRACT(EPOCH FROM (clock_timestamp() - start_time)) > max_seconds THEN
      more_to_delete := true;
      EXIT;
    END IF;

    PERFORM pg_sleep(0.05);
  END LOOP;

  -- Only log runs that actually did work, so we don't pollute system_logs
  -- once the backlog has been fully drained.
  IF deleted_count > 0 THEN
    INSERT INTO public.system_logs (log_type, message, details)
    VALUES (
      'cleanup',
      'Cars_history backlog drain run',
      jsonb_build_object(
        'deleted_count', deleted_count,
        'cutoff_date', cutoff_date,
        'batches', batch_num,
        'duration_seconds', EXTRACT(EPOCH FROM (clock_timestamp() - start_time)),
        'more_to_delete', more_to_delete
      )
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'deleted_count', deleted_count,
    'batches', batch_num,
    'cutoff_date', cutoff_date,
    'duration_seconds', EXTRACT(EPOCH FROM (clock_timestamp() - start_time)),
    'more_to_delete', more_to_delete
  );
END;
$function$;

-- 2. Surface both daily + backlog runs on the admin status page
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

  SELECT reltuples::BIGINT INTO v_total_rows
  FROM pg_class
  WHERE oid = 'public.cars_history'::regclass;

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
      SELECT jsonb_agg(row_to_json(r) ORDER BY r.created_at DESC)
      FROM (
        SELECT
          sl.created_at,
          sl.details->>'deleted_count' AS deleted_count,
          sl.details->>'duration_seconds' AS duration_seconds,
          sl.details->>'batches' AS batches,
          sl.details->>'cutoff_date' AS cutoff_date,
          CASE
            WHEN sl.message = 'Cars_history backlog drain run' THEN 'backlog'
            ELSE 'daily'
          END AS kind
        FROM public.system_logs sl
        WHERE sl.log_type = 'cleanup'
          AND sl.message IN (
            'Daily cars_history cleanup completed',
            'Cars_history backlog drain run'
          )
          AND sl.created_at > NOW() - INTERVAL '30 days'
        ORDER BY sl.created_at DESC
        LIMIT 100
      ) r
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
GRANT EXECUTE ON FUNCTION public.cleanup_cars_history_backlog() TO postgres;