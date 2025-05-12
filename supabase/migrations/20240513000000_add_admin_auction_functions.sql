
-- Add RPC function to allow admin API to get auction listings bypassing RLS
CREATE OR REPLACE FUNCTION public.admin_get_auction_listings(p_show_all boolean DEFAULT true, p_status text DEFAULT NULL)
RETURNS SETOF cars
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_status IS NULL OR p_status = 'all' THEN
    RETURN QUERY
    SELECT * FROM cars;
  ELSE
    RETURN QUERY
    SELECT * FROM cars
    WHERE auction_status = p_status;
  END IF;
END;
$$;

-- Add RPC function to allow admin API to get active auctions bypassing RLS
CREATE OR REPLACE FUNCTION public.admin_get_active_auctions()
RETURNS SETOF cars
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM cars
  WHERE is_auction = true
  AND auction_status IN ('active', 'pending')
  ORDER BY auction_end_time ASC;
END;
$$;
