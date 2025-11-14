
-- One-time recovery: Reactivate and extend cars affected by enum bug
DO $$
DECLARE
  affected_cars uuid[] := ARRAY[
    '834eb1a2-e87b-429f-9daf-981c9567d213'::uuid,
    '6bba9234-11ff-45a8-8cfa-02f68d0713be'::uuid,
    'f6c2071e-c822-4dff-aa4f-627598460875'::uuid,
    '61a0c122-470c-41f7-a08f-19d056a9ec32'::uuid,
    '546d1531-3aaf-4074-9bab-744d0a4a15f6'::uuid,
    'd6a4dd02-44d1-4f4e-badb-d21d84a099df'::uuid,
    'd828603e-bb48-4f2b-85ff-4de8a7463518'::uuid,
    '662f47f8-3f78-4bcb-ac83-12f5ab14794a'::uuid,
    'ff98b396-d3f8-4228-bbf3-ef6ef03b3be9'::uuid,
    'c4983f88-5cb7-4790-9279-260612fec705'::uuid,
    '3d9f7aeb-4f72-4a76-a35c-7c895a3661ed'::uuid,
    '06670a47-b437-48e3-bcd3-11d38f8778c4'::uuid,
    'b6ac5a45-b9cb-46bc-a3d9-8756cfa1b831'::uuid,
    '1ef03df2-b8af-48fc-88bf-23cdf2b4b74f'::uuid
  ];
  car_id_item uuid;
  new_end_time timestamptz;
BEGIN
  -- Extend by 24 hours from now
  new_end_time := NOW() + interval '24 hours';
  
  FOREACH car_id_item IN ARRAY affected_cars
  LOOP
    -- Update cars table - reactivate and extend
    UPDATE cars 
    SET 
      auction_status = 'active',
      auction_end_time = new_end_time,
      is_manually_controlled = true,
      updated_at = NOW()
    WHERE id = car_id_item
      AND auction_status = 'ended';
    
    -- Update auction_schedules table
    UPDATE auction_schedules
    SET 
      status = 'active'::auction_schedule_status,
      end_time = new_end_time,
      is_manually_controlled = true,
      last_status_change = NOW(),
      updated_at = NOW(),
      notes = COALESCE(notes || E'\n', '') || 'Recovery: Reactivated and extended 24h due to enum bug (failed extension attempts) - ' || NOW()::text
    WHERE car_id = car_id_item
      AND status = 'completed'::auction_schedule_status;
    
    RAISE NOTICE 'Reactivated and extended car: %', car_id_item;
  END LOOP;
  
  RAISE NOTICE 'Successfully reactivated and extended % cars', array_length(affected_cars, 1);
END $$;
