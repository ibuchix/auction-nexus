-- Admin file management operations for car_file_uploads
-- These functions bypass RLS for authenticated admin users

-- Function 1: Delete a car file (mark as deleted)
CREATE OR REPLACE FUNCTION admin_delete_car_file(
  p_file_id uuid,
  p_table_name text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();
  
  -- Check if user is admin using has_role (consistent with admin_get_car_files)
  IF NOT has_role(v_user_id, 'admin'::user_role) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  -- Update file status based on table
  IF p_table_name = 'car_file_uploads' THEN
    UPDATE car_file_uploads
    SET upload_status = 'deleted',
        updated_at = now()
    WHERE id = p_file_id;
  ELSIF p_table_name = 'manual_file_uploads' THEN
    UPDATE manual_file_uploads
    SET upload_status = 'deleted',
        updated_at = now()
    WHERE id = p_file_id;
  ELSE
    RAISE EXCEPTION 'Invalid table name: %', p_table_name;
  END IF;
  
  -- Check if update actually affected a row
  IF NOT FOUND THEN
    RAISE EXCEPTION 'File not found with id: %', p_file_id;
  END IF;
END;
$$;

-- Function 2: Upload a new car file
CREATE OR REPLACE FUNCTION admin_upload_car_file(
  p_car_id uuid,
  p_seller_id uuid,
  p_file_path text,
  p_file_type text,
  p_category text,
  p_display_order integer
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_file_id uuid;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();
  
  -- Check if user is admin
  IF NOT has_role(v_user_id, 'admin'::user_role) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  -- Insert new file record
  INSERT INTO car_file_uploads (
    car_id,
    seller_id,
    file_path,
    file_type,
    category,
    display_order,
    upload_status
  ) VALUES (
    p_car_id,
    p_seller_id,
    p_file_path,
    p_file_type,
    p_category,
    p_display_order,
    'completed'
  )
  RETURNING id INTO v_file_id;

  RETURN v_file_id;
END;
$$;

-- Function 3: Reorder car files
CREATE OR REPLACE FUNCTION admin_reorder_car_files(
  p_files jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_file jsonb;
  v_file_id uuid;
  v_display_order integer;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();
  
  -- Check if user is admin
  IF NOT has_role(v_user_id, 'admin'::user_role) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  -- Update display order for each file
  FOR v_file IN SELECT * FROM jsonb_array_elements(p_files)
  LOOP
    v_file_id := (v_file->>'id')::uuid;
    v_display_order := (v_file->>'display_order')::integer;
    
    UPDATE car_file_uploads
    SET display_order = v_display_order,
        updated_at = now()
    WHERE id = v_file_id;
  END LOOP;
END;
$$;

-- Grant execute permissions to authenticated users (functions check admin role internally)
GRANT EXECUTE ON FUNCTION admin_delete_car_file(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_upload_car_file(uuid, uuid, text, text, text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_reorder_car_files(jsonb) TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION admin_delete_car_file IS 'Admin function to mark car files as deleted, bypassing RLS';
COMMENT ON FUNCTION admin_upload_car_file IS 'Admin function to upload new car files, bypassing RLS';
COMMENT ON FUNCTION admin_reorder_car_files IS 'Admin function to reorder car files, bypassing RLS';