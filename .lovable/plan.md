

## Edge Function Security Hardening — Implementation Plan

### Corrected Approach (No Extra Secrets Needed)

The `SUPABASE_SERVICE_ROLE_KEY` is already available as an env var in every edge function. For cron-called functions, we check if the bearer token matches the service role key. For admin-called functions, we validate the user JWT and check admin role via `has_role()` RPC — the same pattern already used in `admin-api`.

### Auth Guard Pattern

Two variants will be used:

**Variant A — Admin-only functions** (called from admin UI via `supabase.functions.invoke()`):
```typescript
const authHeader = req.headers.get('Authorization');
if (!authHeader?.startsWith('Bearer ')) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
}
const token = authHeader.replace('Bearer ', '');
const userClient = createClient(supabaseUrl, supabaseAnonKey);
const { data: { user }, error } = await userClient.auth.getUser(token);
if (error || !user) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
}
const { data: isAdmin } = await supabaseClient.rpc('has_role', { _user_id: user.id, _role: 'admin' });
if (!isAdmin) {
  return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: corsHeaders });
}
```

**Variant B — Admin OR cron functions** (called from admin UI + pg_cron):
Same as Variant A, but with a fallback: if the bearer token matches `SUPABASE_SERVICE_ROLE_KEY`, allow access (this is how cron jobs authenticate).

### Changes Per Function

| Function | Guard | Additional Changes |
|----------|-------|--------------------|
| `close-ended-auctions` | Variant A (admin only) | None |
| `start-scheduled-auctions` | Variant A (admin only) | None |
| `send-notifications` | Variant B (admin + cron) | None |
| `recover-auction` | Variant A (admin only) | None |
| `reset-auction-system` | Variant A (admin only) | None |
| `cleanup-cars-history` | Variant A (admin only) | None |
| `cleanup-old-vehicle-files` | Variant B (admin + cron) | None |
| `generate-audit-report` | **Delete entirely** | Remove from config.toml, delete function dir |

### Phase 3: Port Recovery Logic to admin-api

Replace the stub at line 729-737 of `admin-api/index.ts` with the actual recovery logic from `recover-auction/index.ts` (lines 40-178). This makes the AuctionRecovery UI actually functional instead of returning a fake success.

### File Changes Summary

1. **`supabase/functions/close-ended-auctions/index.ts`** — Add Variant A auth guard after CORS check
2. **`supabase/functions/start-scheduled-auctions/index.ts`** — Add Variant A auth guard after CORS check
3. **`supabase/functions/send-notifications/index.ts`** — Add Variant B auth guard after CORS check
4. **`supabase/functions/recover-auction/index.ts`** — Add Variant A auth guard after CORS check
5. **`supabase/functions/reset-auction-system/index.ts`** — Add Variant A auth guard after CORS check
6. **`supabase/functions/cleanup-cars-history/index.ts`** — Add Variant A auth guard after CORS check
7. **`supabase/functions/cleanup-old-vehicle-files/index.ts`** — Add Variant B auth guard after CORS check
8. **`supabase/functions/generate-audit-report/index.ts`** — Delete file
9. **`supabase/config.toml`** — Remove `generate-audit-report` entry
10. **`supabase/functions/admin-api/index.ts`** — Replace recoverAuction stub with actual logic

No new secrets, no new environment variables. All authentication uses existing Supabase infrastructure.

