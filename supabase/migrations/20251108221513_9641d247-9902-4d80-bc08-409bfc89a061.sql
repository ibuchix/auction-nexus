-- Create secure RPC function for form tracking logs
CREATE OR REPLACE FUNCTION get_form_tracking_logs()
RETURNS TABLE (
  id UUID,
  action TEXT,
  entity_type TEXT,
  entity_id TEXT,
  created_at TIMESTAMPTZ,
  details JSONB,
  user_id UUID,
  user_full_name TEXT,
  user_email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.action,
    al.entity_type,
    al.entity_id,
    al.created_at,
    al.details,
    al.user_id,
    p.full_name as user_full_name,
    au.email as user_email
  FROM audit_logs al
  LEFT JOIN profiles p ON al.user_id = p.id
  LEFT JOIN auth.users au ON al.user_id = au.id
  WHERE al.action = 'system_alert'
    AND al.entity_type = 'form_tracking'
  ORDER BY al.created_at DESC
  LIMIT 1000;
END;
$$;