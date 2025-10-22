-- Remove obsolete auction processing functions without proxy bid logic

-- Drop the three obsolete functions
DROP FUNCTION IF EXISTS public.process_ended_auctions();
DROP FUNCTION IF EXISTS public.process_specific_ended_auction(uuid);
DROP FUNCTION IF EXISTS public.process_ended_auctions_workflow();

-- Log the cleanup using valid enum value
INSERT INTO audit_logs (action, entity_type, entity_id, details)
VALUES (
  'delete',
  'system',
  '00000000-0000-0000-0000-000000000000',
  jsonb_build_object(
    'removed_functions', ARRAY[
      'process_ended_auctions()',
      'process_specific_ended_auction(uuid)',
      'process_ended_auctions_workflow()'
    ],
    'reason', 'Consolidating to process_ended_auctions_securely() with proxy bid logic and race condition protection',
    'timestamp', NOW()
  )
);