-- Manually end 2016 Audi A6 auction
DO $$
DECLARE
  target_car_id uuid := '1ef03df2-b8af-48fc-88bf-23cdf2b4b74f'::uuid;
  end_timestamp timestamptz := NOW();
BEGIN
  -- Update cars table - set to ended status
  UPDATE cars 
  SET 
    auction_status = 'ended',
    auction_end_time = end_timestamp,
    is_manually_controlled = true,
    updated_at = end_timestamp
  WHERE id = target_car_id
    AND auction_status = 'active';
  
  IF FOUND THEN
    RAISE NOTICE 'Successfully ended car auction in cars table: %', target_car_id;
  ELSE
    RAISE NOTICE 'Car not found or already ended: %', target_car_id;
  END IF;
  
  -- Update auction_schedules table - mark as completed
  UPDATE auction_schedules
  SET 
    status = 'completed'::auction_schedule_status,
    end_time = end_timestamp,
    is_manually_controlled = true,
    last_status_change = end_timestamp,
    updated_at = end_timestamp,
    notes = COALESCE(notes || E'\n', '') || 'Manually ended by admin on ' || end_timestamp::text
  WHERE car_id = target_car_id
    AND status = 'active'::auction_schedule_status;
  
  IF FOUND THEN
    RAISE NOTICE 'Successfully ended auction schedule: %', target_car_id;
  ELSE
    RAISE NOTICE 'Auction schedule not found or already completed: %', target_car_id;
  END IF;
  
  RAISE NOTICE '=== Manual Auction End Complete ===';
  RAISE NOTICE 'Car ID: %', target_car_id;
  RAISE NOTICE 'End Time: %', end_timestamp;
END $$;