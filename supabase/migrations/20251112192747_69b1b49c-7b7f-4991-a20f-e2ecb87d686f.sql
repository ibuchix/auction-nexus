-- Create unified weekly log cleanup function
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS jsonb AS $$
DECLARE
  system_logs_deleted INTEGER;
  cars_history_deleted INTEGER;
  audit_logs_deleted INTEGER;
  batch_size INTEGER := 50000;
  rows_affected INTEGER;
BEGIN
  -- Log start
  RAISE NOTICE 'Starting weekly log cleanup (90-day retention)';
  
  -- Initialize counters
  system_logs_deleted := 0;
  cars_history_deleted := 0;
  audit_logs_deleted := 0;
  
  -- ==========================================
  -- CLEANUP system_logs (largest table)
  -- ==========================================
  LOOP
    DELETE FROM system_logs 
    WHERE id IN (
      SELECT id FROM system_logs 
      WHERE created_at < NOW() - INTERVAL '90 days'
      LIMIT batch_size
    );
    
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    system_logs_deleted := system_logs_deleted + rows_affected;
    
    EXIT WHEN rows_affected < batch_size;
    
    -- Small pause between batches (100ms)
    PERFORM pg_sleep(0.1);
  END LOOP;
  
  -- ==========================================
  -- CLEANUP cars_history
  -- ==========================================
  LOOP
    DELETE FROM cars_history 
    WHERE id IN (
      SELECT id FROM cars_history 
      WHERE changed_at < NOW() - INTERVAL '90 days'
      LIMIT batch_size
    );
    
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    cars_history_deleted := cars_history_deleted + rows_affected;
    
    EXIT WHEN rows_affected < batch_size;
    
    PERFORM pg_sleep(0.1);
  END LOOP;
  
  -- ==========================================
  -- CLEANUP audit_logs (smallest, no batching needed)
  -- ==========================================
  DELETE FROM audit_logs 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS audit_logs_deleted = ROW_COUNT;
  
  -- ==========================================
  -- VACUUM to reclaim disk space
  -- ==========================================
  EXECUTE 'VACUUM ANALYZE system_logs';
  EXECUTE 'VACUUM ANALYZE cars_history';
  EXECUTE 'VACUUM ANALYZE audit_logs';
  
  -- Return summary
  RAISE NOTICE 'Cleanup complete: system_logs=%, cars_history=%, audit_logs=%', 
    system_logs_deleted, cars_history_deleted, audit_logs_deleted;
  
  RETURN jsonb_build_object(
    'success', true,
    'deleted', jsonb_build_object(
      'system_logs', system_logs_deleted,
      'cars_history', cars_history_deleted,
      'audit_logs', audit_logs_deleted,
      'total', system_logs_deleted + cars_history_deleted + audit_logs_deleted
    ),
    'cleaned_at', NOW()
  );
  
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Cleanup failed: %', SQLERRM;
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule weekly cleanup: Every Saturday at 2 AM UTC
SELECT cron.schedule(
  'weekly-log-cleanup',
  '0 2 * * 6',
  'SELECT cleanup_old_logs();'
);