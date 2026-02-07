

## Root Cause: PostgREST `max-rows` Limit

The real bottleneck is **not** the database function or the edge function code -- it's **PostgREST's server-side `max-rows` configuration**, which Supabase sets to **1,000** by default.

Here's what happens:

```text
Database Function (get_sellers_with_emails)
  --> Returns 2,341 rows (confirmed working)
      |
PostgREST (intermediary between Supabase client and database)
  --> Enforces max-rows = 1000
  --> Ignores .limit(5000) because max-rows caps it
      |
Edge Function receives only 1,000 rows
      |
Frontend displays 1,000 rows
```

The `.limit(5000)` in the Supabase JS client sends a `Range` header to PostgREST, but PostgREST applies `min(requested_limit, max_rows)`, which results in `min(5000, 1000) = 1000`.

This is why both the database function `LIMIT 5000` change AND the edge function `.limit(5000)` change had no effect -- the cap is enforced at the PostgREST layer.

---

## Solution: Paginate Inside the Edge Function

Fetch sellers in batches of 1,000 using `.range()`, then combine all results before returning to the frontend. This works around the PostgREST cap without requiring any Supabase configuration changes.

---

## Implementation

**File:** `supabase/functions/admin-api/index.ts`

**Change the `getAllSellers` case (lines 238-268)** from a single `.rpc()` call to a paginated loop:

```typescript
case 'getAllSellers':
  console.log('Fetching all sellers with emails using paginated RPC...')
  
  // PostgREST enforces a max-rows limit of 1000 per request.
  // We must paginate through results to get all sellers.
  let allSellersData: any[] = [];
  let offset = 0;
  const batchSize = 1000;
  let hasMoreSellers = true;

  while (hasMoreSellers) {
    const { data: batch, error: batchError } = await supabase
      .rpc('get_sellers_with_emails')
      .range(offset, offset + batchSize - 1)
      .order('created_at', { ascending: false });

    if (batchError) {
      console.error('Sellers RPC batch error:', batchError);
      throw new Error(`Failed to fetch sellers: ${batchError.message}`);
    }

    if (batch && batch.length > 0) {
      allSellersData = allSellersData.concat(batch);
      console.log(`Fetched batch: offset=${offset}, rows=${batch.length}, total so far=${allSellersData.length}`);
      offset += batchSize;
      hasMoreSellers = batch.length === batchSize;
    } else {
      hasMoreSellers = false;
    }
  }

  // Transform to match expected format
  const formattedSellers = allSellersData.map((seller: any) => ({
    id: seller.id,
    user_id: seller.user_id,
    role: 'seller',
    created_at: seller.created_at,
    name: seller.full_name,
    email: seller.email,
    mobile_number: null,
    address: seller.address,
    verification_status: seller.verification_status,
    is_verified: seller.is_verified,
    total_listings: seller.total_listings,
    active_listings: seller.active_listings
  }));

  console.log(`Successfully fetched ALL ${formattedSellers.length} sellers via pagination`);
  result = formattedSellers;
  break;
```

---

## How It Works

```text
Request 1: .range(0, 999)    --> Returns rows 1-1000
Request 2: .range(1000, 1999) --> Returns rows 1001-2000
Request 3: .range(2000, 2999) --> Returns rows 2001-2341
                                  (only 341 rows, loop stops)

Combined result: 2,341 sellers returned to frontend
```

---

## Summary of Changes

| File | Change |
|------|--------|
| `supabase/functions/admin-api/index.ts` | Replace single `.rpc()` call with paginated loop using `.range()` in the `getAllSellers` case |

No frontend changes needed -- the frontend already handles arrays of any size with client-side pagination.

After this change:
- All 2,341 sellers will be fetched (in 3 batches)
- The existing frontend pagination (25 or 100 per page) will display all of them
- Sellers after January 18, 2026 will appear
- Scales to up to ~5,000 sellers with only 5 batch requests

