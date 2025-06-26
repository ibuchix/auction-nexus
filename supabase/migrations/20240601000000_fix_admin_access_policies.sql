
-- Fix admin access issues by creating robust RLS policies and admin check functions

-- Create or replace admin check function that's more reliable
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  -- First check if user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user has admin role in profiles table
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'::user_role
  );
END;
$$;

-- Create a more specific admin check for current user
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN public.is_admin();
END;
$$;

-- Drop existing policies for auction_results if they exist
DROP POLICY IF EXISTS "Users can view their own auction results" ON public.auction_results;
DROP POLICY IF EXISTS "Admins can view all auction results" ON public.auction_results;
DROP POLICY IF EXISTS "Sellers can view auction results for their cars" ON public.auction_results;

-- Create comprehensive policies for auction_results table
CREATE POLICY "Admin full access to auction_results"
ON public.auction_results
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Sellers can view their auction results"
ON public.auction_results
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.cars c 
    WHERE c.id = auction_results.car_id 
    AND c.seller_id = auth.uid()
  )
);

CREATE POLICY "Dealers can view auction results for auctions they participated in"
ON public.auction_results
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.bids b 
    WHERE b.car_id = auction_results.car_id 
    AND b.dealer_id = auth.uid()
  )
);

-- Drop existing policies for bid_metrics if they exist
DROP POLICY IF EXISTS "Users can view bid metrics" ON public.bid_metrics;
DROP POLICY IF EXISTS "Admins can view all bid metrics" ON public.bid_metrics;

-- Create comprehensive policies for bid_metrics table
CREATE POLICY "Admin full access to bid_metrics"
ON public.bid_metrics
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Dealers can view their own bid metrics"
ON public.bid_metrics
FOR SELECT
TO authenticated
USING (dealer_id = auth.uid());

-- Drop existing policies for cars if they exist that might be too restrictive
DROP POLICY IF EXISTS "Admins can manage all cars" ON public.cars;

-- Create comprehensive admin policy for cars table
CREATE POLICY "Admin full access to cars"
ON public.cars
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Drop existing policies for auction_schedules if they exist
DROP POLICY IF EXISTS "Admins can manage auction schedules" ON public.auction_schedules;

-- Create comprehensive policies for auction_schedules table
CREATE POLICY "Admin full access to auction_schedules"
ON public.auction_schedules
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Ensure all relevant tables have RLS enabled
ALTER TABLE public.auction_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bid_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_schedules ENABLE ROW LEVEL SECURITY;

-- Add policies for other admin-critical tables
DROP POLICY IF EXISTS "Admin full access to profiles" ON public.profiles;
CREATE POLICY "Admin full access to profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin full access to dealers" ON public.dealers;
CREATE POLICY "Admin full access to dealers"
ON public.dealers
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin full access to sellers" ON public.sellers;
CREATE POLICY "Admin full access to sellers"
ON public.sellers
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin full access to bids" ON public.bids;
CREATE POLICY "Admin full access to bids"
ON public.bids
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin full access to proxy_bids" ON public.proxy_bids;
CREATE POLICY "Admin full access to proxy_bids"
ON public.proxy_bids
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Grant necessary permissions to authenticated users
GRANT SELECT ON public.auction_results TO authenticated;
GRANT SELECT ON public.bid_metrics TO authenticated;
GRANT ALL ON public.auction_schedules TO authenticated;

-- Create a function to test admin access
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
  -- Get user info
  SELECT role::text INTO v_user_role FROM public.profiles WHERE id = v_user_id;
  v_is_admin := public.is_admin();
  
  -- Test access to problematic tables
  v_result := v_result || jsonb_build_object(
    'user_id', v_user_id,
    'user_role', v_user_role,
    'is_admin_function', v_is_admin,
    'auction_results_count', (SELECT COUNT(*) FROM public.auction_results),
    'bid_metrics_count', (SELECT COUNT(*) FROM public.bid_metrics),
    'cars_count', (SELECT COUNT(*) FROM public.cars)
  );
  
  RETURN v_result;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'error', SQLERRM,
    'user_id', v_user_id,
    'is_admin_function', v_is_admin
  );
END;
$$;
