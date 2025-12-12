-- Fix admin_get_manual_valuations: Split jsonb_build_object to avoid 100-argument limit
CREATE OR REPLACE FUNCTION public.admin_get_manual_valuations(p_status text DEFAULT 'all'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_result jsonb;
  v_valuations jsonb[];
  v_valuation_record record;
  v_images jsonb[];
  v_image_record record;
  v_signed_url text;
  v_valuation_obj jsonb;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'::user_role
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- Initialize array
  v_valuations := ARRAY[]::jsonb[];

  -- Get manual valuations based on status filter
  FOR v_valuation_record IN 
    SELECT 
      mv.*
    FROM manual_valuations mv
    WHERE (p_status = 'all' OR mv.status = p_status)
    ORDER BY mv.created_at DESC
  LOOP
    -- Initialize images array for this valuation
    v_images := ARRAY[]::jsonb[];

    -- Get images for this valuation with signed URLs from manual_file_uploads table
    FOR v_image_record IN 
      SELECT 
        mfu.id,
        mfu.file_path,
        mfu.category,
        mfu.display_order,
        mfu.file_type
      FROM manual_file_uploads mfu
      WHERE mfu.manual_valuation_id = v_valuation_record.id
      ORDER BY mfu.display_order, mfu.created_at
    LOOP
      -- Generate signed URL (valid for 1 hour)
      BEGIN
        SELECT storage.create_signed_url('manual-valuation-photos', v_image_record.file_path, 3600) INTO v_signed_url;
        
        IF v_signed_url IS NULL THEN
          v_signed_url := NULL;
        END IF;
      EXCEPTION WHEN OTHERS THEN
        v_signed_url := NULL;
      END;

      -- Add image with signed URL to images array
      v_images := v_images || jsonb_build_object(
        'id', v_image_record.id,
        'file_path', v_image_record.file_path,
        'signed_url', v_signed_url,
        'category', v_image_record.category,
        'display_order', v_image_record.display_order,
        'file_type', v_image_record.file_type
      );
    END LOOP;

    -- Build valuation object in chunks to avoid 100-argument limit
    -- Chunk 1: Identity, Vehicle Details, Contact Info
    v_valuation_obj := jsonb_build_object(
      'id', v_valuation_record.id,
      'user_id', v_valuation_record.user_id,
      'make', v_valuation_record.make,
      'model', v_valuation_record.model,
      'year', v_valuation_record.year,
      'mileage', v_valuation_record.mileage,
      'vin', v_valuation_record.vin,
      'transmission', v_valuation_record.transmission,
      'fuel_type', v_valuation_record.fuel_type,
      'name', v_valuation_record.name,
      'contact_email', v_valuation_record.contact_email,
      'contact_phone', v_valuation_record.contact_phone,
      'mobile_number', v_valuation_record.mobile_number,
      'street_address', v_valuation_record.street_address,
      'town', v_valuation_record.town,
      'postcode', v_valuation_record.postcode,
      'county', v_valuation_record.county
    );

    -- Chunk 2: Finance & High-level Condition
    v_valuation_obj := v_valuation_obj || jsonb_build_object(
      'finance_amount', v_valuation_record.finance_amount,
      'has_outstanding_finance', v_valuation_record.has_outstanding_finance,
      'finance_document_url', v_valuation_record.finance_document_url,
      'finance_document_name', v_valuation_record.finance_document_name,
      'finance_document_uploaded_at', v_valuation_record.finance_document_uploaded_at,
      'is_damaged', v_valuation_record.is_damaged,
      'has_full_registration_document', v_valuation_record.has_full_registration_document,
      'is_selling_on_behalf', v_valuation_record.is_selling_on_behalf,
      'has_documentation', v_valuation_record.has_documentation,
      'is_registered_in_poland', v_valuation_record.is_registered_in_poland,
      'seat_material', v_valuation_record.seat_material,
      'number_of_keys', v_valuation_record.number_of_keys
    );

    -- Chunk 3: Detailed Condition Questions (15 fields)
    v_valuation_obj := v_valuation_obj || jsonb_build_object(
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
      'warning_lights_on', v_valuation_record.warning_lights_on
    );

    -- Chunk 4: Service, Features, Status, Timestamps, Images
    v_valuation_obj := v_valuation_obj || jsonb_build_object(
      'service_history_type', v_valuation_record.service_history_type,
      'service_history_files', v_valuation_record.service_history_files,
      'seller_notes', v_valuation_record.seller_notes,
      'accident_history', v_valuation_record.accident_history,
      'features', v_valuation_record.features,
      'uploaded_photos', v_valuation_record.uploaded_photos,
      'status', v_valuation_record.status,
      'reserve_price', v_valuation_record.reserve_price,
      'valuation_result', v_valuation_record.valuation_result,
      'created_at', v_valuation_record.created_at,
      'updated_at', v_valuation_record.updated_at,
      'images', to_jsonb(v_images)
    );

    -- Add complete valuation object to array
    v_valuations := v_valuations || v_valuation_obj;
  END LOOP;

  -- Build final result with proper structure
  v_result := jsonb_build_object(
    'success', true,
    'data', to_jsonb(v_valuations)
  );

  RETURN v_result;

EXCEPTION WHEN OTHERS THEN
  -- Return error response
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$function$;