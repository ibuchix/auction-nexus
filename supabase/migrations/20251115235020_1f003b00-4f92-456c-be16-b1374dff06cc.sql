-- Create admin function to immediately end an active auction
-- This function sets the end_time to NOW() and triggers the normal auction end processing

CREATE OR REPLACE FUNCTION admin_end_auction_immediately(p_car_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_auction_schedule_id uuid;
  v_current_status text;
  v_car_status text;
  v_admin_user_id uuid;
  v_result jsonb;
BEGIN
  -- Get the current admin user
  v_admin_user_id := auth.uid();
  
  -- Verify admin role
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = v_admin_user_id 
    AND role = 'admin'
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized: Admin role required'
    );
  END IF;

  -- Get current auction schedule status and car status
  SELECT 
    asch.id,
    asch.status,
    c.auction_status
  INTO 
    v_auction_schedule_id,
    v_current_status,
    v_car_status
  FROM auction_schedules asch
  JOIN cars c ON c.id = asch.car_id
  WHERE asch.car_id = p_car_id
  ORDER BY asch.created_at DESC
  LIMIT 1;

  -- Verify auction exists
  IF v_auction_schedule_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No auction schedule found for this car'
    );
  END IF;

  -- Verify auction is active
  IF v_current_status != 'running' OR v_car_status != 'active' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', format('Auction is not active (schedule: %s, car: %s)', v_current_status, v_car_status)
    );
  END IF;

  -- Log the manual end action to audit logs
  INSERT INTO audit_logs (
    action,
    entity_type,
    entity_id,
    user_id,
    details
  ) VALUES (
    'admin_end_auction',
    'auction',
    p_car_id,
    v_admin_user_id,
    jsonb_build_object(
      'reason', 'Manual admin end',
      'original_end_time', (SELECT end_time FROM auction_schedules WHERE id = v_auction_schedule_id),
      'new_end_time', NOW(),
      'auction_schedule_id', v_auction_schedule_id
    )
  );

  -- Update auction schedule: set end_time to NOW() and mark as manually controlled
  UPDATE auction_schedules
  SET 
    end_time = NOW(),
    is_manually_controlled = true,
    notes = COALESCE(notes || E'\n\n', '') || format('[%s] Auction manually ended by admin', NOW()::text),
    updated_at = NOW()
  WHERE id = v_auction_schedule_id;

  -- Call the secure auction processing function
  -- This will handle all the end-of-auction logic: determine winner, calculate fees, create records, etc.
  BEGIN
    PERFORM process_ended_auctions_securely();
    
    -- Log success
    INSERT INTO audit_logs (
      action,
      entity_type,
      entity_id,
      user_id,
      details
    ) VALUES (
      'auction_processed',
      'auction',
      p_car_id,
      v_admin_user_id,
      jsonb_build_object(
        'processed_at', NOW(),
        'method', 'admin_manual_end',
        'success', true
      )
    );

    RETURN jsonb_build_object(
      'success', true,
      'message', 'Auction ended successfully and processed',
      'car_id', p_car_id,
      'auction_schedule_id', v_auction_schedule_id
    );
    
  EXCEPTION WHEN OTHERS THEN
    -- Log processing error
    INSERT INTO audit_logs (
      action,
      entity_type,
      entity_id,
      user_id,
      details
    ) VALUES (
      'auction_processing_error',
      'auction',
      p_car_id,
      v_admin_user_id,
      jsonb_build_object(
        'error', SQLERRM,
        'method', 'admin_manual_end'
      )
    );
    
    RETURN jsonb_build_object(
      'success', false,
      'error', format('Failed to process auction: %s', SQLERRM)
    );
  END;
END;
$$;

-- Grant execute permission to authenticated users (function internally checks for admin role)
GRANT EXECUTE ON FUNCTION admin_end_auction_immediately(uuid) TO authenticated;

-- Add comment
COMMENT ON FUNCTION admin_end_auction_immediately IS 
'Admin function to immediately end an active auction. Sets end_time to NOW() and triggers normal auction processing flow.';