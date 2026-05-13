## What I found

I checked the database and the cron jobs. The disk is being eaten almost entirely by **one table**: `public.cars_history` — currently **~50 GB / 128 million rows**. Everything else (logs, storage, audit) is in the MB range. So this is not a "many small things" problem; it's one feedback loop.

### The cron jobs are running, but not doing what you think

- `daily-cars-history-cleanup` (daily 04:00 UTC) → succeeds every day. But the function `cleanup_cars_history_daily()` is hard-capped at **10 batches × 1,000 rows = 10,000 rows per day**, and the cutoff is **60 days**, not 90.
- `monthly-vehicle-cleanup` (1st of month, 03:00 UTC) → runs successfully and calls the `cleanup-old-vehicle-files` edge function. This one is fine.
- Other small cleanup jobs (`system_logs`, sync logs, weekly logs) are fine.

### The real problem: cars_history grows ~1 million rows/day

- Last 24h: **1,048,320** new rows in `cars_history`.
- Last 2h: **86,629** rows, **all** of type `auction_status_changed`.
- Source: the `enforce_car_ownership_integrity` trigger on `public.cars` writes a history row every time `auction_status` changes.
- The `auction-status-update-every-minute` cron calls `update_auction_status()`, which updates `cars.auction_status` based on `auction_schedules`. The CASE statement contains branches that re-assign the **same** value (e.g. `WHEN as_sched.status='completed' THEN 'ended'` — which keeps firing for every already-ended car, every minute), and the trigger's `IS DISTINCT FROM` check still fires on rows where the WHERE clause matched on `auction_end_time` drift but `auction_status` didn't actually change in a meaningful way. Net effect: the same cars are "flipping" over and over and writing history rows.

So even with cleanup running daily, you delete 10k and add 1M. Net growth ≈ +1 GB/day. That is exactly why Supabase auto-scaled the disk.

Numbers right now:
- Total rows: 128,016,189
- Older than 60 days: 70,206,795
- Older than 90 days: 51,136,785

## The fix (3 parts)

### 1. Stop the bleed (root cause)

Rewrite `update_auction_status()` so the `UPDATE public.cars` statement only touches a row when `auction_status` will actually change to a different value. Concretely:
- Compute the new status with the same CASE.
- Add `WHERE new_status IS DISTINCT FROM cars.auction_status` (and the same for `auction_end_time`).
- Remove the "ELSE cars.auction_status" no-op branches that match rows without changing them.

Also tighten the trigger `enforce_car_ownership_integrity` so it does not insert a history row when the new `auction_status` equals the old one (defense in depth — should be a no-op once the function above is fixed, but guarantees we never log a non-change again).

Expected effect: writes to `cars_history` drop from ~1M/day to a handful per day (only real status transitions).

### 2. Purge the 50 GB backlog (one-time, in background)

Replace `cleanup_cars_history_daily()` with a version that:
- Uses **90 days** as the retention cutoff (your stated policy).
- Removes the `max_batches=10` cap. Loop until either nothing is left to delete or a wall-clock budget (e.g. 4 minutes) is reached, so a single nightly run can delete millions of rows safely.
- Keeps the small `pg_sleep` between batches and uses larger batches (e.g. 5,000) to be gentle on the WAL but actually make progress.

Then trigger the existing `cleanup-cars-history` edge function (which already calls `cleanup_cars_history_backlog` in a background loop with `EdgeRuntime.waitUntil`) once manually to drain the 50 GB backlog over a few hours. After that, the daily job alone is enough to keep up because new inserts will be tiny.

Note: Postgres deletes only mark rows dead — they don't shrink the table file. After the big purge we should run `VACUUM (VERBOSE) public.cars_history;` (or rely on autovacuum) so the freed pages become reusable. Disk size reported by Supabase will only drop further if we also run `VACUUM FULL` or `pg_repack`, which lock the table; for an actively-written table I recommend skipping this and letting the freed space be reused for new data instead.

### 3. Verify and confirm

- Re-check `cars_history` row count and write rate 24h after deploying the function fix; confirm growth is ~0.
- Confirm cron `daily-cars-history-cleanup` is now deleting everything older than 90 days each night (job_run_details `return_message` will show the count).
- `monthly-vehicle-cleanup` already works — leave it alone, but note its retention is configured inside `cleanup_old_vehicle_data` (separate from cars_history); I'll verify it matches the 90-day policy when we implement.

## Technical details (for the migration)

Three SQL changes in one migration:

1. `CREATE OR REPLACE FUNCTION public.update_auction_status()` — restructured so each `UPDATE public.cars` only matches rows whose computed status differs from the current one (no-op rows excluded by the WHERE clause).
2. `CREATE OR REPLACE FUNCTION public.enforce_car_ownership_integrity()` — keep status/seller change logic, but explicitly skip the history insert when `OLD.auction_status = NEW.auction_status AND OLD.status = NEW.status AND OLD.seller_id = NEW.seller_id`.
3. `CREATE OR REPLACE FUNCTION public.cleanup_cars_history_daily()` — cutoff = 90 days, no batch-count cap, time-budgeted loop (e.g. 240 seconds), batch size 5,000.

After the migration is approved and applied, I'll invoke `cleanup-cars-history` once via the admin UI / curl to drain the backlog in the background. No code in the React app needs to change; this is all backend.

## Risks / safety

- The trigger change is additive (skips writes that were redundant), so no existing read path breaks.
- The function rewrite preserves the same outputs for cars whose status genuinely changes.
- The cleanup function only deletes rows older than 90 days — same data class you've already been deleting at 60 days, just with the correct retention and without the artificial cap.
- No risk of "deleting old records inadvertently creating new ones": deletes do not fire any INSERT trigger on `cars_history` (no triggers exist on that table), so the loop is self-terminating.
