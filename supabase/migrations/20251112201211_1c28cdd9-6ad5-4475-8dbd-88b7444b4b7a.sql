-- Manual cleanup function for immediate log deletion
-- Can be called anytime without interfering with weekly cron job
CREATE OR REPLACE FUNCTION cleanup_logs_manual(
  max_rows_to_delete INTEGER DEFAULT 100000,
  batch_size INTEGER DEFAULT 5000
)
RETURNS jsonb AS $$
DECLARE
  system_logs_deleted INTEGER := 0;
  cars_history_deleted INTEGER := 0;
  audit_logs_deleted INTEGER := 0;
  rows_affected INTEGER;
  total_deleted INTEGER := 0;
  batch_count INTEGER := 0;
  start_time TIMESTAMP := NOW();
BEGIN
  RAISE NOTICE 'Starting MANUAL cleanup (max % rows, 90-day retention)', max_rows_to_delete;
  
  -- Delete from system_logs (largest table)
  LOOP
    EXIT WHEN total_deleted >= max_rows_to_delete;
    
    DELETE FROM system_logs 
    WHERE id IN (
      SELECT id FROM system_logs 
      WHERE created_at < NOW() - INTERVAL '90 days'
      LIMIT LEAST(batch_size, max_rows_to_delete - total_deleted)
    );
    
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    system_logs_deleted := system_logs_deleted + rows_affected;
    total_deleted := total_deleted + rows_affected;
    batch_count := batch_count + 1;
    
    RAISE NOTICE 'Batch %: deleted % rows (total: %/%)', 
      batch_count, rows_affected, total_deleted, max_rows_to_delete;
    
    EXIT WHEN rows_affected = 0 OR rows_affected < batch_size;
    
    -- Small pause between batches to avoid overwhelming the database
    PERFORM pg_sleep(0.1);
  END LOOP;
  
  RAISE NOTICE 'Manual cleanup complete: % rows deleted in % batches', 
    total_deleted, batch_count;
  
  RETURN jsonb_build_object(
    'success', true,
    'manual_cleanup', true,
    'deleted', jsonb_build_object(
      'system_logs', system_logs_deleted,
      'total', total_deleted
    ),
    'batches_executed', batch_count,
    'avg_rows_per_batch', CASE WHEN batch_count > 0 
      THEN total_deleted::numeric / batch_count 
      ELSE 0 END,
    'duration_seconds', EXTRACT(EPOCH FROM (NOW() - start_time)),
    'cleaned_at', NOW()
  );
  
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Manual cleanup failed: %', SQLERRM;
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'deleted_before_error', total_deleted,
    'batches_completed', batch_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

COMMENT ON FUNCTION cleanup_logs_manual(INTEGER, INTEGER) IS 
'Manual cleanup function for immediate log deletion. Accepts row limit and batch size. Does not interfere with scheduled weekly cleanup. Usage: SELECT cleanup_logs_manual(100000, 5000);';