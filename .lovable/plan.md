## What's happening

Today's auction-end job closed 5 cars at 13:00 UTC and the "Extend" button on the Ended tab doesn't work for them. Reason: `extend_auction_time` (the SQL function the button calls) hard-rejects anything whose `auction_status != 'active'`:

```
IF v_auction_status != 'active' THEN
  RETURN ... 'Auction is not active (current status: ended)'
```

It also only looks at `auction_schedules` rows whose status is `active` / `running`. All 5 of these have schedules in `completed`. So the RPC fails before changing anything — that's why nothing moved into Active Auctions.

## The 5 cars

| # | Car | Notes |
|---|---|---|
| 1 | 2016 Hyundai i40 (`8d63a649…`) | clean — no winner, no result |
| 2 | 2013 BMW 5-Series (`854666dd…`) | clean |
| 3 | 2019 Ford Focus (`6904bc97…`) | clean |
| 4 | 2015 Audi A6 (`1b838a85…`) | clean |
| 5 | 2008 Peugeot 4007 (`79377060…`) | has 1 row in `auction_results` and 1 in `dealer_won_vehicles` — must be cleared or restore will conflict |

All 5 schedules are in `completed`, all cars are `auction_status = 'ended'`, original end was 2026-06-26 13:00 UTC.

## Plan

### Step 1 — Restore these 5 specific cars (data fix, runs once)

Run a single SQL transaction via the insert tool that, for each of the 5 car IDs:

1. `DELETE FROM dealer_won_vehicles WHERE car_id = …` (only Peugeot has a row, no-op for the others)
2. `DELETE FROM auction_results WHERE car_id = …` (same)
3. `UPDATE auction_schedules SET status='active', end_time = now() + interval '7 days', is_manually_controlled=true, last_status_change=now(), notes = notes || '🔄 Reopened by admin — extended 7 days from end' WHERE car_id = …`
4. `UPDATE cars SET auction_status='active', auction_end_time = now() + interval '7 days', is_manually_controlled=true, updated_at=now() WHERE id = …`
5. Insert one `audit_logs` row per car with action `'extend_auction'`, details `{reason: 'Manual reopen — extend ended auction by 7 days', hours_added: 168, old_end_time, new_end_time}`

New end time will be **2026-07-03 ~21:50 UTC** (7×24h from when we run it). If you'd rather pin it to a clean clock time (e.g. 7 days from the original 13:00 UTC end → 2026-07-03 13:00 UTC), say so and I'll use that timestamp instead.

### Step 2 — Make the Extend button work on the Ended tab going forward

Right now the button is technically hidden on Ended cards (`AdminAuctionCard` only renders Extend when `auctionStatus === 'active'`), so a different surface must have been the one you clicked — I'll confirm which one after you approve Step 1. Two options once we know:

- **A. Keep Extend strictly for active auctions** and add a separate **"Reopen auction"** action on Ended cards that reuses the Step 1 logic via a new RPC (e.g. `admin_reopen_auction(p_car_id, p_hours)`) which: clears `auction_results` + `dealer_won_vehicles`, flips schedule + car back to active, sets a new end time, writes an audit log.
- **B. Extend the existing `extend_auction_time` RPC** so when the auction is `ended` it does the same reopen flow instead of erroring. Cleaner UX (one button) but slightly more "magic".

My recommendation: **A** — explicit "Reopen" is safer because reopening wipes a winner record (matters for the Peugeot case).

## Technical notes

- The reopen affects: `cars`, `auction_schedules`, `auction_results`, `dealer_won_vehicles`, `audit_logs`. No bid data is touched, so existing bids stay attached.
- For the Peugeot, removing the `dealer_won_vehicles` row means the dealer who currently "won" it will no longer see it in their won-vehicles list. Confirm that's acceptable before I run Step 1.
- After Step 1, the 5 cars will appear under Active Auctions and disappear from the Ended tab automatically (those queries key off `auction_status`).
- I will not touch any other ended auctions.

## Confirm before I switch to build mode

1. Use **7 days from now**, or **7 days from the original 13:00 UTC end** (2026-07-03 13:00 UTC)?
2. OK to wipe the Peugeot 4007's winner record (`auction_results` + `dealer_won_vehicles`) so it can go back to auction?
3. For Step 2, go with option **A (separate "Reopen" button)** or **B (Extend handles ended too)**?
