-- Create secure RPC functions for manual valuation management

-- Function to get manual valuations with images for admin
CREATE OR REPLACE FUNCTION admin_get_manual_valuations(p_status text DEFAULT NULL)
RETURNS SETOF json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  valuations_json json;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'::user_role
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  -- Get manual valuations with associated file uploads
  SELECT json_agg(
    json_build_object(
      'id', mv.id,
      'user_id', mv.user_id,
      'vin', mv.vin,
      'make', mv.make,
      'model', mv.model,
      'year', mv.year,
      'transmission', mv.transmission,
      'mileage', mv.mileage,
      'registration_number', mv.registration_number,
      'features', mv.features,
      'contact_email', mv.contact_email,
      'contact_phone', mv.contact_phone,
      'notes', mv.notes,
      'is_damaged', mv.is_damaged,
      'is_registered_in_poland', mv.is_registered_in_poland,
      'seat_material', mv.seat_material,
      'number_of_keys', mv.number_of_keys,
      'has_tool_pack', mv.has_tool_pack,
      'has_documentation', mv.has_documentation,
      'is_selling_on_behalf', mv.is_selling_on_behalf,
      'has_private_plate', mv.has_private_plate,
      'finance_amount', mv.finance_amount,
      'service_history_type', mv.service_history_type,
      'seller_notes', mv.seller_notes,
      'name', mv.name,
      'address', mv.address,
      'mobile_number', mv.mobile_number,
      'created_at', mv.created_at,
      'status', mv.status,
      'valuation_result', mv.valuation_result,
      'updated_at', mv.updated_at,
      'fuel_type', mv.fuel_type,
      'images', COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'id', mfu.id,
              'file_path', mfu.file_path,
              'file_type', mfu.file_type,
              'category', mfu.category,
              'display_order', mfu.display_order,
              'created_at', mfu.created_at
            ) ORDER BY mfu.display_order, mfu.created_at
          )
          FROM manual_file_uploads mfu
          WHERE mfu.manual_valuation_id = mv.id
          AND mfu.upload_status = 'completed'
        ),
        '[]'::json
      )
    )
  )
  INTO valuations_json
  FROM manual_valuations mv
  WHERE 
    (p_status IS NULL OR mv.status = p_status)
    AND mv.status != 'transferred' -- Exclude already transferred valuations
  ORDER BY mv.created_at DESC;

  RETURN QUERY SELECT valuations_json::json;
END;
$$;

-- Function to update manual valuation data (admin only)
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

  -- Update the manual valuation
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
    address = COALESCE(p_valuation_data->>'address', address),
    mobile_number = COALESCE(p_valuation_data->>'mobile_number', mobile_number),
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

-- Function to transfer manual valuation to cars table
CREATE OR REPLACE FUNCTION admin_transfer_manual_valuation_to_cars(
  p_valuation_id uuid,
  p_reserve_price numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_valuation manual_valuations%ROWTYPE;
  v_car_id uuid;
  v_images jsonb := '[]'::jsonb;
  v_generated_title text;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'::user_role
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  -- Get the manual valuation
  SELECT * INTO v_valuation
  FROM manual_valuations
  WHERE id = p_valuation_id;

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
  
  -- Clean up the title
  v_generated_title := TRIM(v_generated_title);
  IF v_generated_title = '' OR v_generated_title IS NULL THEN
    v_generated_title := 'Manual Valuation Car';
  END IF;

  -- Get images from manual file uploads and convert to required format
  SELECT COALESCE(
    jsonb_agg(mfu.file_path ORDER BY mfu.display_order, mfu.created_at),
    '[]'::jsonb
  ) INTO v_images
  FROM manual_file_uploads mfu
  WHERE mfu.manual_valuation_id = p_valuation_id
  AND mfu.upload_status = 'completed';

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
    address,
    mobile_number,
    features,
    status,
    created_at,
    updated_at,
    is_damaged,
    is_registered_in_poland,
    has_private_plate,
    finance_amount,
    service_history_type,
    seat_material,
    number_of_keys,
    seller_notes,
    images,
    valuation_data
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
    p_reserve_price,
    v_generated_title,
    COALESCE(v_valuation.name, 'Seller'),
    COALESCE(v_valuation.address, ''),
    COALESCE(v_valuation.mobile_number, ''),
    COALESCE(v_valuation.features, '{}'::jsonb),
    'available',
    NOW(),
    NOW(),
    COALESCE(v_valuation.is_damaged, false),
    COALESCE(v_valuation.is_registered_in_poland, true),
    COALESCE(v_valuation.has_private_plate, false),
    COALESCE(v_valuation.finance_amount, 0),
    COALESCE(v_valuation.service_history_type, 'none'),
    v_valuation.seat_material,
    COALESCE(v_valuation.number_of_keys, 1),
    v_valuation.seller_notes,
    CASE WHEN jsonb_array_length(v_images) > 0 THEN v_images::text[] ELSE NULL END,
    jsonb_build_object(
      'original_valuation_id', p_valuation_id,
      'transfer_date', NOW(),
      'transferred_by', auth.uid()
    )
  );

  -- Copy manual file uploads to car file uploads
  INSERT INTO car_file_uploads (
    car_id,
    seller_id,
    file_path,
    file_type,
    category,
    display_order,
    upload_status,
    image_metadata,
    created_at,
    updated_at
  )
  SELECT 
    v_car_id,
    v_valuation.user_id,
    mfu.file_path,
    mfu.file_type,
    COALESCE(mfu.category, 'additional'),
    mfu.display_order,
    mfu.upload_status,
    mfu.image_metadata,
    mfu.created_at,
    NOW()
  FROM manual_file_uploads mfu
  WHERE mfu.manual_valuation_id = p_valuation_id
  AND mfu.upload_status = 'completed';

  -- Update manual valuation status to transferred
  UPDATE manual_valuations
  SET 
    status = 'transferred',
    updated_at = NOW()
  WHERE id = p_valuation_id;

  RETURN jsonb_build_object(
    'success', true,
    'car_id', v_car_id,
    'message', 'Manual valuation transferred to cars table successfully'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;