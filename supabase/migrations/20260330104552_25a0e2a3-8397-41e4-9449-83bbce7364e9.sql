
-- Create whatsapp_message_log table
CREATE TABLE public.whatsapp_message_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id uuid NOT NULL REFERENCES public.dealers(id) ON DELETE CASCADE,
  car_id uuid REFERENCES public.cars(id) ON DELETE SET NULL,
  phone_number text NOT NULL,
  message_body text NOT NULL,
  template_name text,
  twilio_message_sid text,
  status text NOT NULL DEFAULT 'queued',
  error_message text,
  sent_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.whatsapp_message_log ENABLE ROW LEVEL SECURITY;

-- Admin-only RLS policies
CREATE POLICY "Admins can view all messages"
  ON public.whatsapp_message_log
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert messages"
  ON public.whatsapp_message_log
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Grant table-level permissions
GRANT SELECT, INSERT ON public.whatsapp_message_log TO authenticated;
