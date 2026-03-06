
-- tracking_links: one row per generated campaign link
CREATE TABLE public.tracking_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  platform text NOT NULL DEFAULT 'other',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  destination_path text NOT NULL DEFAULT '/sell',
  affiliate_name text,
  is_active boolean NOT NULL DEFAULT true,
  click_count integer NOT NULL DEFAULT 0,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tracking_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage tracking links"
  ON public.tracking_links FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- tracking_events: every seller interaction
CREATE TABLE public.tracking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid REFERENCES public.tracking_links(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  session_id text,
  visitor_id text,
  user_id uuid,
  ip_hash text,
  user_agent text,
  referrer text,
  page_url text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read tracking events"
  ON public.tracking_events FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage tracking events"
  ON public.tracking_events FOR ALL
  USING (true)
  WITH CHECK (true);

-- tracking_conversions: materialized conversion events
CREATE TABLE public.tracking_conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid NOT NULL REFERENCES public.tracking_links(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.tracking_events(id) ON DELETE CASCADE,
  conversion_type text NOT NULL,
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tracking_conversions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read tracking conversions"
  ON public.tracking_conversions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage tracking conversions"
  ON public.tracking_conversions FOR ALL
  USING (true)
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_tracking_events_link_type ON public.tracking_events(link_id, event_type);
CREATE INDEX idx_tracking_events_visitor ON public.tracking_events(visitor_id);
CREATE INDEX idx_tracking_events_created ON public.tracking_events(created_at);
CREATE INDEX idx_tracking_links_code ON public.tracking_links(code);
CREATE INDEX idx_tracking_conversions_link ON public.tracking_conversions(link_id, conversion_type);

-- RPC: get_tracking_funnel_stats
CREATE OR REPLACE FUNCTION public.get_tracking_funnel_stats(
  _from timestamptz DEFAULT NULL,
  _to timestamptz DEFAULT NULL
)
RETURNS TABLE (
  link_id uuid,
  link_code text,
  link_name text,
  platform text,
  clicks bigint,
  valuations bigint,
  registrations bigint,
  listings bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    tl.id AS link_id,
    tl.code AS link_code,
    tl.name AS link_name,
    tl.platform,
    COALESCE(SUM(CASE WHEN te.event_type = 'link_click' THEN 1 ELSE 0 END), 0) AS clicks,
    COALESCE(SUM(CASE WHEN te.event_type IN ('valuation_started', 'valuation_completed') THEN 1 ELSE 0 END), 0) AS valuations,
    COALESCE(SUM(CASE WHEN te.event_type = 'registration' THEN 1 ELSE 0 END), 0) AS registrations,
    COALESCE(SUM(CASE WHEN te.event_type = 'listing_submitted' THEN 1 ELSE 0 END), 0) AS listings
  FROM tracking_links tl
  LEFT JOIN tracking_events te ON te.link_id = tl.id
    AND (_from IS NULL OR te.created_at >= _from)
    AND (_to IS NULL OR te.created_at <= _to)
  GROUP BY tl.id, tl.code, tl.name, tl.platform
  ORDER BY clicks DESC;
$$;
