

## Fix: Route Review Fetching Through Edge Function

### Problem

The ReviewManagement page queries `seller_reviews` and `dealer_reviews` directly from the browser client. Despite having admin RLS policies, the queries return 403. Rather than debugging RLS nuances, the reliable fix is to fetch through the `admin-api` edge function, which uses the service role key and bypasses RLS entirely. This is also more consistent since the approve/reject mutations already go through the edge function.

### Changes

**1. Add `getReviews` action to the edge function** (`supabase/functions/admin-api/index.ts`)

New case that fetches all reviews from both tables and returns them merged:

```typescript
case 'getReviews': {
  const [sellerRes, dealerRes] = await Promise.all([
    supabase.from('seller_reviews').select('*').order('created_at', { ascending: false }),
    supabase.from('dealer_reviews').select('*').order('created_at', { ascending: false }),
  ]);
  // Return merged results
}
```

**2. Update ReviewManagement page** (`src/pages/admin/ReviewManagement.tsx`)

Change the `useQuery` to call the edge function instead of querying tables directly:

```typescript
const { data } = await supabase.functions.invoke("admin-api", {
  body: { action: "getReviews", params: {} },
});
```

### Files to Change

| File | Change |
|------|--------|
| `supabase/functions/admin-api/index.ts` | Add `getReviews` case |
| `src/pages/admin/ReviewManagement.tsx` | Fetch via edge function instead of direct table queries |
