

## Restore 109 Auctions That Ended Today at 14:00

### What happened
109 cars had their auctions end at 14:00 on 27 February 2026. 90 still show as "active" (expired but not yet processed) and 19 have already been marked as "ended". All need to be restored to live auction status.

### Approach
Use the existing `bulkRestoreAuctions` edge function (already deployed in admin-api) which:
- Sets `auction_status` back to `active`
- Updates `auction_end_time` to the new date
- Updates corresponding `auction_schedules` to `active` with new end time
- Preserves all existing bids and `current_bid` values (does not touch them)

### New auction end time
**Friday 7 March 2026 at 14:00 Polish time** (CET, UTC+1) = `2026-03-07T13:00:00Z`

### File to update

**`src/utils/restoreAuctions.ts`** -- Replace the old car IDs with all 109 car IDs from today's batch, update the end time to `2026-03-07T13:00:00Z`, and update the comments.

### How to run it
After the file is updated, you can run `restoreAuctionsToLive()` from the browser console (it's exposed on `window`), or navigate to a page that imports it. The function calls the existing `bulkRestoreAuctions` admin-api action which handles everything server-side using the service role key.

### What gets preserved
- All existing bids remain untouched
- `current_bid` values stay as they are
- Proxy bids remain active
- Dealers can continue bidding as normal
