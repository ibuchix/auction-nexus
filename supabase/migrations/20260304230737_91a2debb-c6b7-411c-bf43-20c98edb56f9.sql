
-- Table for weekly metric snapshots
CREATE TABLE public.metrics_weekly_snapshots (
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

-- RLS: admin-only read
ALTER TABLE public.metrics_weekly_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view metrics snapshots"
  ON public.metrics_weekly_snapshots
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Service role can manage metrics snapshots"
  ON public.metrics_weekly_snapshots
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Live computation RPC (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.compute_platform_metrics()
RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
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

-- Weekly cron job: snapshot every Monday at 08:00 UTC
SELECT cron.schedule('weekly-metrics-snapshot', '0 8 * * 1', $$
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
$$);
