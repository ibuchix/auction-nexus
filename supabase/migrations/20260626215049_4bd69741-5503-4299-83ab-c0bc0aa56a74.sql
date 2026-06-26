
CREATE OR REPLACE FUNCTION public.admin_reopen_auction(
  p_car_id uuid,
  p_hours_to_add numeric DEFAULT 168,
  p_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_status text;
  v_old_end timestamptz;
  v_new_end timestamptz;
  v_schedule_id uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Forbidden: admin role required');
  END IF;

  IF p_hours_to_add <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Hours to add must be greater than 0');
  END IF;

  SELECT auction_status, auction_end_time
    INTO v_old_status, v_old_end
  FROM cars WHERE id = p_car_id;

  IF v_old_status IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Car not found');
  END IF;

  IF v_old_status NOT IN ('ended','sold','cancelled','expired','closed') THEN
    RETURN jsonb_build_object('success', false,
      'error', 'Auction is not in a reopenable state (current: ' || v_old_status || ')');
  END IF;

  v_new_end := now() + (p_hours_to_add || ' hours')::interval;

  -- Clear winner records so reopen does not conflict
  DELETE FROM dealer_won_vehicles WHERE car_id = p_car_id;
  DELETE FROM auction_results WHERE car_id = p_car_id;

  -- Reactivate latest schedule, or create one if none exists
  SELECT id INTO v_schedule_id
  FROM auction_schedules
  WHERE car_id = p_car_id
  ORDER BY updated_at DESC NULLS LAST, created_at DESC
  LIMIT 1;

  IF v_schedule_id IS NOT NULL THEN
    UPDATE auction_schedules
    SET status = 'active',
        end_time = v_new_end,
        is_manually_controlled = true,
        last_status_change = now(),
        updated_at = now(),
        notes = COALESCE(notes || E'\n\n', '') ||
                '🔄 Reopened by admin on ' || to_char(now(),'YYYY-MM-DD HH24:MI:SS UTC') ||
                E'\n  Previous status: ' || v_old_status ||
                E'\n  New end: ' || to_char(v_new_end,'YYYY-MM-DD HH24:MI:SS UTC') ||
                E'\n  Duration: ' || p_hours_to_add || ' hours' ||
                CASE WHEN p_reason IS NOT NULL THEN E'\n  Reason: ' || p_reason ELSE '' END
    WHERE id = v_schedule_id;
  ELSE
    INSERT INTO auction_schedules (car_id, status, start_time, end_time, is_manually_controlled, last_status_change)
    VALUES (p_car_id, 'active', now(), v_new_end, true, now())
    RETURNING id INTO v_schedule_id;
  END IF;

  UPDATE cars
  SET auction_status = 'active',
      auction_end_time = v_new_end,
      is_manually_controlled = true,
      updated_at = now()
  WHERE id = p_car_id;

  INSERT INTO audit_logs (action, entity_type, entity_id, user_id, details)
  VALUES (
    'reopen_auction', 'auction', p_car_id, auth.uid(),
    jsonb_build_object(
      'car_id', p_car_id,
      'schedule_id', v_schedule_id,
      'previous_status', v_old_status,
      'old_end_time', v_old_end,
      'new_end_time', v_new_end,
      'hours_added', p_hours_to_add,
      'reason', p_reason
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'car_id', p_car_id,
    'schedule_id', v_schedule_id,
    'previous_status', v_old_status,
    'old_end_time', v_old_end,
    'new_end_time', v_new_end,
    'hours_added', p_hours_to_add
  );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_reopen_auction(uuid, numeric, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_reopen_auction(uuid, numeric, text) TO authenticated;
