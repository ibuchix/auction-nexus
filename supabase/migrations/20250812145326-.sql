-- Remove overly permissive policy added in previous migration
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'email_notification_events' 
      AND policyname = 'Service role can manage email events'
  ) THEN
    DROP POLICY "Service role can manage email events" ON public.email_notification_events;
  END IF;
END $$;