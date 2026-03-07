

# Execute Auction Restoration Directly

The edge function needs to be deployed first (no recent logs found), then I'll call it directly using the curl tool — no browser console needed.

## Steps

1. **Deploy the `admin-api` edge function** with the updated `bulkRestoreAuctions` logic (cleanup of `dealer_won_vehicles`, `auction_results`, and reset `awaiting_seller_decision`).

2. **Call the edge function directly** via `supabase--curl_edge_functions` with:
   - Action: `bulkRestoreAuctions`
   - Params: the 104 car IDs + end time `2026-03-14T13:00:00Z`
   - Your logged-in session will provide the admin auth token automatically.

3. **Verify the results** by querying the database to confirm:
   - 104 cars now have `auction_status = 'active'` and `auction_end_time = '2026-03-14T13:00:00Z'`
   - `dealer_won_vehicles` records cleaned up
   - `auction_results` records cleaned up
   - `awaiting_seller_decision` set to `false`

## No code changes needed
Everything is already in place from the previous edits. This is purely execution.

