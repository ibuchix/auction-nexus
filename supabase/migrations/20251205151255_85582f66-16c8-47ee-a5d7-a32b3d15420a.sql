-- Fix auction_schedules status from 'running' to 'active' for recovered auctions
-- This makes them visible in admin UI and to dealers

-- 1. Log the fix
INSERT INTO audit_logs (action, entity_type, entity_id, details)
VALUES (
  'auction_recovery',
  'system',
  '00000000-0000-0000-0000-000000000000'::uuid,
  jsonb_build_object(
    'operation', 'status_correction',
    'from_status', 'running',
    'to_status', 'active',
    'reason', 'Fix visibility - running status not recognized by UI and RLS',
    'executed_at', NOW()
  )
);

-- 2. Update auction_schedules from 'running' to 'active'
UPDATE auction_schedules
SET 
  status = 'active',
  updated_at = NOW()
WHERE status = 'running'
  AND end_time = '2025-12-12 14:00:00+00';