

## Restore 109 Auctions via Edge Function Call

### What will happen
I will call the already-deployed `bulkRestoreAuctions` action on the `admin-api` edge function directly. This is the same method used previously -- no browser console needed.

### The call
A single POST request to the `admin-api` edge function with:
- **Action**: `bulkRestoreAuctions`
- **Car IDs**: All 109 cars whose `auction_end_time` was `2026-02-27 14:00:00+00`
- **New end time**: `2026-03-07T13:00:00Z` (Friday 7 March 2026 at 14:00 Polish time / CET)

### What it does (server-side, using service role)
1. Updates `cars` table: sets `auction_status = 'active'`, `status = 'available'`, `auction_end_time` to new date, `is_auction = true`
2. Updates `auction_schedules` table: sets `status = 'active'`, `end_time` to new date
3. Does NOT touch bids, `current_bid`, or proxy bids -- everything is preserved

### No code changes needed
This is purely a data operation using the existing edge function. No files will be created or modified.

### After execution
Active auctions should go from ~23 to ~132 (23 existing + 109 restored).
