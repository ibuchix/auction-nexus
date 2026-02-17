
## Fix Delete Seller + Deploy Issues

### Problem 1: Edge function deployment failing

The `admin-api` edge function consistently fails to deploy with `SUPABASE_INTERNAL_ERROR`. The root cause is likely conflicting import maps and/or a stale `deno.lock`:

- `supabase/import_map.json` references `@supabase/supabase-js@2.38.4`
- `supabase/functions/import_map.json` references `@supabase/supabase-js@2.36.0`
- The function itself uses a direct URL import: `https://esm.sh/@supabase/supabase-js@2`

**Fix**: Standardize the imports and remove the conflicting `supabase/functions/import_map.json`. Also remove the `deno.lock` file if it exists, and update the direct URL import in the function to use a pinned version.

### Problem 2: Delete button does nothing

The enhanced cascading delete code exists in the local file (lines 465-577) but was never successfully deployed. The currently running edge function still has the old broken code. Once the deployment issue (Problem 1) is fixed, the delete will work.

Additionally, there is a defensive check to add: if the edge function call fails silently (returns null), the dialog currently does nothing because `handleDeleteSeller` checks `if (result)` and null is falsy. We should show an error toast when the result is null/falsy.

### Problem 3: Listing count shows 0 for Kamil Swiatek

The `get_sellers_with_emails` database function only counts records in the `cars` table. Kamil Swiatek has a record in `manual_valuations` but NOT in `cars`, so his listing count is correctly 0 from the `cars` table perspective.

Manual valuations are submissions requesting a valuation -- they are not the same as car listings. The count label should be clarified to say "Car Listings" instead of just "Listings" to avoid confusion. Alternatively, if you want to also show manual valuation count, we can add that.

---

### Implementation

| File | Change |
|------|--------|
| `supabase/functions/admin-api/index.ts` | Pin the import URL to a specific version (`@2.38.4`) to match the root import map |
| `supabase/functions/import_map.json` | Update version to `@2.38.4` to match the root import map and eliminate conflicts |
| `src/hooks/useSellerManagement.tsx` | Add explicit error handling when `operations.deleteSeller()` returns null |
| `src/components/admin/seller-management/DeleteSellerDialog.tsx` | Clarify "Listings" label to "Car Listings" to distinguish from manual valuations |

After these changes, we will attempt to redeploy the edge function. If the Supabase infrastructure error persists, you will need to manually paste the updated code into the Supabase dashboard (Functions > admin-api > Edit).

### Technical Details

**Import standardization** (line 2 of `admin-api/index.ts`):
```typescript
// Before
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// After
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
```

**Error handling improvement** (`useSellerManagement.tsx` line 60):
```typescript
// Before
if (result) {
  toast.success('Seller account removed successfully');
// After  
if (result && result.success) {
  toast.success('Seller account removed successfully');
} else {
  toast.error('Failed to remove seller - operation returned no result');
}
```
