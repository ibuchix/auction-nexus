

## Fix: Remove 1,000 Row Limit on Seller Data Fetch

### Problem Identified

The database has **2,329 sellers**, but only **1,000** are being returned due to Supabase's default row limit on RPC function calls. This is why you only see sellers up to January 18, 2026.

The pagination UI is working correctly - the issue is the data source itself is truncated.

---

### Root Cause

The `get_sellers_with_emails` RPC function in the edge function is called without specifying a higher row limit:

```typescript
// Current code in admin-api/index.ts (line 242-243)
const { data: sellersWithEmails, error: sellersError } = await supabase
  .rpc('get_sellers_with_emails')
```

Supabase applies a default limit of 1,000 rows to all queries, including RPC calls.

---

### Solution

Update the edge function to explicitly request more rows by adding a `.limit()` modifier to the RPC call. For 4,000 sellers (100 per page x 40 pages), we need to set a limit of at least 4,000.

---

### Implementation

**File:** `supabase/functions/admin-api/index.ts`

**Change:** Modify the `getAllSellers` case (around line 242) to add `.limit(5000)` to ensure we fetch all sellers (with some buffer for growth):

```typescript
// Before
const { data: sellersWithEmails, error: sellersError } = await supabase
  .rpc('get_sellers_with_emails')

// After
const { data: sellersWithEmails, error: sellersError } = await supabase
  .rpc('get_sellers_with_emails')
  .limit(5000)  // Override default 1000 row limit
```

---

### Why 5,000?

| Calculation | Value |
|-------------|-------|
| Current sellers | 2,329 |
| 40 pages x 100 per page | 4,000 max display |
| Buffer for growth | +1,000 |
| **Limit to set** | **5,000** |

---

### Summary of Changes

| File | Change |
|------|--------|
| `supabase/functions/admin-api/index.ts` | Add `.limit(5000)` to `get_sellers_with_emails` RPC call |

After this change:
- All 2,329 sellers will be fetched
- At 100 per page, you'll see 24 pages
- At 25 per page, you'll see 94 pages
- Pagination will work correctly to show all data including sellers after January 18, 2026

