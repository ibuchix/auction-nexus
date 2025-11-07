-- Phase 1: Immediate Security Fixes (Complete cleanup and recreation)

-- Step 1: Drop existing policies on user_roles if table exists
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Step 2: Drop existing has_role function with CASCADE
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role) CASCADE;
DROP FUNCTION IF EXISTS public.has_role(uuid, user_role) CASCADE;

-- Step 3: Drop and recreate user_roles table with correct type
DROP TABLE IF EXISTS public.user_roles CASCADE;
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create has_role() security definer function with user_role type
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role user_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Step 5: Sync all existing roles from profiles to user_roles
INSERT INTO user_roles (user_id, role, assigned_at)
SELECT 
  id,
  role,
  NOW()
FROM profiles
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 6: Remove dangerous and duplicate policies from profiles
DROP POLICY IF EXISTS "Users can view limited data from other profiles" ON public.profiles;
DROP POLICY IF EXISTS "admin_profiles_access" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Step 7: Create safe admin policy using has_role() - NO RECURSION
CREATE POLICY "Admins have full access to profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::user_role));

-- Step 8: Create RLS policies for user_roles table
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::user_role));

-- Step 9: Create sync trigger to keep profiles.role and user_roles in sync
CREATE OR REPLACE FUNCTION sync_profile_role_to_user_roles()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When profile role is updated, sync to user_roles
  IF TG_OP = 'UPDATE' AND OLD.role IS DISTINCT FROM NEW.role THEN
    -- Delete old role if it exists
    DELETE FROM user_roles 
    WHERE user_id = NEW.id AND role = OLD.role;
    
    -- Insert new role
    INSERT INTO user_roles (user_id, role, assigned_at, assigned_by)
    VALUES (NEW.id, NEW.role, NOW(), auth.uid())
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  -- When new profile is created with a role
  IF TG_OP = 'INSERT' AND NEW.role IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role, assigned_at, assigned_by)
    VALUES (NEW.id, NEW.role, NOW(), auth.uid())
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_profile_role_trigger ON profiles;
CREATE TRIGGER sync_profile_role_trigger
  AFTER INSERT OR UPDATE OF role ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_profile_role_to_user_roles();

-- Log the security fix
INSERT INTO system_logs (
  log_type,
  message,
  details
) VALUES (
  'security_fix',
  'Phase 1 security fixes applied: Removed dangerous policies, added safe admin access using has_role()',
  jsonb_build_object(
    'actions', ARRAY['sync_roles', 'remove_gdpr_violation', 'add_has_role_policies', 'add_sync_trigger'],
    'timestamp', NOW()
  )
);