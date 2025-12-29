
-- Fix the trigger that's causing the cars_history explosion
-- The issue: enforce_car_ownership_integrity trigger inserts on EVERY update
-- The fix: Only insert when status, seller_id, or auction_status actually changes

CREATE OR REPLACE FUNCTION public.enforce_car_ownership_integrity()
RETURNS TRIGGER AS $$
BEGIN
  -- If seller_id is being changed on a non-draft car, prevent the change
  IF OLD.seller_id IS NOT NULL 
     AND NEW.seller_id != OLD.seller_id 
     AND OLD.status != 'draft' 
     AND OLD.status IS NOT NULL THEN
    RAISE EXCEPTION 'Cannot change ownership of a published car listing (ID: %)', OLD.id
      USING HINT = 'Car listings that are no longer drafts must maintain their original ownership.';
  END IF;

  -- ONLY record history when there's a MEANINGFUL change
  -- Skip if only updated_at, current_bid, or other frequently-changing fields changed
  IF (OLD.status IS DISTINCT FROM NEW.status) OR 
     (OLD.seller_id IS DISTINCT FROM NEW.seller_id) OR
     (OLD.auction_status IS DISTINCT FROM NEW.auction_status) THEN
    
    INSERT INTO public.cars_history(
      car_id,
      seller_id,
      status,
      previous_status,
      changed_by,
      change_type,
      metadata
    ) VALUES (
      NEW.id,
      NEW.seller_id,
      NEW.status,
      OLD.status,
      auth.uid(),
      CASE 
        WHEN OLD.status = 'draft' AND NEW.status != 'draft' THEN 'published'
        WHEN OLD.status IS DISTINCT FROM NEW.status THEN 'status_changed'
        WHEN OLD.auction_status IS DISTINCT FROM NEW.auction_status THEN 'auction_status_changed'
        WHEN OLD.seller_id IS DISTINCT FROM NEW.seller_id THEN 'ownership_changed'
        ELSE 'updated'
      END,
      jsonb_build_object(
        'old_seller_id', OLD.seller_id,
        'new_seller_id', NEW.seller_id,
        'old_status', OLD.status,
        'new_status', NEW.status,
        'old_auction_status', OLD.auction_status,
        'new_auction_status', NEW.auction_status
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create a dedicated daily cleanup function for cars_history with better batching
CREATE OR REPLACE FUNCTION public.cleanup_cars_history_daily()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET statement_timeout = '300s'  -- 5 minutes timeout
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER := 0;
  batch_deleted INTEGER;
  batch_size INTEGER := 5000;  -- Smaller batches for faster commits
  max_iterations INTEGER := 100;  -- Safety limit
  iteration INTEGER := 0;
  cutoff_date TIMESTAMP WITH TIME ZONE;
BEGIN
  cutoff_date := NOW() - INTERVAL '90 days';
  
  -- Delete in smaller batches with brief pauses
  LOOP
    DELETE FROM cars_history 
    WHERE id IN (
      SELECT id FROM cars_history 
      WHERE changed_at < cutoff_date 
      LIMIT batch_size
    );
    
    GET DIAGNOSTICS batch_deleted = ROW_COUNT;
    deleted_count := deleted_count + batch_deleted;
    iteration := iteration + 1;
    
    -- Exit conditions
    EXIT WHEN batch_deleted < batch_size;  -- No more records to delete
    EXIT WHEN iteration >= max_iterations;  -- Safety limit reached
    
    -- Brief pause to reduce lock contention
    PERFORM pg_sleep(0.05);
  END LOOP;
  
  -- Log the cleanup
  INSERT INTO system_logs (level, category, message, context)
  VALUES (
    'info',
    'cleanup',
    format('Daily cars_history cleanup completed: %s records deleted in %s batches', deleted_count, iteration),
    jsonb_build_object(
      'deleted_count', deleted_count,
      'batches', iteration,
      'cutoff_date', cutoff_date
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'deleted_count', deleted_count,
    'batches_processed', iteration,
    'cutoff_date', cutoff_date
  );
END;
$$;

-- Create a one-time aggressive cleanup function for the backlog
CREATE OR REPLACE FUNCTION public.cleanup_cars_history_backlog()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET statement_timeout = '600s'  -- 10 minutes for initial backlog
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER := 0;
  batch_deleted INTEGER;
  batch_size INTEGER := 10000;
  max_iterations INTEGER := 500;  -- Allow more iterations for backlog
  iteration INTEGER := 0;
  cutoff_date TIMESTAMP WITH TIME ZONE;
  start_time TIMESTAMP;
BEGIN
  start_time := clock_timestamp();
  cutoff_date := NOW() - INTERVAL '90 days';
  
  LOOP
    DELETE FROM cars_history 
    WHERE id IN (
      SELECT id FROM cars_history 
      WHERE changed_at < cutoff_date 
      LIMIT batch_size
    );
    
    GET DIAGNOSTICS batch_deleted = ROW_COUNT;
    deleted_count := deleted_count + batch_deleted;
    iteration := iteration + 1;
    
    EXIT WHEN batch_deleted < batch_size;
    EXIT WHEN iteration >= max_iterations;
    EXIT WHEN clock_timestamp() > start_time + INTERVAL '9 minutes';  -- Safety timeout
    
    PERFORM pg_sleep(0.02);
  END LOOP;
  
  INSERT INTO system_logs (level, category, message, context)
  VALUES (
    'info',
    'cleanup',
    format('Backlog cleanup: %s records deleted in %s batches, took %s', 
           deleted_count, iteration, clock_timestamp() - start_time),
    jsonb_build_object(
      'deleted_count', deleted_count,
      'batches', iteration,
      'duration', extract(epoch from (clock_timestamp() - start_time))
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'deleted_count', deleted_count,
    'batches_processed', iteration,
    'duration_seconds', extract(epoch from (clock_timestamp() - start_time)),
    'more_to_delete', batch_deleted >= batch_size
  );
END;
$$;
