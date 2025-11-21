
-- Fix extend_auction_time function to handle both 'active' and 'running' statuses
CREATE OR REPLACE FUNCTION extend_auction_time(
  p_car_id uuid,
  p_hours_to_add numeric,
  p_extension_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_schedule_id uuid;
  v_old_end_time timestamptz;
  v_new_end_time timestamptz;
  v_auction_status text;
  v_schedule_status text;
  v_result jsonb;
BEGIN
  -- Get current auction details (check for BOTH 'active' AND 'running' statuses)
  SELECT 
    c.auction_end_time, 
    c.auction_status,
    asch.id,
    asch.status
  INTO 
    v_old_end_time, 
    v_auction_status,
    v_schedule_id,
    v_schedule_status
  FROM cars c
  LEFT JOIN auction_schedules asch ON c.id = asch.car_id 
    AND asch.status IN ('active', 'running')
  WHERE c.id = p_car_id;
  
  -- Validate auction exists
  IF v_old_end_time IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Auction not found'
    );
  END IF;
  
  -- Validate auction is active
  IF v_auction_status != 'active' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Auction is not active (current status: ' || v_auction_status || ')'
    );
  END IF;
  
  -- Validate hours to add is positive
  IF p_hours_to_add <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Hours to add must be greater than 0'
    );
  END IF;
  
  -- Calculate new end time
  v_new_end_time := v_old_end_time + (p_hours_to_add || ' hours')::interval;
  
  -- Validate new end time is after current time
  IF v_new_end_time <= NOW() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'New end time must be in the future'
    );
  END IF;
  
  -- Update cars table
  UPDATE cars
  SET 
    auction_end_time = v_new_end_time,
    is_manually_controlled = true,
    updated_at = NOW()
  WHERE id = p_car_id;
  
  -- Update auction_schedules table if schedule exists
  IF v_schedule_id IS NOT NULL THEN
    UPDATE auction_schedules
    SET 
      end_time = v_new_end_time,
      is_manually_controlled = true,
      updated_at = NOW(),
      last_status_change = NOW(),
      notes = COALESCE(notes || E'\n\n', '') || 
              '🕐 Extended at ' || TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI:SS UTC') || 
              E'\n  From: ' || TO_CHAR(v_old_end_time, 'YYYY-MM-DD HH24:MI:SS UTC') || 
              E'\n  To: ' || TO_CHAR(v_new_end_time, 'YYYY-MM-DD HH24:MI:SS UTC') ||
              E'\n  Duration: ' || p_hours_to_add || ' hours' ||
              CASE WHEN p_extension_reason IS NOT NULL 
                THEN E'\n  Reason: ' || p_extension_reason 
                ELSE '' 
              END
    WHERE id = v_schedule_id;
  END IF;
  
  -- Log the extension in audit_logs
  INSERT INTO audit_logs (
    action, 
    entity_type, 
    entity_id, 
    user_id, 
    details
  ) VALUES (
    'extend_auction',
    'auction',
    p_car_id,
    auth.uid(),
    jsonb_build_object(
      'car_id', p_car_id,
      'schedule_id', v_schedule_id,
      'old_end_time', v_old_end_time,
      'new_end_time', v_new_end_time,
      'hours_added', p_hours_to_add,
      'extension_minutes', EXTRACT(EPOCH FROM (v_new_end_time - v_old_end_time)) / 60,
      'reason', p_extension_reason,
      'extended_by', auth.uid()
    )
  );
  
  -- Return success with details
  RETURN jsonb_build_object(
    'success', true,
    'car_id', p_car_id,
    'schedule_id', v_schedule_id,
    'old_end_time', v_old_end_time,
    'new_end_time', v_new_end_time,
    'hours_added', p_hours_to_add
  );
END;
$$;
