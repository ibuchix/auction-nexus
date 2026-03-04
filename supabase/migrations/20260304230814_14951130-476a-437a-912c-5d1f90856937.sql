
-- Seed initial snapshot
INSERT INTO public.metrics_weekly_snapshots (
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
FROM public.compute_platform_metrics() m
ON CONFLICT (snapshot_date) DO NOTHING;
