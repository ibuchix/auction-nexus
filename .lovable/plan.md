
## Admin Accept Bid on Behalf of Seller

### How the Current Flow Works

When a seller accepts or declines a bid, a row is inserted into the `seller_bid_decisions` table:

```text
seller_bid_decisions
  - car_id
  - seller_id (the seller's user_id)
  - decision ("accepted" or "declined")
  - highest_bid (the bid amount)
  - highest_bid_dealer_id (the winning dealer)
  - auction_result_id (link to auction_results)
```

This INSERT triggers the following chain:

1. **DB trigger** `trigger_notify_seller_accepted_bid` -- creates an admin notification ("Seller Accepted Bid")
2. **Cron job** `sync_auction_results_with_seller_decisions` -- updates `auction_results.seller_decision` and sets `admin_review_status` to "reviewed"
3. **AuctionOutcomes page** reads from `seller_bid_decisions` to show the decision badge, and enables/disables email buttons based on the decision

So the entire downstream system is driven by **one INSERT into `seller_bid_decisions`**. If we insert the same row from the admin side, everything works identically.

### What We Will Build

**1. New edge function action: `adminAcceptBidForSeller`** (in `admin-api/index.ts`)

This action will:
- Look up the car and verify the auction has ended with a winning bid
- Look up the highest bid and dealer from `dealer_won_vehicles` or `bids`
- Look up the `auction_results` record for linking
- Insert a row into `seller_bid_decisions` with the seller's `seller_id`, `car_id`, `decision`, `highest_bid`, and `highest_bid_dealer_id`
- Update `cars.awaiting_seller_decision = false` to mark it as resolved
- The existing DB trigger will automatically create the admin notification
- The existing cron job will automatically sync `auction_results.seller_decision`

Parameters: `{ carId: string, decision: "accepted" | "declined" }`

**2. UI: Add "Accept Bid" and "Decline Bid" buttons to the AuctionOutcomeCard** (in `AuctionOutcomes.tsx`)

- Only visible when `decision` is null (awaiting seller decision)
- Includes a confirmation dialog before executing
- Calls the new edge function action
- Refreshes the data after success

### Technical Details

**Edge function addition** (`supabase/functions/admin-api/index.ts`):

New case `adminAcceptBidForSeller` added to the switch block:

```typescript
case 'adminAcceptBidForSeller': {
  const { carId, decision } = params
  // 1. Validate inputs
  // 2. Get car details (seller_id, current_bid, awaiting_seller_decision)
  // 3. Get dealer_won_vehicles record (for highest_bid_dealer_id)
  // 4. Get auction_results record (for auction_result_id)
  // 5. Check no decision already exists
  // 6. Insert into seller_bid_decisions
  // 7. Update cars.awaiting_seller_decision = false
  // 8. Return success with summary
}
```

**UI addition** (`src/pages/admin/AuctionOutcomes.tsx`):

Add two buttons to the `AuctionOutcomeCard` component, shown only when `decision` is null:

```text
[Accept Bid for Seller]  [Decline Bid for Seller]
```

Each button shows a confirmation dialog:
- "Are you sure you want to ACCEPT the bid of PLN X,XXX for this vehicle on behalf of the seller?"
- On confirm, calls `supabase.functions.invoke('admin-api', { body: { action: 'adminAcceptBidForSeller', params: { carId, decision: 'accepted' } } })`
- Shows success/error toast
- Refetches data

### Files to Change

| File | Change |
|------|--------|
| `supabase/functions/admin-api/index.ts` | Add `adminAcceptBidForSeller` case to the switch block |
| `src/pages/admin/AuctionOutcomes.tsx` | Add Accept/Decline buttons with confirmation dialog to AuctionOutcomeCard |

### What Happens After Admin Accepts

1. Row inserted into `seller_bid_decisions` with decision = "accepted"
2. `trigger_notify_seller_accepted_bid` fires automatically (creates notification)
3. `cars.awaiting_seller_decision` set to `false`
4. Next cron run of `sync_auction_results_with_seller_decisions` updates `auction_results.seller_decision = "accepted"` and `admin_review_status = "reviewed"`
5. AuctionOutcomes page shows "Accepted" badge
6. "Email dealer: bid accepted" button becomes enabled
7. Admin can then notify the dealer about the accepted bid
8. Dealer can proceed to payment

This approach reuses the exact same data path as the seller's own acceptance, so all triggers, cron jobs, and downstream logic work identically.
