-- =====================================================
-- Migration: Replace has_private_plate with has_full_registration_document
-- Description: Updates all admin manual valuation functions to use the new field name
-- =====================================================

-- =====================================================
-- Fix 1: Update admin_get_manual_valuations function
-- =====================================================
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

    -- Get images for this valuation with signed URLs
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
        SELECT storage.create_signed_url('manual-valuations', v_image_record.file_path, 3600) INTO v_signed_url;
        
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

    -- Add valuation with images to valuations array
    v_valuations := v_valuations || jsonb_build_object(
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
      'county', v_valuation_record.county,
      'registration_number', v_valuation_record.registration_number,
      'finance_amount', v_valuation_record.finance_amount,
      'is_damaged', v_valuation_record.is_damaged,
      'has_full_registration_document', v_valuation_record.has_full_registration_document,
      'is_selling_on_behalf', v_valuation_record.is_selling_on_behalf,
      'has_documentation', v_valuation_record.has_documentation,
      'has_tool_pack', v_valuation_record.has_tool_pack,
      'is_registered_in_poland', v_valuation_record.is_registered_in_poland,
      'seat_material', v_valuation_record.seat_material,
      'number_of_keys', v_valuation_record.number_of_keys,
      'service_history_type', v_valuation_record.service_history_type,
      'seller_notes', v_valuation_record.seller_notes,
      'notes', v_valuation_record.notes,
      'features', v_valuation_record.features,
      'status', v_valuation_record.status,
      'created_at', v_valuation_record.created_at,
      'updated_at', v_valuation_record.updated_at,
      'images', to_jsonb(v_images)
    );
  END LOOP;

  -- Build final result
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

-- =====================================================
-- Fix 2: Update admin_update_manual_valuation function
-- =====================================================
CREATE OR REPLACE FUNCTION public.admin_update_manual_valuation(p_valuation_id uuid, p_valuation_data jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'::user_role
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  -- Update the manual valuation with all fields including reserve_price
  UPDATE manual_valuations
  SET 
    make = COALESCE(p_valuation_data->>'make', make),
    model = COALESCE(p_valuation_data->>'model', model),
    year = COALESCE((p_valuation_data->>'year')::integer, year),
    mileage = COALESCE((p_valuation_data->>'mileage')::integer, mileage),
    vin = COALESCE(p_valuation_data->>'vin', vin),
    transmission = COALESCE((p_valuation_data->>'transmission')::car_transmission_type, transmission),
    fuel_type = COALESCE(p_valuation_data->>'fuel_type', fuel_type),
    registration_number = COALESCE(p_valuation_data->>'registration_number', registration_number),
    features = COALESCE(p_valuation_data->'features', features),
    contact_email = COALESCE(p_valuation_data->>'contact_email', contact_email),
    contact_phone = COALESCE(p_valuation_data->>'contact_phone', contact_phone),
    notes = COALESCE(p_valuation_data->>'notes', notes),
    seller_notes = COALESCE(p_valuation_data->>'seller_notes', seller_notes),
    name = COALESCE(p_valuation_data->>'name', name),
    street_address = COALESCE(p_valuation_data->>'street_address', street_address),
    town = COALESCE(p_valuation_data->>'town', town),
    postcode = COALESCE(p_valuation_data->>'postcode', postcode),
    county = COALESCE(p_valuation_data->>'county', county),
    mobile_number = COALESCE(p_valuation_data->>'mobile_number', mobile_number),
    reserve_price = COALESCE((p_valuation_data->>'reserve_price')::numeric, reserve_price),
    is_damaged = COALESCE((p_valuation_data->>'is_damaged')::boolean, is_damaged),
    is_registered_in_poland = COALESCE((p_valuation_data->>'is_registered_in_poland')::boolean, is_registered_in_poland),
    seat_material = COALESCE(p_valuation_data->>'seat_material', seat_material),
    number_of_keys = COALESCE((p_valuation_data->>'number_of_keys')::integer, number_of_keys),
    has_tool_pack = COALESCE((p_valuation_data->>'has_tool_pack')::boolean, has_tool_pack),
    has_documentation = COALESCE((p_valuation_data->>'has_documentation')::boolean, has_documentation),
    is_selling_on_behalf = COALESCE((p_valuation_data->>'is_selling_on_behalf')::boolean, is_selling_on_behalf),
    has_full_registration_document = COALESCE((p_valuation_data->>'has_full_registration_document')::boolean, has_full_registration_document),
    finance_amount = COALESCE((p_valuation_data->>'finance_amount')::numeric, finance_amount),
    service_history_type = COALESCE(p_valuation_data->>'service_history_type', service_history_type),
    valuation_result = COALESCE(p_valuation_data->'valuation_result', valuation_result),
    updated_at = NOW()
  WHERE id = p_valuation_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Manual valuation updated successfully'
  );
END;
$function$;

