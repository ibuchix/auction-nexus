

## Build the Metrics Page — Platform Source of Truth

### Overview

Replace the placeholder Metrics page with a fully functional dashboard tracking 8 key platform KPIs. Each metric shows the **current live value** plus a **weekly trend graph** from historical snapshots.

### Architecture

The approach prioritizes accuracy and database performance:

```text
┌─────────────────────────────┐
│  metrics_weekly_snapshots   │  ← Stores one row per week
│  (historical data for       │     with all 8 metric values
│   graphs)                   │
└─────────────────────────────┘
           ▲
           │ Weekly cron insert
           │
┌─────────────────────────────┐
│  compute_platform_metrics() │  ← SECURITY DEFINER RPC
│  (live calculation of all   │     Single fast query
│   8 metrics)                │
└─────────────────────────────┘
           ▲
           │ Called by page + cron
           │
┌─────────────────────────────┐
│  Metrics Page UI            │  ← Shows live values +
│  (8 stat cards + graphs)    │     historical graphs
└─────────────────────────────┘
```

### The 8 Metrics

All use `auction_schedules` as source of truth for active auctions:

| Metric | Calculation |
|--------|-------------|
| Total Listings | Count of `auction_schedules` with `status = 'active'` |
| Total Bids | Count of `bids` joined to active schedules |
| Active Bidding Dealers (7d) | Distinct `dealer_id` from bids in last 7 days |
| Dealer Activation Rate | Active dealers / total approved dealers |
| Avg Bids per Listing | Total bids / total listings |
| % Listings with 2+ Bids | Listings with ≥2 bids / total listings |
| Seller Acceptance Rate | `seller_decision = 'accepted'` / total decisions |
| Sell-through Rate | `sale_status = 'sold'` / total `auction_results` |

Current verified values from DB: 142 listings, 26 bids, 5 active dealers, 263 approved dealers, 6 listings with 2+ bids, 85.6% acceptance, 62.5% sell-through.

### Implementation Steps

**1. Database migration** — Create `metrics_weekly_snapshots` table and `compute_platform_metrics()` RPC:

```sql
CREATE TABLE metrics_weekly_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date date NOT NULL DEFAULT CURRENT_DATE,
  total_listings integer NOT NULL DEFAULT 0,
  total_bids integer NOT NULL DEFAULT 0,
  active_dealers_7d integer NOT NULL DEFAULT 0,
  total_approved_dealers integer NOT NULL DEFAULT 0,
  dealer_activation_rate numeric NOT NULL DEFAULT 0,
  avg_bids_per_listing numeric NOT NULL DEFAULT 0,
  pct_listings_2plus_bids numeric NOT NULL DEFAULT 0,
  seller_acceptance_rate numeric NOT NULL DEFAULT 0,
  sell_through_rate numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(snapshot_date)
);

-- RLS: admin-only read, service role write
ALTER TABLE metrics_weekly_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view" ON metrics_weekly_snapshots
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::user_role));

-- Live computation RPC
CREATE OR REPLACE FUNCTION compute_platform_metrics()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  WITH active AS (
    SELECT car_id FROM auction_schedules WHERE status = 'active'
  ),
  bid_stats AS (
    SELECT count(*) as total_bids,
           count(DISTINCT b.dealer_id) FILTER (WHERE b.created_at >= now() - interval '7 days') as active_dealers_7d
    FROM bids b WHERE EXISTS (SELECT 1 FROM active a WHERE a.car_id = b.car_id)
  ),
  listing_bid_counts AS (
    SELECT b.car_id, count(*) as cnt
    FROM bids b WHERE EXISTS (SELECT 1 FROM active a WHERE a.car_id = b.car_id)
    GROUP BY b.car_id
  ),
  outcomes AS (
    SELECT count(*) FILTER (WHERE seller_decision = 'accepted') as accepted,
           count(*) FILTER (WHERE seller_decision IS NOT NULL) as decided,
           count(*) FILTER (WHERE sale_status = 'sold') as sold,
           count(*) as total
    FROM auction_results
  )
  SELECT jsonb_build_object(
    'total_listings', (SELECT count(*) FROM active),
    'total_bids', (SELECT total_bids FROM bid_stats),
    'active_dealers_7d', (SELECT active_dealers_7d FROM bid_stats),
    'total_approved_dealers', (SELECT count(*) FROM dealers WHERE is_verified = true),
    'dealer_activation_rate', ROUND(
      (SELECT active_dealers_7d FROM bid_stats)::numeric / 
      GREATEST((SELECT count(*) FROM dealers WHERE is_verified = true), 1) * 100, 1),
    'avg_bids_per_listing', ROUND(
      (SELECT total_bids FROM bid_stats)::numeric / 
      GREATEST((SELECT count(*) FROM active), 1), 2),
    'pct_listings_2plus_bids', ROUND(
      (SELECT count(*) FROM listing_bid_counts WHERE cnt >= 2)::numeric / 
      GREATEST((SELECT count(*) FROM active), 1) * 100, 1),
    'seller_acceptance_rate', ROUND(
      (SELECT accepted FROM outcomes)::numeric / 
      GREATEST((SELECT decided FROM outcomes), 1) * 100, 1),
    'sell_through_rate', ROUND(
      (SELECT sold FROM outcomes)::numeric / 
      GREATEST((SELECT total FROM outcomes), 1) * 100, 1)
  );
$$;
```

