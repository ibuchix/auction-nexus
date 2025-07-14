-- Comprehensive admin access simplification and cleanup
-- This migration removes complexity and implements atomic admin access

-- 1. CLEAN UP CRON JOBS - Remove failing and redundant ones
SELECT cron.unschedule('process_pending_proxy_bids') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'process_pending_proxy_bids'
);

-- Keep only essential cron jobs, remove redundant ones
SELECT cron.unschedule('invoke-function-every-minute') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'invoke-function-every-minute'
);

-- 2. DROP COMPLEX ADMIN FUNCTIONS that cause issues
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_current_user_admin() CASCADE;
DROP FUNCTION IF EXISTS public.test_admin_access() CASCADE;
DROP FUNCTION IF EXISTS public.debug_admin_context() CASCADE;

-- 3. CREATE SIMPLE ADMIN CHECK FUNCTION
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT user_id = '3f07ea49-328e-4e21-878d-bef9f58af02e'::uuid;
$$;

-- 4. CLEAN UP ALL ADMIN RLS POLICIES - Remove duplicates and complex ones

-- Cars table - simple admin access
DROP POLICY IF EXISTS "Admin full cars" ON public.cars;
DROP POLICY IF EXISTS "admin_full_access_cars" ON public.cars;
DROP POLICY IF EXISTS "Admins can manage all cars" ON public.cars;

CREATE POLICY "admin_cars_access"
ON public.cars
FOR ALL
TO authenticated
USING (auth.uid() = '3f07ea49-328e-4e21-878d-bef9f58af02e'::uuid)
WITH CHECK (auth.uid() = '3f07ea49-328e-4e21-878d-bef9f58af02e'::uuid);

-- Auction Results table
DROP POLICY IF EXISTS "Admin full auction results" ON public.auction_results;
DROP POLICY IF EXISTS "admin_full_access_auction_results" ON public.auction_results;

CREATE POLICY "admin_auction_results_access"
ON public.auction_results
FOR ALL
TO authenticated
USING (auth.uid() = '3f07ea49-328e-4e21-878d-bef9f58af02e'::uuid)
WITH CHECK (auth.uid() = '3f07ea49-328e-4e21-878d-bef9f58af02e'::uuid);

-- Auction Schedules table
DROP POLICY IF EXISTS "admin_full_access_auction_schedules" ON public.auction_schedules;

CREATE POLICY "admin_auction_schedules_access"
ON public.auction_schedules
FOR ALL
TO authenticated
USING (auth.uid() = '3f07ea49-328e-4e21-878d-bef9f58af02e'::uuid)
WITH CHECK (auth.uid() = '3f07ea49-328e-4e21-878d-bef9f58af02e'::uuid);

-- Profiles table
DROP POLICY IF EXISTS "admin_full_access_profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;

CREATE POLICY "admin_profiles_access"
ON public.profiles
FOR ALL
TO authenticated
USING (auth.uid() = '3f07ea49-328e-4e21-878d-bef9f58af02e'::uuid)
WITH CHECK (auth.uid() = '3f07ea49-328e-4e21-878d-bef9f58af02e'::uuid);

-- Dealers table
DROP POLICY IF EXISTS "admin_full_access_dealers" ON public.dealers;

CREATE POLICY "admin_dealers_access"
ON public.dealers
FOR ALL
TO authenticated
USING (auth.uid() = '3f07ea49-328e-4e21-878d-bef9f58af02e'::uuid)
WITH CHECK (auth.uid() = '3f07ea49-328e-4e21-878d-bef9f58af02e'::uuid);

-- Sellers table
DROP POLICY IF EXISTS "admin_full_access_sellers" ON public.sellers;

CREATE POLICY "admin_sellers_access"
ON public.sellers
FOR ALL
TO authenticated
USING (auth.uid() = '3f07ea49-328e-4e21-878d-bef9f58af02e'::uuid)
WITH CHECK (auth.uid() = '3f07ea49-328e-4e21-878d-bef9f58af02e'::uuid);

-- Bids table
DROP POLICY IF EXISTS "admin_full_access_bids" ON public.bids;
DROP POLICY IF EXISTS "Admin full bids" ON public.bids;

CREATE POLICY "admin_bids_access"
ON public.bids
FOR ALL
TO authenticated
USING (auth.uid() = '3f07ea49-328e-4e21-878d-bef9f58af02e'::uuid)
WITH CHECK (auth.uid() = '3f07ea49-328e-4e21-878d-bef9f58af02e'::uuid);

-- Bid Metrics table
DROP POLICY IF EXISTS "admin_full_access_bid_metrics" ON public.bid_metrics;

CREATE POLICY "admin_bid_metrics_access"
ON public.bid_metrics
FOR ALL
TO authenticated
USING (auth.uid() = '3f07ea49-328e-4e21-878d-bef9f58af02e'::uuid)
WITH CHECK (auth.uid() = '3f07ea49-328e-4e21-878d-bef9f58af02e'::uuid);

-- Audit Logs table
DROP POLICY IF EXISTS "Admins have full access to audit_logs" ON public.audit_logs;

CREATE POLICY "admin_audit_logs_access"
ON public.audit_logs
FOR ALL
TO authenticated
USING (auth.uid() = '3f07ea49-328e-4e21-878d-bef9f58af02e'::uuid)
WITH CHECK (auth.uid() = '3f07ea49-328e-4e21-878d-bef9f58af02e'::uuid);

-- 5. SIMPLIFY AUCTION STATUS FUNCTIONS - Remove complexity
DROP FUNCTION IF EXISTS public.start_scheduled_auctions() CASCADE;
DROP FUNCTION IF EXISTS public.complete_scheduled_auctions() CASCADE;

-- Create simple auction status update function
CREATE OR REPLACE FUNCTION public.update_auction_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_updated_count INTEGER := 0;
BEGIN
  -- Simple: Update auction status from 'active' to 'ended' for auctions past their end time
  UPDATE public.cars
  SET auction_status = 'ended',
      updated_at = NOW()
  WHERE auction_status = 'active'
    AND auction_end_time < NOW()
    AND auction_end_time IS NOT NULL;
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  
  RETURN jsonb_build_object('auctions_ended', v_updated_count);
END;
$$;

-- 6. REMOVE REDUNDANT CRON JOBS and keep only essential one
SELECT cron.unschedule(jobname) FROM cron.job 
WHERE jobname NOT IN ('update_auction_status');

-- Ensure we have the essential cron job
SELECT cron.schedule(
  'update_auction_status',
  '* * * * *', -- every minute
  'SELECT public.update_auction_status();'
) WHERE NOT EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'update_auction_status'
);

-- 7. LOG THE CLEANUP
INSERT INTO public.system_logs (
  log_type,
  message,
  details
) VALUES (
  'admin_access_simplification',
  'Completed admin access simplification and cleanup',
  jsonb_build_object(
    'removed_complex_functions', true,
    'simplified_rls_policies', true,
    'cleaned_cron_jobs', true,
    'admin_user_id', '3f07ea49-328e-4e21-878d-bef9f58af02e'
  )
);