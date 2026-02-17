

## Fix Edge Function Deployment (Safe, Targeted Approach)

### Problem
The `admin-api` edge function fails to deploy. Other functions (notably `send-notifications`) work fine and should NOT be touched.

### Root Causes (admin-api specific)
1. **`config.toml` references `import_map.json`** for every function, which maps `"supabase"` to `esm.sh/@2.38.4`. But `admin-api` doesn't use the `"supabase"` alias -- it uses a direct URL import. The import map adds unnecessary resolution overhead and can cause bundler conflicts.
2. **`admin-api` uses the deprecated `serve()` pattern** from `std@0.168.0`, while every other working function uses the modern `Deno.serve()`. This old pattern may not be supported by newer edge-runtime versions.
3. **`config.toml` has phantom entries** (`process-proxy-bids`, `proxy-bid-scheduler`) pointing to functions that don't exist, and is missing entries for real functions (`close-ended-auctions`, `recover-auction`, etc.).

### What We Will Change

| File | Change | Risk |
|------|--------|------|
| `supabase/functions/admin-api/index.ts` | Replace `serve()` import with `Deno.serve()` pattern (matching `send-notifications` which works) | Low -- same API, just modern syntax |
| `supabase/config.toml` | Remove `import_map` references, remove phantom functions, add missing real functions | Low -- import map wasn't being used by the functions anyway |
| `supabase/import_map.json` | Delete (no function uses its aliases) | Low -- functions use direct URL imports |

### What We Will NOT Change

- `send-notifications` -- it works, don't touch it
- `start-scheduled-auctions` -- leave its imports as-is
- `close-ended-auctions`, `recover-auction`, etc. -- leave as-is
- No switching to `npm:` specifiers -- unnecessary risk when `esm.sh` works for other functions

### Technical Details

**1. `admin-api/index.ts` (line 1 and line 9)**

Replace the old `serve` import and usage:
```typescript
// Before
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
// ...
serve(async (req) => {
```

With the modern pattern (same as working `send-notifications`):
```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
// ...
Deno.serve(async (req) => {
```

**2. `config.toml`**

Clean version with no import_map references and correct function list:
```toml
project_id = "sdvakfhmoaoucmhbhwvy"

[functions.admin-api]
  verify_jwt = false

[functions.start-scheduled-auctions]
  verify_jwt = false

[functions.send-notifications]
  verify_jwt = false

[functions.cleanup-old-vehicle-files]
  verify_jwt = false

[functions.cleanup-cars-history]
  verify_jwt = false

[functions.close-ended-auctions]
  verify_jwt = false

[functions.generate-audit-report]
  verify_jwt = false

[functions.recover-auction]
  verify_jwt = false

[functions.reset-auction-system]
  verify_jwt = false
```

**3. Delete `supabase/import_map.json`**

No function imports using the `"supabase"` or `"std/"` aliases defined in this file. They all use direct URLs. This file only adds confusion.

### Why This is Safe

- We only modify `admin-api` (which is already broken -- can't get worse)
- We clean up `config.toml` (removing incorrect references, not changing working function behavior)
- We delete an unused import map file
- Every working function remains untouched

### After Deployment

Once `admin-api` deploys successfully, the delete seller feature will work because the cascading delete logic is already in the code (lines 465-577).

