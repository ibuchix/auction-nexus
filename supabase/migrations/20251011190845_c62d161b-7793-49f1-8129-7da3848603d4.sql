-- RPC Function: Get admin notifications with security definer
CREATE OR REPLACE FUNCTION public.get_admin_notifications()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  title text,
  message text,
  type text,
  is_read boolean,
  created_at timestamptz,
  action_url text,
  related_entity_type text,
  related_entity_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  -- Return all notifications for the admin user
  RETURN QUERY
  SELECT 
    n.id,
    n.user_id,
    n.title,
    n.message,
    n.type,
    n.is_read,
    n.created_at,
    n.action_url,
    n.related_entity_type,
    n.related_entity_id
  FROM public.notifications n
  WHERE n.user_id = auth.uid()
  ORDER BY n.created_at DESC
  LIMIT 50;
END;
$$;

-- RPC Function: Mark notification as read
CREATE OR REPLACE FUNCTION public.mark_notification_read(p_notification_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user owns the notification or is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.notifications
    WHERE id = p_notification_id 
    AND (user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role
    ))
  ) THEN
    RAISE EXCEPTION 'Access denied: Notification not found or access denied';
  END IF;

  -- Update the notification
  UPDATE public.notifications
  SET is_read = true
  WHERE id = p_notification_id;
END;
$$;

-- RPC Function: Mark all notifications as read
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update all notifications for the current user
  UPDATE public.notifications
  SET is_read = true
  WHERE user_id = auth.uid() AND is_read = false;
END;
$$;