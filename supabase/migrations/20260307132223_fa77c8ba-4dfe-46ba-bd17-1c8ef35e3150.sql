CREATE OR REPLACE FUNCTION get_tracking_funnel_stats(_from timestamptz DEFAULT NULL, _to timestamptz DEFAULT NULL)
RETURNS TABLE(
  link_id uuid,
  link_code text,
  link_name text,
  platform text,
  clicks bigint,
  valuations bigint,
  registrations bigint,
  listings bigint
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  -- Linked events (per tracking link)
  SELECT
    tl.id AS link_id,
    tl.code AS link_code,
    tl.name AS link_name,
    tl.platform,
    COALESCE(SUM(CASE WHEN te.event_type = 'link_click' THEN 1 ELSE 0 END), 0)::bigint AS clicks,
    COALESCE(SUM(CASE WHEN te.event_type IN ('valuation_started', 'valuation_completed') THEN 1 ELSE 0 END), 0)::bigint AS valuations,
    COALESCE(SUM(CASE WHEN te.event_type = 'registration' THEN 1 ELSE 0 END), 0)::bigint AS registrations,
    COALESCE(SUM(CASE WHEN te.event_type = 'listing_submitted' THEN 1 ELSE 0 END), 0)::bigint AS listings
  FROM tracking_links tl
  LEFT JOIN tracking_events te ON te.link_id = tl.id
    AND (_from IS NULL OR te.created_at >= _from)
    AND (_to IS NULL OR te.created_at <= _to)
  GROUP BY tl.id, tl.code, tl.name, tl.platform

  UNION ALL

  -- Unlinked / organic events
  SELECT
    '00000000-0000-0000-0000-000000000000'::uuid AS link_id,
    'organic' AS link_code,
    'Organic / Direct' AS link_name,
    'organic' AS platform,
    COALESCE(SUM(CASE WHEN te.event_type = 'link_click' THEN 1 ELSE 0 END), 0)::bigint AS clicks,
    COALESCE(SUM(CASE WHEN te.event_type IN ('valuation_started', 'valuation_completed') THEN 1 ELSE 0 END), 0)::bigint AS valuations,
    COALESCE(SUM(CASE WHEN te.event_type = 'registration' THEN 1 ELSE 0 END), 0)::bigint AS registrations,
    COALESCE(SUM(CASE WHEN te.event_type = 'listing_submitted' THEN 1 ELSE 0 END), 0)::bigint AS listings
  FROM tracking_events te
  WHERE te.link_id IS NULL
    AND (_from IS NULL OR te.created_at >= _from)
    AND (_to IS NULL OR te.created_at <= _to)

  ORDER BY clicks DESC;
$$;