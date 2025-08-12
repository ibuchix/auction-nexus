-- Add email_notification_sent column if missing
ALTER TABLE public.cars
ADD COLUMN IF NOT EXISTS email_notification_sent boolean NOT NULL DEFAULT false;

-- Function: get_car_summary_for_notifications
CREATE OR REPLACE FUNCTION public.get_car_summary_for_notifications(p_car_id uuid)
RETURNS TABLE (
  seller_id uuid,
  title text,
  make text,
  model text,
  year integer,
  auction_end_time timestamptz
) AS $$
  SELECT c.seller_id, c.title, c.make, c.model, c.year, c.auction_end_time
  FROM public.cars c
  WHERE c.id = p_car_id;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Function: get_dealer_user_id
CREATE OR REPLACE FUNCTION public.get_dealer_user_id(p_dealer_id uuid)
RETURNS uuid AS $$
  SELECT d.user_id
  FROM public.dealers d
  WHERE d.id = p_dealer_id
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Function: mark_car_email_notification_sent
CREATE OR REPLACE FUNCTION public.mark_car_email_notification_sent(p_car_id uuid)
RETURNS boolean AS $$
BEGIN
  UPDATE public.cars
  SET email_notification_sent = true,
      updated_at = NOW()
  WHERE id = p_car_id;
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;