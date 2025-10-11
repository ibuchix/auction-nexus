-- Simplify get_cars_with_seller_info to only return seller info for email lookup
DROP FUNCTION IF EXISTS public.get_cars_with_seller_info();

CREATE FUNCTION public.get_cars_with_seller_info()
RETURNS TABLE (
  seller_id uuid,
  seller_email text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.seller_id,
    u.email::text as seller_email
  FROM public.cars c
  LEFT JOIN auth.users u ON c.seller_id = u.id
  WHERE c.seller_id IS NOT NULL
  GROUP BY c.seller_id, u.email;
END;
$$;