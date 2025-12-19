-- Restore 15 auctions to live status (ending December 30th, 2025 at 14:00 Polish time)
-- Polish time is CET (UTC+1), so 14:00 CET = 13:00 UTC

-- Step 1: Log the recovery operation
INSERT INTO audit_logs (action, entity_type, entity_id, details)
VALUES (
  'auction_recovery',
  'bulk_auction_restore',
  NULL,
  jsonb_build_object(
    'car_count', 15,
    'new_end_time', '2025-12-30T13:00:00Z',
    'reason', 'Restore 15 specific auctions that ended prematurely on 2025-12-19',
    'restored_at', NOW()
  )
);

-- Step 2: Delete any dealer_won_vehicles records for these cars
DELETE FROM dealer_won_vehicles 
WHERE car_id IN (
  '0196e14b-0ad8-42e1-ae5f-00f3d30109e0',
  '6a506467-c7ed-4499-be84-2f84ae416f2f',
  '872fc101-b7f3-469a-a9b4-cf3e299842ae',
  '3a185e8b-05b3-4ae2-9ce4-36c035e9270e',
  'ba127619-fefc-4be6-950f-853e61ab2089',
  '736f55a1-ed7f-40de-883f-e50b672c87ca',
  'c9026b91-a88a-4eab-9019-50963e4307de',
  'd309184f-1db9-4d10-9e95-e425ac0b45d5',
  'e3c5b922-783b-4c01-9137-47d1f9fc1a0e',
  '09606a8f-237a-4961-9f85-8ce6a7b0347a',
  '54bb3cd5-83b4-48a9-a62b-06e53dcb5c84',
  'd12cb65d-dc65-4e27-afb7-24fd82d2d636',
  '4347b778-0492-4a6c-8040-a17b00c9052f',
  'b02e19b8-1ae4-472f-b091-401c644e3cc1',
  'b414141e-c726-411b-8d0a-c8ca540d0f57'
);

-- Step 3: Delete any auction_results records for these cars
DELETE FROM auction_results 
WHERE car_id IN (
  '0196e14b-0ad8-42e1-ae5f-00f3d30109e0',
  '6a506467-c7ed-4499-be84-2f84ae416f2f',
  '872fc101-b7f3-469a-a9b4-cf3e299842ae',
  '3a185e8b-05b3-4ae2-9ce4-36c035e9270e',
  'ba127619-fefc-4be6-950f-853e61ab2089',
  '736f55a1-ed7f-40de-883f-e50b672c87ca',
  'c9026b91-a88a-4eab-9019-50963e4307de',
  'd309184f-1db9-4d10-9e95-e425ac0b45d5',
  'e3c5b922-783b-4c01-9137-47d1f9fc1a0e',
  '09606a8f-237a-4961-9f85-8ce6a7b0347a',
  '54bb3cd5-83b4-48a9-a62b-06e53dcb5c84',
  'd12cb65d-dc65-4e27-afb7-24fd82d2d636',
  '4347b778-0492-4a6c-8040-a17b00c9052f',
  'b02e19b8-1ae4-472f-b091-401c644e3cc1',
  'b414141e-c726-411b-8d0a-c8ca540d0f57'
);

-- Step 4: Update cars table - restore to active auction status
UPDATE cars
SET 
  auction_status = 'active',
  status = 'active',
  auction_end_time = '2025-12-30 13:00:00+00',
  is_manually_controlled = true,
  awaiting_seller_decision = false,
  updated_at = NOW()
WHERE id IN (
  '0196e14b-0ad8-42e1-ae5f-00f3d30109e0',
  '6a506467-c7ed-4499-be84-2f84ae416f2f',
  '872fc101-b7f3-469a-a9b4-cf3e299842ae',
  '3a185e8b-05b3-4ae2-9ce4-36c035e9270e',
  'ba127619-fefc-4be6-950f-853e61ab2089',
  '736f55a1-ed7f-40de-883f-e50b672c87ca',
  'c9026b91-a88a-4eab-9019-50963e4307de',
  'd309184f-1db9-4d10-9e95-e425ac0b45d5',
  'e3c5b922-783b-4c01-9137-47d1f9fc1a0e',
  '09606a8f-237a-4961-9f85-8ce6a7b0347a',
  '54bb3cd5-83b4-48a9-a62b-06e53dcb5c84',
  'd12cb65d-dc65-4e27-afb7-24fd82d2d636',
  '4347b778-0492-4a6c-8040-a17b00c9052f',
  'b02e19b8-1ae4-472f-b091-401c644e3cc1',
  'b414141e-c726-411b-8d0a-c8ca540d0f57'
);

-- Step 5: Update auction_schedules table
UPDATE auction_schedules
SET 
  status = 'active',
  start_time = '2025-12-19 13:00:00+00',
  end_time = '2025-12-30 13:00:00+00',
  is_manually_controlled = true,
  last_status_change = NOW(),
  updated_at = NOW()
WHERE car_id IN (
  '0196e14b-0ad8-42e1-ae5f-00f3d30109e0',
  '6a506467-c7ed-4499-be84-2f84ae416f2f',
  '872fc101-b7f3-469a-a9b4-cf3e299842ae',
  '3a185e8b-05b3-4ae2-9ce4-36c035e9270e',
  'ba127619-fefc-4be6-950f-853e61ab2089',
  '736f55a1-ed7f-40de-883f-e50b672c87ca',
  'c9026b91-a88a-4eab-9019-50963e4307de',
  'd309184f-1db9-4d10-9e95-e425ac0b45d5',
  'e3c5b922-783b-4c01-9137-47d1f9fc1a0e',
  '09606a8f-237a-4961-9f85-8ce6a7b0347a',
  '54bb3cd5-83b4-48a9-a62b-06e53dcb5c84',
  'd12cb65d-dc65-4e27-afb7-24fd82d2d636',
  '4347b778-0492-4a6c-8040-a17b00c9052f',
  'b02e19b8-1ae4-472f-b091-401c644e3cc1',
  'b414141e-c726-411b-8d0a-c8ca540d0f57'
);