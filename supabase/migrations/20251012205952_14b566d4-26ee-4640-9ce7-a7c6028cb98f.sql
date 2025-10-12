-- Create function to get dealer emails from auth.users
CREATE OR REPLACE FUNCTION public.get_dealer_email_info()
RETURNS TABLE (
  dealer_id uuid,
  user_id uuid,
  dealer_email text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id as dealer_id,
    d.user_id,
    u.email::text as dealer_email
  FROM public.dealers d
  LEFT JOIN auth.users u ON d.user_id = u.id
  WHERE d.user_id IS NOT NULL
  GROUP BY d.id, d.user_id, u.email;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_dealer_email_info() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_dealer_email_info() TO service_role;