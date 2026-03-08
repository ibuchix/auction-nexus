DROP FUNCTION IF EXISTS public.get_sellers_with_emails();

CREATE OR REPLACE FUNCTION public.get_sellers_with_emails()
 RETURNS TABLE(id uuid, user_id uuid, full_name text, email character varying, address text, verification_status text, is_verified boolean, created_at timestamp with time zone, total_listings bigint, active_listings bigint, phone_number text)
 LANGUAGE sql
 SECURITY DEFINER
 SET statement_timeout TO '30s'
AS $function$
  SELECT 
    s.id,
    s.user_id,
    s.full_name,
    au.email,
    s.address,
    s.verification_status,
    s.is_verified,
    s.created_at,
    COUNT(DISTINCT c.id) as total_listings,
    COUNT(DISTINCT CASE WHEN c.status = 'available' THEN c.id END) as active_listings,
    s.phone_number
  FROM sellers s
  LEFT JOIN auth.users au ON au.id = s.user_id
  LEFT JOIN cars c ON c.seller_id = s.user_id
  GROUP BY s.id, s.user_id, s.full_name, au.email, s.address, 
           s.verification_status, s.is_verified, s.created_at, s.phone_number
  ORDER BY s.created_at DESC
  LIMIT 5000;
$function$;