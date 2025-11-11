-- Drop the broken TEXT version of has_role that causes type mismatch errors
DROP FUNCTION IF EXISTS has_role(uuid, text);

-- Recreate check_is_admin to use proper enum casting
-- This ensures it calls the working has_role(uuid, user_role) function
CREATE OR REPLACE FUNCTION check_is_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Explicitly cast 'admin' to user_role enum type
  RETURN has_role(auth.uid(), 'admin'::user_role);
END;
$$;

-- Grant execute permissions to authenticated and anon roles
GRANT EXECUTE ON FUNCTION check_is_admin() TO authenticated, anon;

-- Verify the admin user has the role
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'::user_role
FROM auth.users
WHERE email = 'development@auto-strada.pl'
ON CONFLICT (user_id, role) DO NOTHING;