**2. Seed initial snapshot** — Use the insert tool to run `compute_platform_metrics()` and insert the first row so the graph has a starting point.

**3. Create weekly cron job** — Use `pg_cron` to call the RPC and insert a snapshot every Monday at 08:00 UTC:

```sql
SELECT cron.schedule('weekly-metrics-snapshot', '0 8 * * 1', $$
  INSERT INTO metrics_weekly_snapshots (
    snapshot_date, total_listings, total_bids, active_dealers_7d,
    total_approved_dealers, dealer_activation_rate, avg_bids_per_listing,
    pct_listings_2plus_bids, seller_acceptance_rate, sell_through_rate
  )
  SELECT CURRENT_DATE,
    (m->>'total_listings')::int, (m->>'total_bids')::int,
    (m->>'active_dealers_7d')::int, (m->>'total_approved_dealers')::int,
    (m->>'dealer_activation_rate')::numeric, (m->>'avg_bids_per_listing')::numeric,
    (m->>'pct_listings_2plus_bids')::numeric, (m->>'seller_acceptance_rate')::numeric,
    (m->>'sell_through_rate')::numeric
  FROM compute_platform_metrics() m
  ON CONFLICT (snapshot_date) DO NOTHING;
$$);
```

**4. Build the Metrics page UI** — Replace `src/pages/admin/Metrics.tsx`:

- **Header section**: Title, description, last-updated timestamp
- **8 stat cards** in a 4-column grid: Each shows the live value with appropriate formatting (counts, percentages, ratios) and a small sparkline or delta from last week
- **Two chart sections** using Recharts (already installed):
  - "Supply & Demand" — Line chart with total listings + total bids over time
  - "Engagement & Conversion" — Line chart with dealer activation rate, seller acceptance rate, sell-through rate over time
- **Hook**: `useMetricsData()` calls `compute_platform_metrics()` RPC for live values and queries `metrics_weekly_snapshots` for graph data

**5. Update Supabase types** — The types file will auto-update after migration.

### Performance Notes

- The RPC uses CTEs that scan only the relevant tables once — no repeated full-table scans
- `SECURITY DEFINER` bypasses RLS for consistent results
- Weekly snapshots mean graphs never recalculate historical data
- The page fetches 2 queries total: 1 RPC for live data, 1 simple SELECT for snapshot history
- No realtime subscription needed — this is a weekly-cadence dashboard

