-- 1) Create table for email notification events and supporting RPC

-- Create table
CREATE TABLE IF NOT EXISTS public.email_notification_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  type text NOT NULL, -- e.g., 'seller_auction_ended' | 'dealer_bid_accepted' | 'dealer_bid_declined'
  car_id uuid NOT NULL,
  dealer_id uuid NULL,
  recipient_email text NOT NULL,
  subject text NOT NULL,
  message_id text NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.email_notification_events ENABLE ROW LEVEL SECURITY;

-- Policies
-- Service role can do everything (edge functions use service role key)
CREATE POLICY "Service role can manage email events"
ON public.email_notification_events
AS PERMISSIVE
FOR ALL
TO PUBLIC
USING (true)
WITH CHECK (true);

-- Admins can view email events
CREATE POLICY "Admins can view email events"
ON public.email_notification_events
AS PERMISSIVE
FOR SELECT
TO PUBLIC
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'::user_role
  )
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_email_events_car_id ON public.email_notification_events(car_id);
CREATE INDEX IF NOT EXISTS idx_email_events_car_type ON public.email_notification_events(car_id, type);

-- 2) Aggregation function to return counts for a list of cars
CREATE OR REPLACE FUNCTION public.get_email_notification_counts(p_car_ids uuid[])
RETURNS TABLE(car_id uuid, type text, send_count integer)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $fn$
  SELECT e.car_id, e.type, COUNT(*)::int AS send_count
  FROM public.email_notification_events e
  WHERE e.car_id = ANY(p_car_ids)
  GROUP BY e.car_id, e.type
$fn$;