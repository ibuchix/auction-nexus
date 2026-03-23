
-- Create seller_email_events table
CREATE TABLE public.seller_email_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  type text NOT NULL,
  seller_id uuid NOT NULL,
  recipient_email text NOT NULL,
  subject text NOT NULL,
  message_id text NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- Index on seller_id for fast lookups
CREATE INDEX idx_seller_email_events_seller_id ON public.seller_email_events(seller_id);

-- Enable RLS
ALTER TABLE public.seller_email_events ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role full access on seller_email_events"
  ON public.seller_email_events FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Admins can view
CREATE POLICY "Admins can view seller email events"
  ON public.seller_email_events FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::user_role));

-- Grant table-level permissions
GRANT SELECT ON public.seller_email_events TO authenticated;
GRANT ALL ON public.seller_email_events TO service_role;

-- RPC to get send counts per seller
CREATE OR REPLACE FUNCTION public.get_seller_email_notification_counts(p_seller_ids uuid[])
RETURNS TABLE(seller_id uuid, type text, send_count integer)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $fn$
  SELECT e.seller_id, e.type, COUNT(*)::int AS send_count
  FROM public.seller_email_events e
  WHERE e.seller_id = ANY(p_seller_ids)
  GROUP BY e.seller_id, e.type
$fn$;
