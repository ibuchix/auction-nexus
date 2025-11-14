-- Bulk Re-Extension Script for Cars Affected by Enum Bug
-- This script identifies cars that had failed extension attempts and re-extends them

-- Step 1: Identify affected cars from audit logs
WITH failed_extensions AS (
  SELECT DISTINCT
    (details->>'car_id')::uuid as car_id,
    (details->>'hours_extended')::integer as hours_extended,
    details->>'reason' as reason,
    created_at
  FROM audit_logs
  WHERE action = 'extend_auction'
    AND created_at >= '2024-11-14'::timestamp  -- Adjust date as needed
    AND created_at < (SELECT created_at FROM audit_logs WHERE details->>'migration' = 'enum_fix' LIMIT 1)  -- Before enum fix
  ORDER BY created_at DESC
),

-- Step 2: Check which cars still need extension (their end_time hasn't been updated)
cars_needing_extension AS (
  SELECT 
    fe.car_id,
    fe.hours_extended,
    fe.reason,
    c.auction_end_time as current_end_time,
    c.auction_status,
    c.title,
    asch.end_time as schedule_end_time
  FROM failed_extensions fe
  JOIN cars c ON c.id = fe.car_id
  LEFT JOIN auction_schedules asch ON asch.car_id = c.id
  WHERE c.auction_end_time < NOW() + interval '12 hours'  -- Cars that should still be active but aren't
    OR (c.auction_status = 'active' AND c.auction_end_time < NOW())
)

-- Step 3: Display affected cars for review
SELECT 
  car_id,
  title,
  current_end_time,
  schedule_end_time,
  auction_status,
  hours_extended,
  reason,
  'NEEDS RE-EXTENSION' as status
FROM cars_needing_extension;

-- Step 4: Re-extend all affected cars (UNCOMMENT TO EXECUTE)
-- DO $$
-- DECLARE
--   car_record RECORD;
--   extension_hours INTEGER := 24;  -- Default extension hours
--   extension_reason TEXT := 'Recovery from enum bug - re-extending previously failed auctions';
-- BEGIN
--   FOR car_record IN 
--     SELECT car_id FROM cars_needing_extension
--   LOOP
--     -- Call the extend_auction_time function for each car
--     PERFORM extend_auction_time(
--       car_record.car_id::text,
--       extension_hours,
--       extension_reason
--     );
--     
--     RAISE NOTICE 'Re-extended car: %', car_record.car_id;
--   END LOOP;
-- END $$;

-- Step 5: Verification Query (Run after re-extension)
-- SELECT 
--   c.id,
--   c.title,
--   c.auction_status,
--   c.auction_end_time,
--   asch.end_time as schedule_end_time,
--   asch.status as schedule_status,
--   COUNT(al.id) as extension_attempts
-- FROM cars c
-- LEFT JOIN auction_schedules asch ON asch.car_id = c.id
-- LEFT JOIN audit_logs al ON al.details->>'car_id' = c.id::text AND al.action = 'extend_auction'
-- WHERE c.id IN (SELECT car_id FROM cars_needing_extension)
-- GROUP BY c.id, c.title, c.auction_status, c.auction_end_time, asch.end_time, asch.status;
