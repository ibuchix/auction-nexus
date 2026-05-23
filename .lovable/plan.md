
# Lock down cron + admin-only edge functions

## Scope (confirmed)

Only two functions in this repo need work:

1. **`send-notifications`** — currently **completely open** (no auth guard). Called both by cron (`send-dealer-notifications`, every 5 min) and by the admin UI (`SellerList`, `AuctionOutcomes`). Highest risk: anyone on the internet can trigger Resend emails.
2. **`cleanup-old-vehicle-files`** — already guarded, but mixes "service-role key as bearer" (anti-pattern) with admin-JWT. Cron path is fragile. Called monthly via `monthly-vehicle-cleanup`.

Not touched (already properly admin-JWT-guarded): `admin-api`, `close-ended-auctions`, `start-scheduled-auctions`, `recover-auction`, `reset-auction-system`, `cleanup-cars-history`.

Out of scope: `track-event`, `send-whatsapp`, `get-dealers-with-phones` (public/seller/dealer flows). The `migrate-manual-valuation-photos` function the advisory mentioned does not exist in this project — photo migration happens inside the `admin_transfer_manual_valuation_to_cars_enhanced` SQL RPC, already admin-guarded.

## Auth pattern

Each protected function gets the same two-path guard at the top:

```text
1. If header `x-cron-secret` matches env CRON_SECRET → authorized as "cron"
2. Else read Authorization: Bearer <token>
   - supabase.auth.getUser(token)  (per project memory, NOT getClaims)
   - has_role(user.id, 'admin')
   - If admin → authorized as "admin"
3. Else → 401 / 403
```

This preserves both flows: cron keeps working with a real shared secret, admin UI keeps working with the user's JWT (auto-attached by `supabase.functions.invoke`).

## Steps

1. **Add secret `CRON_SECRET`** via the secrets tool (you paste a random 48+ char value).
2. **Edit `supabase/functions/send-notifications/index.ts`** — add the guard block at the top of the `serve` handler. No other logic changes.
3. **Edit `supabase/functions/cleanup-old-vehicle-files/index.ts`** — replace the `token === serviceRoleKey` branch with the `x-cron-secret` branch. Keep the admin-JWT branch.
4. **Update the two pg_cron jobs** to send `x-cron-secret` header. Done via direct SQL (not a migration file) so the secret literal isn't committed:
   - `monthly-vehicle-cleanup` → `cleanup-old-vehicle-files`
   - `send-dealer-notifications` → `send-notifications`
5. **Verification:**
   - `curl` `send-notifications` with no auth → 401
   - `curl` with bogus secret → 401
   - `curl` with `x-cron-secret: <CRON_SECRET>` → 200
   - Admin clicks "Send notifications" in `SellerList` / `AuctionOutcomes` → still works (JWT path)
   - Check `cron.job_run_details` after the next 5-min tick → `send-dealer-notifications` shows 200
   - Note the third HTTP cron `process-seller-decisions` — points at an edge function that doesn't exist in this repo; I'll flag it but not modify it.

## Technical details

**Files changed**
- `supabase/functions/send-notifications/index.ts` — ~20-line guard added inside `serve`, before any logic.
- `supabase/functions/cleanup-old-vehicle-files/index.ts` — swap service-role-bearer check for cron-secret header check.

**Secrets added**
- `CRON_SECRET` (edge-function env var).

**DB changes (direct SQL, no migration file)**
- `cron.unschedule('monthly-vehicle-cleanup')` + re-`cron.schedule(...)` with `headers` jsonb containing `"x-cron-secret": "<secret>"`.
- Same for `send-dealer-notifications`.

**Not touched**
- `src/integrations/supabase/types.ts` (auto-generated).
- Any seller/dealer-facing function.
- The 6 functions already admin-JWT-guarded.

**Sequencing**
Secret first, then deploy both function edits, then swap the cron jobs. If the cron is swapped before the functions deploy, one cron tick might 401 — acceptable for the 5-min job, but to be safe I'll do functions before cron.
