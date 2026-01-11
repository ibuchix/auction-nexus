-- Create RPC function to get cars ready for auction
-- Uses NOT EXISTS to properly exclude cars that have any auction schedules
CREATE OR REPLACE FUNCTION get_cars_ready_for_auction(
  p_search_term text DEFAULT NULL,
  p_limit integer DEFAULT 30,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  cars_data jsonb,
  total_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH filtered_cars AS (
    SELECT c.*
    FROM cars c
    WHERE c.reserve_price > 0
      AND NOT EXISTS (
        SELECT 1 FROM auction_schedules a WHERE a.car_id = c.id
      )
      AND (
        p_search_term IS NULL 
        OR c.title ILIKE '%' || p_search_term || '%'
        OR c.make ILIKE '%' || p_search_term || '%'
        OR c.model ILIKE '%' || p_search_term || '%'
        OR c.vin ILIKE '%' || p_search_term || '%'
      )
    ORDER BY c.created_at DESC
  )
  SELECT 
    COALESCE(
      (SELECT jsonb_agg(to_jsonb(fc)) FROM (
        SELECT * FROM filtered_cars
        LIMIT p_limit OFFSET p_offset
      ) fc),
      '[]'::jsonb
    ) as cars_data,
    (SELECT COUNT(*) FROM filtered_cars)::bigint as total_count;
END;
$$;