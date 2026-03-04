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