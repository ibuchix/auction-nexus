-- Fix admin_end_auction_immediately to check for 'active' instead of 'running'
-- The auction_schedules table uses 'active' status, not 'running'

CREATE OR REPLACE FUNCTION admin_end_auction_immediately(p_car_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_role TEXT;
  v_car_status TEXT;
  v_schedule_id UUID;
  v_current_status TEXT;
  v_result JSONB;
BEGIN
  -- Check if user is admin
  SELECT role INTO v_user_role
  FROM profiles
  WHERE id = auth.uid();
  
  IF v_user_role != 'admin' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized: Admin access required'
    );
  END IF;

  -- Get current car status
  SELECT auction_status INTO v_car_status
  FROM cars
  WHERE id = p_car_id;

  IF v_car_status IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Car not found'
    );
  END IF;

  -- Get the active schedule
  SELECT id, status INTO v_schedule_id, v_current_status
  FROM auction_schedules
  WHERE car_id = p_car_id
    AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_schedule_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No active auction schedule found for this car'
    );
  END IF;

  -- Validate that auction is in a state that can be ended (FIXED: changed 'running' to 'active')
  IF v_current_status != 'active' OR v_car_status != 'active' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Auction must be active to end immediately'
    );
  END IF;

  -- Set the end time to now in the schedule
  UPDATE auction_schedules
  SET 
    end_time = NOW(),
    updated_at = NOW()
  WHERE id = v_schedule_id;

  -- Update the car's auction_end_time
  UPDATE cars
  SET 
    auction_end_time = NOW(),
    updated_at = NOW()
  WHERE id = p_car_id;

  -- Log the manual action
  INSERT INTO audit_logs (
    action,
    entity_type,
    entity_id,
    user_id,
    details
  ) VALUES (
    'auction_ended_manually',
    'auction_schedule',
    v_schedule_id,
    auth.uid(),
    jsonb_build_object(
      'car_id', p_car_id,
      'ended_at', NOW(),
      'method', 'admin_end_immediately'
    )
  );

  -- Call the existing close-ended-auctions logic
  -- This will handle winner determination, notifications, etc.
  PERFORM process_ended_auction(p_car_id);

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Auction ended successfully and processed',
    'ended_at', NOW()
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;