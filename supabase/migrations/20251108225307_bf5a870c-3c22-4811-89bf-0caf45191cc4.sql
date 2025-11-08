-- Update is_admin_user to use user_roles table instead of hardcoded UUID
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT public.has_role(user_id, 'admin'::user_role);
$$;