-- Update cleanup_cars_history_backlog() to use 60 days retention
CREATE OR REPLACE FUNCTION public.cleanup_cars_history_backlog()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cutoff_date TIMESTAMP WITH TIME ZONE;
  deleted_count INTEGER := 0;
  batch_deleted INTEGER;
  batch_size INTEGER := 5000;
  max_batches INTEGER := 20;
  batch_num INTEGER := 0;
  start_time TIMESTAMP := clock_timestamp();
BEGIN
  -- Calculate cutoff date (60 days ago)
  cutoff_date := NOW() - INTERVAL '60 days';
  
  -- Delete in batches to avoid long locks
  LOOP
    batch_num := batch_num + 1;
    
    DELETE FROM cars_history
    WHERE id IN (
      SELECT id FROM cars_history
      WHERE changed_at < cutoff_date
      LIMIT batch_size
    );
    
    GET DIAGNOSTICS batch_deleted = ROW_COUNT;
    deleted_count := deleted_count + batch_deleted;
    
    -- Exit if no more rows to delete or max batches reached
    EXIT WHEN batch_deleted = 0 OR batch_num >= max_batches;
    
    -- Small pause between batches
    PERFORM pg_sleep(0.1);
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'deleted_count', deleted_count,
    'batches', batch_num,
    'cutoff_date', cutoff_date,
    'duration_seconds', EXTRACT(EPOCH FROM (clock_timestamp() - start_time)),
    'more_to_delete', batch_deleted > 0
  );
END;
$$;

-- Update cleanup_cars_history_daily() to use 60 days retention
CREATE OR REPLACE FUNCTION public.cleanup_cars_history_daily()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cutoff_date TIMESTAMP WITH TIME ZONE;
  deleted_count INTEGER := 0;
  batch_deleted INTEGER;
  batch_size INTEGER := 1000;
  max_batches INTEGER := 10;
  batch_num INTEGER := 0;
  start_time TIMESTAMP := clock_timestamp();
BEGIN
  -- Calculate cutoff date (60 days ago)
  cutoff_date := NOW() - INTERVAL '60 days';
  
  -- Delete in small batches for daily maintenance
  LOOP
    batch_num := batch_num + 1;
    
    DELETE FROM cars_history
    WHERE id IN (
      SELECT id FROM cars_history
      WHERE changed_at < cutoff_date
      LIMIT batch_size
    );
    
    GET DIAGNOSTICS batch_deleted = ROW_COUNT;
    deleted_count := deleted_count + batch_deleted;
    
    EXIT WHEN batch_deleted = 0 OR batch_num >= max_batches;
    
    PERFORM pg_sleep(0.05);
  END LOOP;
  
  -- Log the cleanup
  INSERT INTO system_logs (log_type, message, details)
  VALUES (
    'cleanup',
    'Daily cars_history cleanup completed',
    jsonb_build_object(
      'deleted_count', deleted_count,
      'cutoff_date', cutoff_date,
      'batches', batch_num
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'deleted_count', deleted_count,
    'batches', batch_num,
    'cutoff_date', cutoff_date,
    'duration_seconds', EXTRACT(EPOCH FROM (clock_timestamp() - start_time))
  );
END;
$$;

-- Update cleanup_old_logs() to use 60 days for cars_history
CREATE OR REPLACE FUNCTION public.cleanup_old_logs()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  system_logs_deleted INTEGER := 0;
  audit_logs_deleted INTEGER := 0;
  cars_history_deleted INTEGER := 0;
  start_time TIMESTAMP := clock_timestamp();
BEGIN
  -- Delete old system logs (older than 7 days)
  DELETE FROM system_logs
  WHERE created_at < NOW() - INTERVAL '7 days';
  GET DIAGNOSTICS system_logs_deleted = ROW_COUNT;
  
  -- Delete old audit logs (older than 30 days)
  DELETE FROM audit_logs
  WHERE created_at < NOW() - INTERVAL '30 days';
  GET DIAGNOSTICS audit_logs_deleted = ROW_COUNT;
  
  -- Delete old cars history (older than 60 days) - small batch for weekly cleanup
  DELETE FROM cars_history
  WHERE id IN (
    SELECT id FROM cars_history
    WHERE changed_at < NOW() - INTERVAL '60 days'
    LIMIT 10000
  );
  GET DIAGNOSTICS cars_history_deleted = ROW_COUNT;
  
  -- Log the cleanup action
  INSERT INTO system_logs (log_type, message, details)
  VALUES (
    'cleanup',
    'Weekly log cleanup completed',
    jsonb_build_object(
      'system_logs_deleted', system_logs_deleted,
      'audit_logs_deleted', audit_logs_deleted,
      'cars_history_deleted', cars_history_deleted,
      'duration_seconds', EXTRACT(EPOCH FROM (clock_timestamp() - start_time))
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'system_logs_deleted', system_logs_deleted,
    'audit_logs_deleted', audit_logs_deleted,
    'cars_history_deleted', cars_history_deleted,
    'duration_seconds', EXTRACT(EPOCH FROM (clock_timestamp() - start_time))
  );
END;
$$;

-- Add daily cron job for cleanup_cars_history_daily() at 4 AM UTC
SELECT cron.schedule(
  'daily-cars-history-cleanup',
  '0 4 * * *',
  $$SELECT public.cleanup_cars_history_daily()$$
);