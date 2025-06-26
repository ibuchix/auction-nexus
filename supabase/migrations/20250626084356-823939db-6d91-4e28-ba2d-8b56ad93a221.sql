
-- Comprehensive admin access fix migration
-- This cleans up all conflicting policies and creates reliable admin access

-- Update the is_admin function to be more reliable
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  -- Check if user is authenticated and has admin role
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'::user_role
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Create enhanced test function
CREATE OR REPLACE FUNCTION public.test_admin_access()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb := '{}'::jsonb;
  v_user_id uuid := auth.uid();
  v_is_admin boolean;
  v_user_role text;
BEGIN
  -- Get user info safely
  BEGIN
    SELECT role::text INTO v_user_role FROM public.profiles WHERE id = v_user_id;
    v_is_admin := public.is_admin();
  EXCEPTION
    WHEN OTHERS THEN
      v_user_role := 'error';
      v_is_admin := false;
  END;
  
  -- Build result object
  v_result := jsonb_build_object(
    'user_id', v_user_id,
    'user_role', v_user_role,
    'is_admin_function', v_is_admin,
    'auth_context_working', (auth.uid() IS NOT NULL)
  );
  
  -- Try to count records safely
  BEGIN
    v_result := v_result || jsonb_build_object(
      'auction_results_count', (SELECT COUNT(*) FROM public.auction_results),
      'bid_metrics_count', (SELECT COUNT(*) FROM public.bid_metrics),
      'cars_count', (SELECT COUNT(*) FROM public.cars)
    );
  EXCEPTION
    WHEN OTHERS THEN
      v_result := v_result || jsonb_build_object(
        'table_access_error', SQLERRM
      );
  END;
  
  RETURN v_result;
END;
$$;

-- AUCTION_RESULTS TABLE - Clean up all conflicting policies
DROP POLICY IF EXISTS "Admin full access to auction_results" ON public.auction_results;
DROP POLICY IF EXISTS "Admins can manage auction results" ON public.auction_results;
DROP POLICY IF EXISTS "Admins can view all auction results" ON public.auction_results;
DROP POLICY IF EXISTS "Sellers can view auction results for their cars" ON public.auction_results;
DROP POLICY IF EXISTS "Dealers can view auction results for auctions they participated in" ON public.auction_results;
DROP POLICY IF EXISTS "Users can view their own auction results" ON public.auction_results;

-- Create single admin policy for auction_results
CREATE POLICY "admin_full_access_auction_results"
ON public.auction_results
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- BID_METRICS TABLE - Clean up all conflicting policies
DROP POLICY IF EXISTS "Admin full access to bid_metrics" ON public.bid_metrics;
DROP POLICY IF EXISTS "Admins can view all bid metrics" ON public.bid_metrics;
DROP POLICY IF EXISTS "Users can view bid metrics" ON public.bid_metrics;
DROP POLICY IF EXISTS "Dealers can view their own bid metrics" ON public.bid_metrics;

-- Create single admin policy for bid_metrics
CREATE POLICY "admin_full_access_bid_metrics"
ON public.bid_metrics
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- CARS TABLE - Clean up conflicting admin policies only
DROP POLICY IF EXISTS "Admin full access to cars" ON public.cars;
DROP POLICY IF EXISTS "Admins can manage all cars" ON public.cars;

-- Create single admin policy for cars
CREATE POLICY "admin_full_access_cars"
ON public.cars
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- AUCTION_SCHEDULES TABLE - Clean up all conflicting policies
DROP POLICY IF EXISTS "Admin full access to auction_schedules" ON public.auction_schedules;
DROP POLICY IF EXISTS "Admins can manage auction schedules" ON public.auction_schedules;

-- Create single admin policy for auction_schedules
CREATE POLICY "admin_full_access_auction_schedules"
ON public.auction_schedules
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- PROFILES TABLE - Clean up conflicting admin policies
DROP POLICY IF EXISTS "Admin full access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Create single admin policy for profiles
CREATE POLICY "admin_full_access_profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- DEALERS TABLE - Clean up conflicting admin policies
DROP POLICY IF EXISTS "Admin full access to dealers" ON public.dealers;
DROP POLICY IF EXISTS "Admins can view all dealers" ON public.dealers;
DROP POLICY IF EXISTS "Admins can manage all dealers" ON public.dealers;

-- Create single admin policy for dealers
CREATE POLICY "admin_full_access_dealers"
ON public.dealers
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- SELLERS TABLE - Clean up conflicting admin policies
DROP POLICY IF EXISTS "Admin full access to sellers" ON public.sellers;
DROP POLICY IF EXISTS "Admins can view all sellers" ON public.sellers;
DROP POLICY IF EXISTS "Admins can manage all sellers" ON public.sellers;

-- Create single admin policy for sellers
CREATE POLICY "admin_full_access_sellers"
ON public.sellers
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- BIDS TABLE - Clean up conflicting admin policies
DROP POLICY IF EXISTS "Admin full access to bids" ON public.bids;
DROP POLICY IF EXISTS "Admins can manage all bids" ON public.bids;

-- Create single admin policy for bids
CREATE POLICY "admin_full_access_bids"
ON public.bids
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- PROXY_BIDS TABLE - Clean up conflicting admin policies
DROP POLICY IF EXISTS "Admin full access to proxy_bids" ON public.proxy_bids;
DROP POLICY IF EXISTS "Admins can manage all proxy_bids" ON public.proxy_bids;

-- Create single admin policy for proxy_bids
CREATE POLICY "admin_full_access_proxy_bids"
ON public.proxy_bids
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Ensure RLS is enabled on all critical tables
ALTER TABLE public.auction_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bid_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proxy_bids ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to authenticated users
GRANT SELECT ON public.auction_results TO authenticated;
GRANT SELECT ON public.bid_metrics TO authenticated;
GRANT ALL ON public.auction_schedules TO authenticated;

-- Create debug function for troubleshooting
CREATE OR REPLACE FUNCTION public.debug_admin_context()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN jsonb_build_object(
    'auth_uid', auth.uid(),
    'auth_role', auth.role(),
    'session_user', session_user,
    'current_user', current_user,
    'is_admin_result', public.is_admin(),
    'profile_exists', EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid()),
    'profile_role', (SELECT role::text FROM public.profiles WHERE id = auth.uid())
  );
END;
$$;
