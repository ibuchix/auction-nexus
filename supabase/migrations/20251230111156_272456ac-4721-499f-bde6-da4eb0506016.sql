-- Reduce max iterations from 10 to 2 (20,000 records max per run instead of 100,000)
CREATE OR REPLACE FUNCTION public.cleanup_cars_history_backlog()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET statement_timeout = '120s'
AS $$
DECLARE
  deleted_count INTEGER := 0;
  batch_size INTEGER := 10000;
  cutoff_date TIMESTAMP WITH TIME ZONE := NOW() - INTERVAL '30 days';
  rows_deleted INTEGER;
  iteration INTEGER := 0;
  max_iterations INTEGER := 2;
  start_time TIMESTAMP WITH TIME ZONE := clock_timestamp();
BEGIN
  LOOP
    DELETE FROM cars_history
    WHERE id IN (
      SELECT id FROM cars_history
      WHERE changed_at < cutoff_date
      LIMIT batch_size
    );
    
    GET DIAGNOSTICS rows_deleted = ROW_COUNT;
    deleted_count := deleted_count + rows_deleted;
    iteration := iteration + 1;
    
    EXIT WHEN rows_deleted < batch_size OR iteration >= max_iterations;
    
    PERFORM pg_sleep(0.1);
  END LOOP;

  INSERT INTO system_logs (log_type, message, details)
  VALUES (
    'cleanup',
    format('Backlog cleanup: %s records deleted in %s batches, took %s', deleted_count, iteration, clock_timestamp() - start_time),
    jsonb_build_object(
      'deleted_count', deleted_count,
      'batches', iteration,
      'duration', extract(epoch from (clock_timestamp() - start_time))
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'deleted_count', deleted_count,
    'batches', iteration,
    'cutoff_date', cutoff_date,
    'duration_seconds', extract(epoch from (clock_timestamp() - start_time)),
    'more_to_delete', EXISTS (SELECT 1 FROM cars_history WHERE changed_at < cutoff_date LIMIT 1)
  );
END;
$$;