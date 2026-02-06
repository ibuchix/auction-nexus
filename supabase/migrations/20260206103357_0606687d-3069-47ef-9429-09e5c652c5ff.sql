-- Drop the existing function first
DROP FUNCTION IF EXISTS get_sellers_with_emails();

-- Recreate with LIMIT 5000
CREATE OR REPLACE FUNCTION get_sellers_with_emails()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  full_name text,
  email varchar(255),
  address text,
  verification_status text,
  is_verified boolean,
  created_at timestamp with time zone,
  total_listings bigint,
  active_listings bigint
)
LANGUAGE sql
SECURITY DEFINER
SET statement_timeout = '30s'
AS $$
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
    COUNT(DISTINCT CASE WHEN c.status = 'available' THEN c.id END) as active_listings
  FROM sellers s
  LEFT JOIN auth.users au ON au.id = s.user_id
  LEFT JOIN cars c ON c.seller_id = s.user_id
  GROUP BY s.id, s.user_id, s.full_name, au.email, s.address, 
           s.verification_status, s.is_verified, s.created_at
  ORDER BY s.created_at DESC
  LIMIT 5000;
$$;