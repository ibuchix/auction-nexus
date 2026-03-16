-- Part 1: Retroactive backfill - attribute unlinked events via IP hash matching
UPDATE tracking_events te
SET link_id = matched.link_id
FROM (
  SELECT DISTINCT ON (unlinked.id) unlinked.id, linked.link_id
  FROM tracking_events unlinked
  JOIN tracking_events linked 
    ON linked.ip_hash = unlinked.ip_hash 
    AND linked.link_id IS NOT NULL
    AND linked.event_type = 'link_click'
  WHERE unlinked.link_id IS NULL
    AND unlinked.event_type IN ('listing_submitted', 'registration', 'valuation_started', 'valuation_completed')
    AND unlinked.ip_hash IS NOT NULL
  ORDER BY unlinked.id, linked.created_at DESC
) matched
WHERE te.id = matched.id;

-- Also backfill tracking_conversions for newly attributed events
INSERT INTO tracking_conversions (link_id, event_id, conversion_type, user_id)
SELECT te.link_id, te.id, te.event_type, te.user_id
FROM tracking_events te
WHERE te.link_id IS NOT NULL
  AND te.event_type IN ('listing_submitted', 'registration', 'valuation_started', 'valuation_completed')
  AND NOT EXISTS (
    SELECT 1 FROM tracking_conversions tc WHERE tc.event_id = te.id
  );

-- Part 2: Replace get_tracking_funnel_stats with smart IP-hash attribution
CREATE OR REPLACE FUNCTION public.get_tracking_funnel_stats(
  _from timestamp with time zone DEFAULT NULL,
  _to timestamp with time zone DEFAULT NULL
)
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
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $function$
  WITH attributed_events AS (
    -- Events that already have a link_id
    SELECT te.id, te.event_type, te.link_id, te.created_at
    FROM tracking_events te
    WHERE te.link_id IS NOT NULL
      AND (_from IS NULL OR te.created_at >= _from)
      AND (_to IS NULL OR te.created_at <= _to)

    UNION ALL

    -- Unlinked events attributed via ip_hash to a prior link_click
    SELECT te.id, te.event_type, ip_match.link_id, te.created_at
    FROM tracking_events te
    JOIN LATERAL (
      SELECT linked.link_id
      FROM tracking_events linked
      WHERE linked.ip_hash = te.ip_hash
        AND linked.link_id IS NOT NULL
        AND linked.event_type = 'link_click'
        AND linked.created_at <= te.created_at
      ORDER BY linked.created_at DESC
      LIMIT 1
    ) ip_match ON true
    WHERE te.link_id IS NULL
      AND te.ip_hash IS NOT NULL
      AND te.event_type IN ('valuation_started', 'valuation_completed', 'registration', 'listing_submitted')
      AND (_from IS NULL OR te.created_at >= _from)
      AND (_to IS NULL OR te.created_at <= _to)
  ),
  deduped AS (
    SELECT DISTINCT ON (id) id, event_type, link_id
    FROM attributed_events
    ORDER BY id, link_id NULLS LAST
  )

  SELECT
    tl.id AS link_id,
    tl.code AS link_code,
    tl.name AS link_name,
    tl.platform,
    COALESCE(SUM(CASE WHEN d.event_type = 'link_click' THEN 1 ELSE 0 END), 0)::bigint AS clicks,
    COALESCE(SUM(CASE WHEN d.event_type IN ('valuation_started', 'valuation_completed') THEN 1 ELSE 0 END), 0)::bigint AS valuations,
    COALESCE(SUM(CASE WHEN d.event_type = 'registration' THEN 1 ELSE 0 END), 0)::bigint AS registrations,
    COALESCE(SUM(CASE WHEN d.event_type = 'listing_submitted' THEN 1 ELSE 0 END), 0)::bigint AS listings
  FROM tracking_links tl
  LEFT JOIN deduped d ON d.link_id = tl.id
  GROUP BY tl.id, tl.code, tl.name, tl.platform

  UNION ALL

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
    AND te.id NOT IN (SELECT id FROM deduped)
    AND (_from IS NULL OR te.created_at >= _from)
    AND (_to IS NULL OR te.created_at <= _to)

  ORDER BY clicks DESC;
$function$;
