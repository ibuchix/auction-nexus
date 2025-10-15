-- Fix admin_transfer_manual_valuation_to_cars_enhanced to use correct address fields
CREATE OR REPLACE FUNCTION public.admin_transfer_manual_valuation_to_cars_enhanced(
  p_manual_valuation_id uuid,
  p_reserve_price numeric DEFAULT NULL,
  p_admin_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_valuation record;
  v_car_id uuid;
  v_log_id text := gen_random_uuid()::text;
  v_seller_exists boolean;
  v_vin_exists boolean;
  v_image_record record;
  v_images_array text[];
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'::user_role
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Admin privileges required'
    );
  END IF;

  -- Start logging
  INSERT INTO system_logs (
    log_type, 
    message, 
    details, 
    correlation_id
  ) VALUES (
    'manual_valuation_transfer', 
    'Starting manual valuation transfer to cars', 
    jsonb_build_object('manual_valuation_id', p_manual_valuation_id),
    v_log_id
  );

  -- Get the manual valuation
  SELECT * INTO v_valuation
  FROM manual_valuations
  WHERE id = p_manual_valuation_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Manual valuation not found'
    );
  END IF;

  -- Check if VIN already exists in cars table
  IF v_valuation.vin IS NOT NULL AND v_valuation.vin != '' THEN
    SELECT EXISTS(
      SELECT 1 FROM cars WHERE vin = v_valuation.vin
    ) INTO v_vin_exists;
    
    IF v_vin_exists THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'A car with this VIN already exists'
      );
    END IF;
  END IF;

  -- Ensure seller exists
  SELECT EXISTS(SELECT 1 FROM sellers WHERE user_id = v_valuation.user_id) INTO v_seller_exists;
  
  IF NOT v_seller_exists THEN
    INSERT INTO sellers (user_id, created_at, updated_at, verification_status, is_verified)
    VALUES (v_valuation.user_id, now(), now(), 'verified', true)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  -- Generate car ID
  v_car_id := gen_random_uuid();

  -- Build images array from manual_file_uploads
  v_images_array := ARRAY[]::text[];
  FOR v_image_record IN 
    SELECT file_path
    FROM manual_file_uploads
    WHERE manual_valuation_id = p_manual_valuation_id
    ORDER BY display_order, created_at
  LOOP
    v_images_array := array_append(v_images_array, v_image_record.file_path);
  END LOOP;

  -- Insert into cars table with correct address fields
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
    features,
    status,
    is_damaged,
    is_registered_in_poland,
    has_private_plate,
    finance_amount,
    service_history_type,
    seat_material,
    number_of_keys,
    seller_notes,
    images,
    created_at,
    updated_at,
    registration_number
  ) VALUES (
    v_car_id,
    v_valuation.user_id,
    COALESCE(v_valuation.make, 'Unknown'),
    COALESCE(v_valuation.model, 'Unknown'),
    COALESCE(v_valuation.year, 2000),
    COALESCE(v_valuation.mileage, 0),
    COALESCE(v_valuation.vin, ''),
    COALESCE(v_valuation.transmission, 'manual'),
    v_valuation.fuel_type,
    COALESCE(p_reserve_price, 1000),
    CONCAT(
      COALESCE(v_valuation.year::text, ''),
      CASE WHEN v_valuation.year IS NOT NULL THEN ' ' ELSE '' END,
      UPPER(COALESCE(v_valuation.make, 'Unknown')),
      CASE WHEN v_valuation.model IS NOT NULL THEN ' ' ELSE '' END,
      UPPER(COALESCE(v_valuation.model, ''))
    ),
    COALESCE(v_valuation.name, 'Seller'),
    COALESCE(v_valuation.street_address, ''),
    COALESCE(v_valuation.town, ''),
    COALESCE(v_valuation.postcode, ''),
    COALESCE(v_valuation.county, ''),
    COALESCE(v_valuation.mobile_number, v_valuation.contact_phone, ''),
    COALESCE(v_valuation.features, '{}'::jsonb),
    'available',
    COALESCE(v_valuation.is_damaged, false),
    COALESCE(v_valuation.is_registered_in_poland, true),
    COALESCE(v_valuation.has_private_plate, false),
    COALESCE(v_valuation.finance_amount, 0),
    COALESCE(v_valuation.service_history_type, 'none'),
    v_valuation.seat_material,
    COALESCE(v_valuation.number_of_keys, 1),
    COALESCE(v_valuation.seller_notes, '') || 
      CASE WHEN p_admin_notes IS NOT NULL THEN E'\n\nAdmin Notes: ' || p_admin_notes ELSE '' END,
    v_images_array,
    now(),
    now(),
    v_valuation.registration_number
  );

  -- Transfer images to car_file_uploads
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
    file_path,
    file_type,
    category,
    display_order,
    'completed',
    now(),
    now()
  FROM manual_file_uploads
  WHERE manual_valuation_id = p_manual_valuation_id;

  -- Update manual valuation status
  UPDATE manual_valuations
  SET 
    status = 'transferred',
    updated_at = now(),
    notes = COALESCE(notes, '') || 
      E'\n\nTransferred to cars table on ' || now()::text ||
      CASE WHEN p_admin_notes IS NOT NULL THEN E'\nAdmin Notes: ' || p_admin_notes ELSE '' END
  WHERE id = p_manual_valuation_id;

  -- Log success
  INSERT INTO system_logs (
    log_type, 
    message, 
    details, 
    correlation_id
  ) VALUES (
    'manual_valuation_transfer', 
    'Manual valuation transferred successfully', 
    jsonb_build_object(
      'manual_valuation_id', p_manual_valuation_id,
      'car_id', v_car_id
    ),
    v_log_id
  );

  RETURN jsonb_build_object(
    'success', true,
    'car_id', v_car_id,
    'message', 'Car transferred successfully and ready for auction scheduling'
  );

EXCEPTION WHEN OTHERS THEN
  INSERT INTO system_logs (
    log_type, 
    message, 
    error_message,
    details,
    correlation_id
  ) VALUES (
    'manual_valuation_transfer_error', 
    'Error transferring manual valuation', 
    SQLERRM,
    jsonb_build_object(
      'error_code', SQLSTATE,
      'manual_valuation_id', p_manual_valuation_id
    ),
    v_log_id
  );
  
  RETURN jsonb_build_object(
    'success', false,
    'error', 'Transfer failed: ' || SQLERRM
  );
END;
$function$;