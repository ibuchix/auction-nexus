

# Restore Today's Ended Auctions to Live (7 Days)

## Current State

- **107 total cars** ended today (March 7, 2026) at 13:00 UTC
- **3 cars have seller decisions** (all "declined") — these will be **excluded**:
  - `05d611bb` — 2008 AUDI TT S-Line (declined)
  - `93811756` — 2014 SKODA OCTAVIA (declined)
  - `4801bf7d` — 2018 TOYOTA AURIS (declined)
- **104 cars** will be restored to live for 7 days (ending March 14, 2026 at 13:00 UTC / 14:00 Polish time)

## Existing Infrastructure

The `bulkRestoreAuctions` action in `admin-api/index.ts` exists and works. However, it currently only updates the `cars` and `auction_schedules` tables. Per a previous finding, restorations also need to:

1. **Delete `dealer_won_vehicles` records** for the restored cars (16 cars have these currently)
2. **Delete `auction_results` records** for the restored cars (so they don't reappear in Auction Outcomes)
3. **Reset `awaiting_seller_decision`** flag to `false`

The current code already sets `awaiting_seller_decision` implicitly via the cars update, but does NOT clean up `dealer_won_vehicles` or `auction_results`.

## Plan

### 1. Update `admin-api/index.ts` — `bulkRestoreAuctions` action
Add cleanup steps before the cars update:
- Delete from `dealer_won_vehicles` WHERE `car_id` IN the provided carIds
- Delete from `auction_results` WHERE `car_id` IN the provided carIds
- Add `awaiting_seller_decision: false` to the cars update (already partially there)

### 2. Update `src/utils/restoreAuctions.ts`
Replace the hardcoded car IDs and end time with the new 104 car IDs and end time of `2026-03-14T13:00:00Z`.

## Files to Change

| File | Change |
|------|--------|
| `supabase/functions/admin-api/index.ts` | Add `dealer_won_vehicles` and `auction_results` cleanup to `bulkRestoreAuctions` |
| `src/utils/restoreAuctions.ts` | Update car IDs list (104 cars) and end time to March 14 |

## Execution
After deploying, the restore will be triggered from the browser console via `restoreAuctionsToLive()`.