-- =====================================================
-- Fix 3: Update admin_transfer_manual_valuation_to_cars_enhanced function
-- =====================================================
CREATE OR REPLACE FUNCTION public.admin_transfer_manual_valuation_to_cars_enhanced(p_manual_valuation_id uuid, p_reserve_price numeric DEFAULT NULL::numeric)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_valuation record;
  v_car_id uuid;
  v_log_id text := gen_random_uuid()::text;
  v_generated_title text;
  v_images_array jsonb := '[]'::jsonb;
  v_image_record record;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'::user_role
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- Log transfer start
  INSERT INTO system_logs (
    log_type, 
    message, 
    details, 
    correlation_id
  ) VALUES (
    'manual_valuation_transfer', 
    'Starting enhanced manual valuation transfer', 
    jsonb_build_object(
      'manual_valuation_id', p_manual_valuation_id,
      'reserve_price', p_reserve_price
    ),
    v_log_id
  );

  -- Get manual valuation data
  SELECT * INTO v_valuation
  FROM manual_valuations
  WHERE id = p_manual_valuation_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Manual valuation not found'
    );
  END IF;

  -- Generate car ID
  v_car_id := gen_random_uuid();
  
  -- Generate title
  v_generated_title := CONCAT(
    COALESCE(v_valuation.year::text, ''),
    CASE WHEN v_valuation.year IS NOT NULL THEN ' ' ELSE '' END,
    UPPER(COALESCE(v_valuation.make, 'Unknown')),
    CASE WHEN v_valuation.model IS NOT NULL THEN ' ' ELSE '' END,
    UPPER(COALESCE(v_valuation.model, ''))
  );
  
  v_generated_title := TRIM(v_generated_title);
  IF v_generated_title = '' OR v_generated_title IS NULL THEN
    v_generated_title := 'Car Listing';
  END IF;

  -- Insert into cars table
  INSERT INTO cars (
    id,
    seller_id,
    make,
    model,
    year,
    mileage,
    vin,
    transmission,
    fuel_type,
    reserve_price,
    title,
    seller_name,
    street_address,
    town,
    postcode,
    county,
    mobile_number,
    registration_number,
    finance_amount,
    is_damaged,
    has_full_registration_document,
    is_registered_in_poland,
    seat_material,
    number_of_keys,
    service_history_type,
    seller_notes,
    features,
    status,
    created_at,
    updated_at
  ) VALUES (
    v_car_id,
    v_valuation.user_id,
    COALESCE(v_valuation.make, 'Unknown'),
    COALESCE(v_valuation.model, 'Unknown'),
    COALESCE(v_valuation.year, 2000),
    COALESCE(v_valuation.mileage, 0),
    COALESCE(v_valuation.vin, ''),
    COALESCE(v_valuation.transmission::text, 'manual'),
    v_valuation.fuel_type,
    COALESCE(p_reserve_price, v_valuation.reserve_price, 1000),
    v_generated_title,
    COALESCE(v_valuation.name, 'Seller'),
    v_valuation.street_address,
    v_valuation.town,
    v_valuation.postcode,
    v_valuation.county,
    COALESCE(v_valuation.mobile_number, ''),
    v_valuation.registration_number,
    COALESCE(v_valuation.finance_amount, 0),
    COALESCE(v_valuation.is_damaged, false),
    COALESCE(v_valuation.has_full_registration_document, false),
    COALESCE(v_valuation.is_registered_in_poland, true),
    v_valuation.seat_material,
    COALESCE(v_valuation.number_of_keys, 1),
    COALESCE(v_valuation.service_history_type, 'none'),
    v_valuation.seller_notes,
    COALESCE(v_valuation.features, '{}'::jsonb),
    'available',
    now(),
    now()
  );

  -- Transfer images with intelligent category mapping
  INSERT INTO car_file_uploads (
    car_id,
    seller_id,
    file_path,
    file_type,
    category,
    display_order,
    upload_status,
    created_at,
    updated_at
  )
  SELECT 
    v_car_id,
    v_valuation.user_id,
    mfu.file_path,
    mfu.file_type,
    CASE 
      WHEN mfu.category = 'additional' THEN 
        'additional_' || (ROW_NUMBER() OVER (
          PARTITION BY (mfu.category = 'additional') 
          ORDER BY mfu.display_order, mfu.created_at
        ))::text
      ELSE mfu.category
    END AS mapped_category,
    mfu.display_order,
    'completed',
    now(),
    now()
  FROM manual_file_uploads mfu
  WHERE mfu.manual_valuation_id = p_manual_valuation_id
  AND mfu.upload_status = 'completed';

  -- Update manual valuation status
  UPDATE manual_valuations
  SET 
    status = 'transferred',
    updated_at = now()
  WHERE id = p_manual_valuation_id;

  -- Log success
  INSERT INTO system_logs (
    log_type, 
    message, 
    details, 
    correlation_id
  ) VALUES (
    'manual_valuation_transfer', 
    'Successfully transferred manual valuation to cars', 
    jsonb_build_object(
      'manual_valuation_id', p_manual_valuation_id,
      'car_id', v_car_id,
      'reserve_price', p_reserve_price
    ),
    v_log_id
  );

  RETURN jsonb_build_object(
    'success', true,
    'car_id', v_car_id,
    'message', 'Manual valuation successfully transferred to cars table'
  );

EXCEPTION WHEN OTHERS THEN
  -- Log error
  INSERT INTO system_logs (
    log_type, 
    message, 
    details, 
    correlation_id,
    level
  ) VALUES (
    'manual_valuation_transfer', 
    'Failed to transfer manual valuation', 
    jsonb_build_object(
      'manual_valuation_id', p_manual_valuation_id,
      'error', SQLERRM,
      'error_detail', SQLSTATE
    ),
    v_log_id,
    'error'
  );

  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$function$;