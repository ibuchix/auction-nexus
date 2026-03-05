

## Revised Analysis: Edge Functions Proposed for Deletion

### 1. `recover-auction` — DO NOT DELETE, but it's redundant as a standalone function

**What I found**: The AuctionRecovery page calls `recoverAuction()` → `edgeFunctionAdminOperations.recoverAuction()` → `admin-api` (action: `recoverAuction`). However, the `admin-api` handler at line 729 is just a **stub** — it returns `{ success: true, message: 'Recovery initiated' }` without actually performing any recovery logic.

The real recovery logic lives in the standalone `recover-auction` edge function, but **nothing in the frontend calls it directly**. This means the recovery UI currently gives a false success message.

**Recommendation**: Don't delete the standalone function yet. Instead, **copy the recovery logic from `recover-auction/index.ts` into the `admin-api` handler** so the existing UI actually works. Then the standalone function becomes truly redundant and can be removed from `config.toml` (but keep the code for reference).

### 2. `reset-auction-system` — SAFE TO KEEP, never called directly

The frontend's `resetSystemState()` in `edgeFunctionAdminOperations.ts` does NOT call this edge function. It calls `checkSystemHealth` + loops through stuck auctions calling `recoverAuction` via `admin-api`. The standalone `reset-auction-system` edge function is never invoked from anywhere.

**Recommendation**: Don't delete yet — it's useful as emergency tooling callable via curl. But it must get an auth guard added. It's low priority.

### 3. `generate-audit-report` — SAFE TO DELETE

Zero references anywhere in the frontend. No cron job calls it. Truly unused.

**Recommendation**: Delete or add auth guard. Deletion is cleanest.

### 4. `cleanup-cars-history` — DO NOT DELETE

**Critical finding**: The cron job `daily-cars-history-cleanup` calls `SELECT public.cleanup_cars_history_daily()` — this is the **database function**, not the edge function. They are different things:
- DB function `cleanup_cars_history_daily()` — called by cron at 4 AM UTC daily. This will keep working regardless.
- Edge function `cleanup-cars-history` — calls `cleanup_cars_history_backlog()` (the bulk version). This was used for the one-time massive backlog cleanup.

Deleting the edge function won't break the daily cron. However, it's useful to keep for manual bulk cleanups if the backlog ever grows again.

**Recommendation**: Keep it, add auth guard. It's a useful admin tool.

### Revised Plan

| Function | Previous Recommendation | Revised Recommendation | Reason |
|----------|------------------------|----------------------|--------|
| `recover-auction` | Delete | **Keep, add auth guard** | Recovery logic needs to be ported to admin-api; standalone function useful as fallback |
| `reset-auction-system` | Delete | **Keep, add auth guard** | Useful emergency tool via curl; just needs protection |
| `generate-audit-report` | Delete | **Delete** | Confirmed zero callers, zero cron jobs |
| `cleanup-cars-history` | Delete | **Keep, add auth guard** | Daily cron calls DB function (safe), but edge function is useful for manual bulk cleanup |

### Implementation

**Phase 1: Add admin auth guards to all 8 edge functions** (no deletions)

Each function gets this guard at the top:
```typescript
const authHeader = req.headers.get('Authorization');
if (!authHeader?.startsWith('Bearer ')) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
}
const supabaseClient = createClient(supabaseUrl, supabaseKey);
const { data: { user }, error: authError } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));
if (authError || !user) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
}
const { data: isAdmin } = await supabaseClient.rpc('has_role', { _user_id: user.id, _role: 'admin' });
if (!isAdmin) {
  return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: corsHeaders });
}
```

**Special handling for cron-called functions** (`send-notifications`, `cleanup-old-vehicle-files`):
These are called by `pg_cron` via `net.http_post` with the anon key (not a user JWT). The auth guard would block them. Two options:

- **Option A**: Add a shared secret as env var, check for it as a fallback when JWT auth fails
- **Option B**: Update the cron jobs to call database functions directly instead of the edge functions (like `cleanup-cars-history` already does)

For `send-notifications`: the cron calls it every 5 minutes. We need Option A (shared secret fallback) since the function does work that can't easily move to a DB function.

For `cleanup-old-vehicle-files`: this does storage operations that require the Supabase client, so Option A (shared secret fallback) is also needed.

**Phase 2: Delete only `generate-audit-report`**

Remove from `config.toml` and delete the function directory.

**Phase 3 (separate): Fix the admin-api `recoverAuction` stub**

Port the actual recovery logic from `recover-auction/index.ts` into the `admin-api` switch case so the AuctionRecovery UI actually works.

