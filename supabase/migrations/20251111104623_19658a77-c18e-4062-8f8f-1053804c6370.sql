-- Fix check_is_admin function to include proper search_path
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::user_role);
$$;