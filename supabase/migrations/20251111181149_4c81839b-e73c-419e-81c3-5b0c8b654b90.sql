-- Create SECURITY DEFINER function for admins to access car files bypassing RLS
CREATE OR REPLACE FUNCTION public.admin_get_car_files(p_car_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_result jsonb;
  v_files jsonb[];
  v_file_record record;
  v_signed_url text;
  v_bucket text;
BEGIN
  -- Check if user is admin
  IF NOT has_role(auth.uid(), 'admin'::user_role) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- Initialize array
  v_files := ARRAY[]::jsonb[];

  -- Get all car files (bypasses RLS due to SECURITY DEFINER)
  FOR v_file_record IN 
    SELECT 
      cfu.id,
      cfu.file_path,
      cfu.category,
      cfu.display_order,
      cfu.file_type,
      cfu.upload_status,
      cfu.created_at
    FROM car_file_uploads cfu
    WHERE cfu.car_id = p_car_id
      AND cfu.upload_status = 'completed'
      AND (cfu.is_deleted IS NULL OR cfu.is_deleted = false)
    ORDER BY cfu.display_order, cfu.created_at
  LOOP
    -- Determine bucket based on file type
    IF v_file_record.file_type LIKE 'image%' THEN
      v_bucket := 'car-images';
    ELSE
      v_bucket := 'car-files';
    END IF;

    -- Generate signed URL (valid for 1 hour)
    BEGIN
      v_signed_url := storage.create_signed_url(v_bucket, v_file_record.file_path, 3600);
    EXCEPTION WHEN OTHERS THEN
      v_signed_url := NULL;
    END;

    -- Add file with signed URL to array
    v_files := v_files || jsonb_build_object(
      'id', v_file_record.id,
      'file_path', v_file_record.file_path,
      'signed_url', v_signed_url,
      'category', v_file_record.category,
      'display_order', v_file_record.display_order,
      'file_type', v_file_record.file_type,
      'upload_status', v_file_record.upload_status,
      'created_at', v_file_record.created_at,
      'source', 'car_file_uploads'
    );
  END LOOP;

  -- Build final result
  v_result := jsonb_build_object(
    'success', true,
    'files', v_files
  );

  RETURN v_result;

EXCEPTION WHEN OTHERS THEN
  -- Return error response
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

COMMENT ON FUNCTION public.admin_get_car_files IS 
'Admin function to retrieve all car files with signed URLs, bypassing RLS. Only accessible to users with admin role.';