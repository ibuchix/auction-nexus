

## Add Total Bids Card to Auction Management Page

### What we're building
A new card component placed next to the "Online Dealers" card showing:
- **Total bids** across all currently active auctions
- **Bids in the last 24 hours** as a secondary metric

### Implementation

**1. Create `TotalBidsCard` component** (`src/components/admin/dashboard/TotalBidsCard.tsx`)
- Uses `useQuery` to fetch two counts from the `bids` table:
  - Total bids where `car_id` is in active auctions (`cars.auction_status = 'active'`)
  - Bids created in the last 24 hours (filtered by `created_at`)
- Since RLS may block direct client queries, we'll use the `admin-api` edge function or a direct Supabase query (the admin user has `admin_bids_access` RLS policy)
- Card design will mirror the `OnlineDealersCard` style: gradient background, icon, primary large number, secondary stat below a divider
- Icon: `Banknote` or `TrendingUp` from lucide-react
- Shows a green pulse dot or activity indicator when there are recent bids

**2. Update `AuctionManagementOptimized.tsx`**
- Change the `<div className="max-w-sm">` wrapper to a flex/grid row holding both cards side by side
- Import and render `TotalBidsCard` next to `OnlineDealersCard`

### Data fetching approach
Query the `bids` table joined with `cars` where `cars.auction_status = 'active'`:
- Count all bids → total bids
- Count bids where `created_at > now() - interval '24 hours'` → recent bids
- Auto-refresh every 30 seconds to stay current
- Real-time subscription on `bids` table INSERT events to update counts immediately

### Layout change
```text
Before:  [Online Dealers]
After:   [Online Dealers] [Total Bids]
```

Both cards in a responsive grid: `grid-cols-1 sm:grid-cols-2 max-w-2xl`

