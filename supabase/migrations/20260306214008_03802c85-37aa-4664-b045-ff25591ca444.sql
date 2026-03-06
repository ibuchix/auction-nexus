
CREATE OR REPLACE FUNCTION public.increment_click_count(_link_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE tracking_links SET click_count = click_count + 1 WHERE id = _link_id;
$$;
