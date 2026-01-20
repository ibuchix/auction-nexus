-- Fix admin_get_manual_valuations: change 'users' to 'profiles' for role check
CREATE OR REPLACE FUNCTION public.admin_get_manual_valuations(p_status TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB := '[]'::JSONB;
  v_valuation_record RECORD;
  v_valuation_obj JSONB;
  v_images JSONB[];
  v_videos JSONB[];
  v_image RECORD;
  v_video RECORD;
  v_user_role TEXT;
BEGIN
  -- Check if user has admin role (FIXED: use 'profiles' table, not 'users')
  SELECT role INTO v_user_role
  FROM profiles
  WHERE id = auth.uid();

  IF v_user_role != 'admin' THEN
    RAISE EXCEPTION 'Admin privileges required';
  END IF;

  -- Fetch valuations with optional status filter
  FOR v_valuation_record IN 
    SELECT *
    FROM manual_valuations
    WHERE (p_status IS NULL OR status = p_status)
    ORDER BY created_at DESC
  LOOP
    -- Build images array for this valuation
    v_images := ARRAY[]::JSONB[];
    FOR v_image IN 
      SELECT id, file_path, file_type, category, display_order, created_at
      FROM manual_file_uploads
      WHERE manual_valuation_id = v_valuation_record.id
      AND file_type LIKE 'image/%'
      ORDER BY display_order ASC, created_at ASC
    LOOP
      v_images := array_append(v_images, jsonb_build_object(
        'id', v_image.id,
        'file_path', v_image.file_path,
        'file_type', v_image.file_type,
        'category', v_image.category,
        'display_order', v_image.display_order,
        'created_at', v_image.created_at
      ));
    END LOOP;

    -- Build videos array for this valuation
    v_videos := ARRAY[]::JSONB[];
    FOR v_video IN 
      SELECT id, file_path, file_type, category, display_order, created_at
      FROM manual_file_uploads
      WHERE manual_valuation_id = v_valuation_record.id
      AND file_type LIKE 'video/%'
      ORDER BY display_order ASC, created_at ASC
    LOOP
      v_videos := array_append(v_videos, jsonb_build_object(
        'id', v_video.id,
        'file_path', v_video.file_path,
        'file_type', v_video.file_type,
        'category', v_video.category,
        'display_order', v_video.display_order,
        'created_at', v_video.created_at
      ));
    END LOOP;

    -- Build the valuation object with images and videos
    v_valuation_obj := jsonb_build_object(
      'id', v_valuation_record.id,
      'seller_name', v_valuation_record.seller_name,
      'seller_email', v_valuation_record.seller_email,
      'seller_phone', v_valuation_record.seller_phone,
      'contact_email', v_valuation_record.contact_email,
      'contact_phone', v_valuation_record.contact_phone,
      'vehicle_title', v_valuation_record.vehicle_title,
      'make', v_valuation_record.make,
      'model', v_valuation_record.model,
      'year', v_valuation_record.year,
      'mileage', v_valuation_record.mileage,
      'vin', v_valuation_record.vin,
      'registration_number', v_valuation_record.registration_number,
      'first_registration_date', v_valuation_record.first_registration_date,
      'condition', v_valuation_record.condition,
      'description', v_valuation_record.description,
      'valuation_price', v_valuation_record.valuation_price,
      'reserve_price', v_valuation_record.reserve_price,
      'admin_notes', v_valuation_record.admin_notes,
      'status', v_valuation_record.status,
      'created_at', v_valuation_record.created_at,
      'updated_at', v_valuation_record.updated_at,
      'seller_id', v_valuation_record.seller_id,
      'fuel_type', v_valuation_record.fuel_type,
      'transmission', v_valuation_record.transmission,
      'engine_capacity', v_valuation_record.engine_capacity,
      'power_hp', v_valuation_record.power_hp,
      'drive_type', v_valuation_record.drive_type,
      'body_type', v_valuation_record.body_type,
      'number_of_doors', v_valuation_record.number_of_doors,
      'number_of_seats', v_valuation_record.number_of_seats,
      'color', v_valuation_record.color,
      'interior_color', v_valuation_record.interior_color,
      'interior_material', v_valuation_record.interior_material,
      'features', v_valuation_record.features,
      'service_history', v_valuation_record.service_history,
      'previous_owners', v_valuation_record.previous_owners,
      'accident_history', v_valuation_record.accident_history,
      'country_of_origin', v_valuation_record.country_of_origin,
      'images', to_jsonb(v_images),
      'videos', to_jsonb(v_videos)
    );

    v_result := v_result || jsonb_build_array(v_valuation_obj);
  END LOOP;

  RETURN v_result;
END;
$$;