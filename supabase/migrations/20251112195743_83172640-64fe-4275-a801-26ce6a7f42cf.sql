-- Fix test cleanup function - remove VACUUM to avoid transaction block error
CREATE OR REPLACE FUNCTION test_cleanup_small()
RETURNS jsonb AS $$
DECLARE
  system_logs_deleted INTEGER := 0;
  batch_size INTEGER := 5000;
  max_total_deletes INTEGER := 10000;
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
'Test function to verify cleanup batching works. Deletes max 10K old logs. Note: VACUUM removed to avoid transaction block errors during testing.';