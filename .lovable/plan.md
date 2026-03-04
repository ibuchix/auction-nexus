

## Fix Total Bids Card Accuracy

### Problem
The current query filters by `cars.auction_status = 'active'`, but 442 cars have this field set to `'active'` without actually having an active auction schedule. The correct source of truth is the `auction_schedules` table where `status = 'active'`. This causes the count to fluctuate between 25 and 32 depending on timing/caching.

- Correct total bids (verified via DB): **25**
- Incorrect count from `cars.auction_status`: **32**

### Solution

**1. Create an RPC function** (new migration) that returns accurate bid counts using `auction_schedules` as the source of truth:

```sql
CREATE OR REPLACE FUNCTION get_active_auction_bid_counts()
RETURNS TABLE(total_bids bigint, recent_bids bigint)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT count(*) FROM bids b 
     WHERE EXISTS (SELECT 1 FROM auction_schedules s WHERE s.car_id = b.car_id AND s.status = 'active')) AS total_bids,
    (SELECT count(*) FROM bids b 
     WHERE EXISTS (SELECT 1 FROM auction_schedules s WHERE s.car_id = b.car_id AND s.status = 'active')
     AND b.created_at >= now() - interval '24 hours') AS recent_bids;
$$;
```

Using `SECURITY DEFINER` bypasses RLS so the count is always consistent regardless of the calling user's permissions.

**2. Update `TotalBidsCard.tsx`** to call `supabase.rpc('get_active_auction_bid_counts')` instead of the two separate PostgREST queries with joins. This gives a single, fast, accurate call that always returns the correct numbers.

### Why this fixes the inconsistency
- Eliminates dependency on the stale `cars.auction_status` field
- Uses `auction_schedules.status = 'active'` as the single source of truth (matching how the rest of the system identifies active auctions)
- `SECURITY DEFINER` ensures consistent results regardless of RLS policies
- Single RPC call instead of two separate queries reduces race conditions

