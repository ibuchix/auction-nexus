-- Create RPC function to get valuation stats for last 7 days
CREATE OR REPLACE FUNCTION public.get_valuation_stats_last_7_days()
RETURNS TABLE(valuation_date DATE, check_count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify admin access
  IF NOT public.has_role(auth.uid(), 'admin'::user_role) THEN
    RAISE EXCEPTION 'Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT 
    (vc.created_at AT TIME ZONE 'UTC')::date as valuation_date,
    COUNT(*) as check_count
  FROM vin_valuation_cache vc
  WHERE vc.created_at >= (CURRENT_DATE - INTERVAL '6 days')
  GROUP BY (vc.created_at AT TIME ZONE 'UTC')::date
  ORDER BY valuation_date DESC;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_valuation_stats_last_7_days() TO authenticated;