-- BULK AUCTION RECOVERY: Extend 217 auctions from Dec 12 to Dec 19, 2025
-- Preserves all existing bids

-- 1. Log the recovery operation first
INSERT INTO audit_logs (action, entity_type, entity_id, details)
VALUES (
  'auction_recovery',
  'system',
  '00000000-0000-0000-0000-000000000000'::uuid,
  jsonb_build_object(
    'operation', 'bulk_auction_extension_v2',
    'original_end_time', '2025-12-12 14:00:00+00',
    'new_end_time', '2025-12-19 14:00:00+00',
    'reason', 'Second weekly extension - reactivate ended auctions',
    'executed_at', NOW()
  )
);

-- 2. Delete dealer_won_vehicles for affected cars (removes premature "won" state)
DELETE FROM dealer_won_vehicles
WHERE car_id IN (
  SELECT id FROM cars WHERE auction_end_time = '2025-12-12 14:00:00+00'
);

-- 3. Delete auction_results for affected cars (removes premature results)
DELETE FROM auction_results
WHERE car_id IN (
  SELECT id FROM cars WHERE auction_end_time = '2025-12-12 14:00:00+00'
);

-- 4. Reactivate cars table (217 cars)
UPDATE cars
SET 
  auction_status = 'active',
  status = 'active',
  auction_end_time = '2025-12-19 14:00:00+00',
  is_manually_controlled = true,
  awaiting_seller_decision = false,
  updated_at = NOW()
WHERE auction_end_time = '2025-12-12 14:00:00+00';

-- 5. Reactivate auction_schedules (using 'active' status for proper UI visibility)
UPDATE auction_schedules
SET 
  status = 'active',
  end_time = '2025-12-19 14:00:00+00',
  is_manually_controlled = true,
  last_status_change = NOW(),
  updated_at = NOW(),
  notes = COALESCE(notes, '') || ' | RECOVERY v2: Extended to Dec 19, 2025 14:00 UTC'
WHERE end_time = '2025-12-12 14:00:00+00';