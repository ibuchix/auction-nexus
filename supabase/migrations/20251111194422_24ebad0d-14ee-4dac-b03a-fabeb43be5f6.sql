-- Fix RLS policies for car_file_uploads to allow admin access via JWT

-- Drop existing admin policy if it exists
DROP POLICY IF EXISTS "admin_jwt_car_file_uploads_access" ON public.car_file_uploads;
DROP POLICY IF EXISTS "admin_car_file_uploads_all" ON public.car_file_uploads;

-- Create comprehensive admin policy that checks JWT directly
CREATE POLICY "admin_car_file_uploads_all"
ON public.car_file_uploads
FOR ALL
TO authenticated
USING (
  COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'user_role')::text = 'admin',
    false
  )
)
WITH CHECK (
  COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'user_role')::text = 'admin',
    false
  )
);

-- Also update is_admin_from_jwt function to use SECURITY INVOKER for better context
CREATE OR REPLACE FUNCTION public.is_admin_from_jwt()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin',
    false
  );
$$;