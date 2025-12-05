-- BULK AUCTION RECOVERY: Reactivate 207 auctions that ended on Dec 5, 2025 14:00
-- Extends them to Dec 12, 2025 14:00 while preserving all bids

-- 1. Create audit log BEFORE making changes
INSERT INTO audit_logs (action, entity_type, entity_id, details)
VALUES (
  'auction_recovery',
  'system',
  '00000000-0000-0000-0000-000000000000'::uuid,
  jsonb_build_object(
    'operation', 'bulk_recovery_start',
    'original_end_time', '2025-12-05 14:00:00+00',
    'new_end_time', '2025-12-12 14:00:00+00',
    'reason', 'Admin forgot to extend auctions before they ended',
    'executed_at', NOW()
  )
);

-- 2. Delete dealer_won_vehicles records (allows reprocessing later)
DELETE FROM dealer_won_vehicles
WHERE car_id IN (
  SELECT id FROM cars
  WHERE auction_end_time >= '2025-12-05 13:00:00+00'
    AND auction_end_time <= '2025-12-05 15:00:00+00'
);

-- 3. Delete auction_results records (allows reprocessing later)
DELETE FROM auction_results
WHERE car_id IN (
  SELECT id FROM cars
  WHERE auction_end_time >= '2025-12-05 13:00:00+00'
    AND auction_end_time <= '2025-12-05 15:00:00+00'
);

-- 4. Reactivate cars with new end time
UPDATE cars
SET 
  auction_status = 'active',
  status = 'active',
  auction_end_time = '2025-12-12 14:00:00+00',
  is_manually_controlled = true,
  awaiting_seller_decision = false,
  updated_at = NOW()
WHERE auction_end_time >= '2025-12-05 13:00:00+00'
  AND auction_end_time <= '2025-12-05 15:00:00+00';

-- 5. Reactivate auction schedules
UPDATE auction_schedules
SET 
  status = 'running',
  end_time = '2025-12-12 14:00:00+00',
  is_manually_controlled = true,
  last_status_change = NOW(),
  updated_at = NOW(),
  notes = COALESCE(notes, '') || E'\n\n🔄 BULK RECOVERY: Reactivated on ' || NOW()::text || ' - Extended to Dec 12, 2025 14:00 UTC'
WHERE car_id IN (
  SELECT id FROM cars
  WHERE auction_end_time = '2025-12-12 14:00:00+00'
    AND is_manually_controlled = true
);

-- 6. Log completion with summary
INSERT INTO audit_logs (action, entity_type, entity_id, details)
VALUES (
  'auction_recovery',
  'system',
  '00000000-0000-0000-0000-000000000000'::uuid,
  jsonb_build_object(
    'operation', 'bulk_recovery_complete',
    'new_end_time', '2025-12-12 14:00:00+00',
    'bids_preserved', true,
    'reason', 'Admin recovery - forgot to extend before ending',
    'completed_at', NOW()
  )
);