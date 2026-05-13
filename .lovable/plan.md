## Goal

Make `cleanup_cars_history_backlog()` consistent with the daily job and visible on the Cleanup Status page, and have it drain the ~50M-row backlog significantly faster than 3M rows/hour.

## Changes

### 1. Rewrite `public.cleanup_cars_history_backlog()`

Mirror the structure of `cleanup_cars_history_daily()` so both functions behave the same way:

- **Cutoff:** `NOW() - INTERVAL '90 days'` (was 60 days)
- **Time budget:** 100 seconds per run (the cron runs every 2 minutes, so this leaves headroom and avoids the statement-timeout failure we saw at 10:00). Replace the hard `max_batches = 20` cap with the time-budget loop pattern from the daily job.
- **Batch size:** raise from 5,000 to 10,000 rows per batch. With a 100s budget this targets roughly 300k–500k rows per run instead of the current ~100k cap.
- **Logging:** insert one row into `public.system_logs` per run with `log_type = 'cleanup'` and `message = 'Cars_history backlog drain run'`, details containing `deleted_count`, `cutoff_date`, `batches`, `duration_seconds`, and `more_to_delete`. Skip the insert when `deleted_count = 0` so we don't pollute the log once the backlog is gone.
- Keep `SECURITY DEFINER` and `SET search_path = public`.

Expected throughput after change: ~300k–500k rows/run × 30 runs/hr ≈ 9–15M rows/hr → full ~50M drain in roughly 4–6 hours instead of ~17.

### 2. Surface drain runs on the Cleanup Status page

`src/pages/admin/CleanupStatus.tsx` reads `recent_runs` from `admin_get_cars_history_cleanup_status`. Update that RPC so `recent_runs` includes both message types ('Daily cars_history cleanup completed' and 'Cars_history backlog drain run'), each row tagged with a `kind` field ('daily' | 'backlog'). The page's Recent Runs table gets a new "Type" column showing that tag.

No other UI changes — the existing Cron Jobs panel already lists `temp-cars-history-backlog-drain`.

### 3. Cleanup expectations

- Once `older_than_90d` reaches zero, drop the temporary cron job `temp-cars-history-backlog-drain` (separate follow-up — not part of this change).
- Postgres won't shrink the 50 GB table file after deletes; freed space is reused. A `VACUUM FULL` / `pg_repack` is a separate operation if physical reclaim is needed.

## Technical details

- Both changes (`cleanup_cars_history_backlog` and `admin_get_cars_history_cleanup_status`) ship in a single migration. `CREATE OR REPLACE FUNCTION` for both, with `GRANT EXECUTE` on the RPC to `authenticated`.
- The cron job itself does not need to change — it already calls `cleanup_cars_history_backlog()` every 2 minutes.
- Frontend change is one file: add a `kind` column to the recent-runs table and adjust the `recent_runs` row type in the query result.

## Files

- New migration under `supabase/migrations/` for both function definitions.
- `src/pages/admin/CleanupStatus.tsx` — add Type column to Recent Runs table.

## Verification after apply

- Wait for one drain run, then on `/admin/cleanup-status` confirm a new row appears in Recent Runs tagged "backlog" with a non-zero deleted count.
- Re-run the rows-older-than-90d count after ~30 minutes to confirm the backlog is dropping at the higher rate.
