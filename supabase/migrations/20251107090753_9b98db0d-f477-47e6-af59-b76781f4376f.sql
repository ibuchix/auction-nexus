-- Clean up duplicate policies on profiles table

-- Remove duplicate policies that use 'public' role
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Log the cleanup
INSERT INTO system_logs (
  log_type,
  message,
  details
) VALUES (
  'security_cleanup',
  'Removed duplicate RLS policies from profiles table',
  jsonb_build_object(
    'removed_policies', ARRAY['Users can update their own profile', 'Users can view their own profile'],
    'reason', 'Duplicate of Authenticated users policies',
    'timestamp', NOW()
  )
);