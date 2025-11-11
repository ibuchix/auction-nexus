-- Fix admin_get_car_files function - correct column name from file_category to category
DROP FUNCTION IF EXISTS admin_get_car_files(uuid);

CREATE OR REPLACE FUNCTION admin_get_car_files(p_car_id uuid)
RETURNS TABLE (
  id uuid,
  car_id uuid,
  file_path text,
  file_type text,
  category text,
  display_order integer,
  upload_status text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();
  
  -- Check if user is admin
  IF NOT has_role(v_user_id, 'admin'::user_role) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;
  
  -- Return car files with completed upload status (excludes deleted files)
  RETURN QUERY
  SELECT 
    cfu.id,
    cfu.car_id,
    cfu.file_path,
    cfu.file_type,
    cfu.category,
    cfu.display_order,
    cfu.upload_status,
    cfu.created_at
  FROM car_file_uploads cfu
  WHERE cfu.car_id = p_car_id
    AND cfu.upload_status = 'completed'
  ORDER BY cfu.display_order, cfu.created_at;
END;
$$;

-- Grant execute permission to authenticated users (function will check admin role internally)
GRANT EXECUTE ON FUNCTION admin_get_car_files(uuid) TO authenticated;