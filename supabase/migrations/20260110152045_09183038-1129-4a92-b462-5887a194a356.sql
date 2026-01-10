-- Update admin_get_manual_valuations to include seller_acceptable_price in returned data
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
  v_image RECORD;
BEGIN
  -- Check if the caller is an admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Loop through valuations
  FOR v_valuation_record IN 
    SELECT * FROM manual_valuations
    WHERE (p_status IS NULL OR status = p_status)
    ORDER BY created_at DESC
  LOOP
    -- Get images for this valuation
    v_images := ARRAY[]::JSONB[];
    FOR v_image IN 
      SELECT id, file_path, file_type, category, display_order, image_metadata
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
        'image_metadata', v_image.image_metadata
      ));
    END LOOP;

    -- Build valuation object in chunks to avoid too many arguments
    -- Chunk 1: Basic info
    v_valuation_obj := jsonb_build_object(
      'id', v_valuation_record.id,
      'user_id', v_valuation_record.user_id,
      'name', v_valuation_record.name,
      'contact_email', v_valuation_record.contact_email,
      'contact_phone', v_valuation_record.contact_phone,
      'mobile_number', v_valuation_record.mobile_number,
      'make', v_valuation_record.make,
      'model', v_valuation_record.model,
      'year', v_valuation_record.year,
      'mileage', v_valuation_record.mileage,
      'vin', v_valuation_record.vin,
      'registration_number', v_valuation_record.registration_number
    );

    -- Chunk 2: Location and vehicle details
    v_valuation_obj := v_valuation_obj || jsonb_build_object(
      'street_address', v_valuation_record.street_address,
      'town', v_valuation_record.town,
      'county', v_valuation_record.county,
      'postcode', v_valuation_record.postcode,
      'fuel_type', v_valuation_record.fuel_type,
      'transmission', v_valuation_record.transmission,
      'first_registration_date', v_valuation_record.first_registration_date,
      'is_registered_in_poland', v_valuation_record.is_registered_in_poland,
      'is_selling_on_behalf', v_valuation_record.is_selling_on_behalf,
      'is_damaged', v_valuation_record.is_damaged,
      'has_documentation', v_valuation_record.has_documentation,
      'has_full_registration_document', v_valuation_record.has_full_registration_document
    );

    -- Chunk 3: Condition questions and finance
    v_valuation_obj := v_valuation_obj || jsonb_build_object(
      'seat_material', v_valuation_record.seat_material,
      'number_of_keys', v_valuation_record.number_of_keys,
      'has_outstanding_finance', v_valuation_record.has_outstanding_finance,
      'finance_amount', v_valuation_record.finance_amount,
      'finance_document_url', v_valuation_record.finance_document_url,
      'finance_document_name', v_valuation_record.finance_document_name,
      'finance_document_uploaded_at', v_valuation_record.finance_document_uploaded_at,
      'runs_smoothly', v_valuation_record.runs_smoothly,
      'engine_faults', v_valuation_record.engine_faults,
      'engine_smokes', v_valuation_record.engine_smokes,
      'gearbox_faults', v_valuation_record.gearbox_faults,
      'electrical_faults', v_valuation_record.electrical_faults
    );

    -- Chunk 4: More condition questions and final fields (added seller_acceptable_price)
    v_valuation_obj := v_valuation_obj || jsonb_build_object(
      'ac_working', v_valuation_record.ac_working,
      'windows_working', v_valuation_record.windows_working,
      'warning_lights_on', v_valuation_record.warning_lights_on,
      'brakes_noisy', v_valuation_record.brakes_noisy,
      'suspension_noisy', v_valuation_record.suspension_noisy,
      'tires_legal_depth', v_valuation_record.tires_legal_depth,
      'has_scratches', v_valuation_record.has_scratches,
      'has_dents', v_valuation_record.has_dents,
      'has_rust', v_valuation_record.has_rust,
      'has_interior_stains', v_valuation_record.has_interior_stains,
      'service_history_type', v_valuation_record.service_history_type,
      'service_history_files', v_valuation_record.service_history_files
    );

    -- Chunk 5: Final fields including seller_acceptable_price
    v_valuation_obj := v_valuation_obj || jsonb_build_object(
      'seller_notes', v_valuation_record.seller_notes,
      'accident_history', v_valuation_record.accident_history,
      'features', v_valuation_record.features,
      'uploaded_photos', v_valuation_record.uploaded_photos,
      'status', v_valuation_record.status,
      'reserve_price', v_valuation_record.reserve_price,
      'seller_acceptable_price', v_valuation_record.seller_acceptable_price,
      'valuation_result', v_valuation_record.valuation_result,
      'created_at', v_valuation_record.created_at,
      'updated_at', v_valuation_record.updated_at,
      'images', to_jsonb(v_images)
    );

    v_result := v_result || jsonb_build_array(v_valuation_obj);
  END LOOP;

  RETURN v_result;
END;
$$;