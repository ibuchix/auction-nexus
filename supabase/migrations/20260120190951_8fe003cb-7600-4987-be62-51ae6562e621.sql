-- Fix admin_get_manual_valuations: use correct column names and has_role for authorization
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
BEGIN
  -- Check if user has admin role using the has_role function (uses user_roles table)
  IF NOT public.has_role(auth.uid(), 'admin') THEN
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

    -- Build the valuation object using CORRECT column names from manual_valuations table
    v_valuation_obj := jsonb_build_object(
      'id', v_valuation_record.id,
      'user_id', v_valuation_record.user_id,
      -- Seller info (correct column names)
      'name', v_valuation_record.name,
      'contact_email', v_valuation_record.contact_email,
      'contact_phone', v_valuation_record.contact_phone,
      'mobile_number', v_valuation_record.mobile_number,
      'street_address', v_valuation_record.street_address,
      'town', v_valuation_record.town,
      'postcode', v_valuation_record.postcode,
      'county', v_valuation_record.county,
      -- Vehicle info
      'make', v_valuation_record.make,
      'model', v_valuation_record.model,
      'year', v_valuation_record.year,
      'mileage', v_valuation_record.mileage,
      'vin', v_valuation_record.vin,
      'registration_number', v_valuation_record.registration_number,
      'first_registration_date', v_valuation_record.first_registration_date,
      'transmission', v_valuation_record.transmission,
      'fuel_type', v_valuation_record.fuel_type,
      'features', v_valuation_record.features,
      'notes', v_valuation_record.notes,
      'seller_notes', v_valuation_record.seller_notes,
      -- Condition fields
      'is_damaged', v_valuation_record.is_damaged,
      'is_registered_in_poland', v_valuation_record.is_registered_in_poland,
      'seat_material', v_valuation_record.seat_material,
      'number_of_keys', v_valuation_record.number_of_keys,
      'has_tool_pack', v_valuation_record.has_tool_pack,
      'has_documentation', v_valuation_record.has_documentation,
      'is_selling_on_behalf', v_valuation_record.is_selling_on_behalf,
      'has_full_registration_document', v_valuation_record.has_full_registration_document,
      'service_history_type', v_valuation_record.service_history_type,
      -- Condition questions
      'ac_working', v_valuation_record.ac_working,
      'windows_working', v_valuation_record.windows_working,
      'tires_legal_depth', v_valuation_record.tires_legal_depth,
      'runs_smoothly', v_valuation_record.runs_smoothly,
      'has_scratches', v_valuation_record.has_scratches,
      'has_dents', v_valuation_record.has_dents,
      'has_rust', v_valuation_record.has_rust,
      'has_interior_stains', v_valuation_record.has_interior_stains,
      'engine_faults', v_valuation_record.engine_faults,
      'gearbox_faults', v_valuation_record.gearbox_faults,
      'electrical_faults', v_valuation_record.electrical_faults,
      'engine_smokes', v_valuation_record.engine_smokes,
      'brakes_noisy', v_valuation_record.brakes_noisy,
      'suspension_noisy', v_valuation_record.suspension_noisy,
      'warning_lights_on', v_valuation_record.warning_lights_on,
      -- Finance fields
      'has_outstanding_finance', v_valuation_record.has_outstanding_finance,
      'finance_amount', v_valuation_record.finance_amount,
      'finance_document_url', v_valuation_record.finance_document_url,
      'finance_document_name', v_valuation_record.finance_document_name,
      'finance_document_uploaded_at', v_valuation_record.finance_document_uploaded_at,
      -- Pricing and status
      'reserve_price', v_valuation_record.reserve_price,
      'seller_acceptable_price', v_valuation_record.seller_acceptable_price,
      'valuation_result', v_valuation_record.valuation_result,
      'status', v_valuation_record.status,
      'created_at', v_valuation_record.created_at,
      'updated_at', v_valuation_record.updated_at,
      -- Media arrays
      'images', to_jsonb(v_images),
      'videos', to_jsonb(v_videos)
    );

    v_result := v_result || jsonb_build_array(v_valuation_obj);
  END LOOP;

  RETURN v_result;
END;
$$;