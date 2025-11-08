-- Create RPC function to fetch activity logs (bypasses RLS with SECURITY DEFINER)
CREATE OR REPLACE FUNCTION get_activity_logs(
  p_action_filter TEXT DEFAULT NULL,
  p_date_from TIMESTAMPTZ DEFAULT NULL,
  p_date_to TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  action audit_log_type,
  entity_type TEXT,
  entity_id UUID,
  created_at TIMESTAMPTZ,
  details JSONB,
  user_id UUID,
  user_full_name TEXT
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
    p.full_name as user_full_name
  FROM audit_logs al
  LEFT JOIN profiles p ON al.user_id = p.id
  WHERE 
    (p_action_filter IS NULL OR al.action::TEXT = p_action_filter)
    AND (p_date_from IS NULL OR al.created_at >= p_date_from)
    AND (p_date_to IS NULL OR al.created_at < p_date_to)
  ORDER BY al.created_at DESC
  LIMIT 100;
END;
$$;