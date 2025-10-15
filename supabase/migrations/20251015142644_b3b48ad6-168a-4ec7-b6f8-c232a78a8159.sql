-- Add reserve_price column to manual_valuations table
ALTER TABLE manual_valuations
ADD COLUMN reserve_price NUMERIC;

-- Update admin_update_manual_valuation to handle reserve_price
CREATE OR REPLACE FUNCTION admin_update_manual_valuation(
  p_valuation_id uuid,
  p_valuation_data jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    has_private_plate = COALESCE((p_valuation_data->>'has_private_plate')::boolean, has_private_plate),
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
$$;

-- Update admin_transfer_manual_valuation_to_cars_enhanced to use reserve_price from manual_valuations as fallback
CREATE OR REPLACE FUNCTION admin_transfer_manual_valuation_to_cars_enhanced(
  p_manual_valuation_id uuid,
  p_reserve_price numeric DEFAULT NULL,
  p_admin_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_valuation record;
  v_car_id uuid;
  v_log_id text := gen_random_uuid()::text;
  v_seller_exists boolean;
  v_vin_exists boolean;
  v_image_record record;
  v_images_array text[];
  v_final_reserve_price numeric;
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

  -- Determine final reserve price: use parameter if provided, otherwise use saved value
  v_final_reserve_price := COALESCE(p_reserve_price, v_valuation.reserve_price, 1000);

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
    v_final_reserve_price,
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
      'car_id', v_car_id,
      'reserve_price', v_final_reserve_price
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
$$;