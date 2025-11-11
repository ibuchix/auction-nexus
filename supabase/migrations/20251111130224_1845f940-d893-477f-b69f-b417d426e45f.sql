-- Function to sync user role to JWT claims
CREATE OR REPLACE FUNCTION public.sync_user_role_to_jwt()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role_value text;
BEGIN
  -- Get the user's role (assuming one role per user, taking the first if multiple)
  SELECT role::text INTO user_role_value
  FROM public.user_roles
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
  LIMIT 1;

  -- Update the user's JWT claims in auth.users
  UPDATE auth.users
  SET raw_app_meta_data = 
    COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object('user_role', COALESCE(user_role_value, 'user'))
  WHERE id = COALESCE(NEW.user_id, OLD.user_id);

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger to sync role to JWT when role is inserted or updated
DROP TRIGGER IF EXISTS sync_user_role_on_change ON public.user_roles;
CREATE TRIGGER sync_user_role_on_change
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.sync_user_role_to_jwt();

-- Function to sync role to JWT on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Set default role in JWT for new users
  NEW.raw_app_meta_data = 
    COALESCE(NEW.raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object('user_role', 'user');
  RETURN NEW;
END;
$$;

-- Trigger on auth.users for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
BEFORE INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Helper function to check if JWT contains admin role
CREATE OR REPLACE FUNCTION public.is_admin_from_jwt()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin',
    false
  );
$$;

-- Update RLS policies to use JWT claims instead of database queries

-- Drop old has_role based policies and create new JWT-based policies
-- For car_file_uploads
DROP POLICY IF EXISTS "admin_car_file_uploads_access" ON public.car_file_uploads;
DROP POLICY IF EXISTS "Enable all operations for admins on car_file_uploads" ON public.car_file_uploads;
CREATE POLICY "admin_jwt_car_file_uploads_access"
ON public.car_file_uploads
FOR ALL
TO authenticated
USING (is_admin_from_jwt())
WITH CHECK (is_admin_from_jwt());

-- For manual_file_uploads
DROP POLICY IF EXISTS "Enable all operations for admins on manual_file_uploads" ON public.manual_file_uploads;
CREATE POLICY "admin_jwt_manual_file_uploads_access"
ON public.manual_file_uploads
FOR ALL
TO authenticated
USING (is_admin_from_jwt())
WITH CHECK (is_admin_from_jwt());

-- For announcements
DROP POLICY IF EXISTS "Enable all operations for admins on announcements" ON public.announcements;
CREATE POLICY "admin_jwt_announcements_access"
ON public.announcements
FOR ALL
TO authenticated
USING (is_admin_from_jwt())
WITH CHECK (is_admin_from_jwt());

-- For disputes
DROP POLICY IF EXISTS "Enable all operations for admins on disputes" ON public.disputes;
CREATE POLICY "admin_jwt_disputes_access"
ON public.disputes
FOR ALL
TO authenticated
USING (is_admin_from_jwt())
WITH CHECK (is_admin_from_jwt());

-- For dispute_comments
DROP POLICY IF EXISTS "Enable all operations for admins on dispute_comments" ON public.dispute_comments;
CREATE POLICY "admin_jwt_dispute_comments_access"
ON public.dispute_comments
FOR ALL
TO authenticated
USING (is_admin_from_jwt())
WITH CHECK (is_admin_from_jwt());

-- For dealer_verifications
DROP POLICY IF EXISTS "Enable all operations for admins on dealer_verifications" ON public.dealer_verifications;
CREATE POLICY "admin_jwt_dealer_verifications_access"
ON public.dealer_verifications
FOR ALL
TO authenticated
USING (is_admin_from_jwt())
WITH CHECK (is_admin_from_jwt());

-- For listing_verifications
DROP POLICY IF EXISTS "Enable all operations for admins on listing_verifications" ON public.listing_verifications;
CREATE POLICY "admin_jwt_listing_verifications_access"
ON public.listing_verifications
FOR ALL
TO authenticated
USING (is_admin_from_jwt())
WITH CHECK (is_admin_from_jwt());

-- Sync existing user roles to JWT claims
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT DISTINCT ur.user_id, ur.role::text as role
    FROM public.user_roles ur
  LOOP
    UPDATE auth.users
    SET raw_app_meta_data = 
      COALESCE(raw_app_meta_data, '{}'::jsonb) || 
      jsonb_build_object('user_role', user_record.role)
    WHERE id = user_record.user_id;
  END LOOP;
END $$;