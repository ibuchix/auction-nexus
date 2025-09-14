-- Add staging/ready_for_transfer status to manual_valuations
-- Update the manual_valuations table to support staging status

-- First, let's check if we need to add any new status values
-- The status field should support 'ready_for_transfer' in addition to existing statuses

-- Create the enhanced transfer function that supports staging
CREATE OR REPLACE FUNCTION admin_prepare_manual_valuation_transfer(
  p_valuation_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_valuation manual_valuations%ROWTYPE;
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

  -- Update status to ready_for_transfer
  UPDATE manual_valuations
  SET 
    status = 'ready_for_transfer',
    updated_at = NOW()
  WHERE id = p_valuation_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Manual valuation prepared for transfer',
    'valuation', row_to_json(v_valuation)
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Enhanced transfer function with better validation
CREATE OR REPLACE FUNCTION admin_transfer_manual_valuation_to_cars_enhanced(
  p_valuation_id uuid,
  p_reserve_price numeric,
  p_car_updates jsonb DEFAULT NULL
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
  v_updated_data jsonb;
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

  -- Validate reserve price
  IF p_reserve_price IS NULL OR p_reserve_price <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid reserve price'
    );
  END IF;

  -- Check if VIN already exists in cars table (if VIN is provided)
  IF v_valuation.vin IS NOT NULL AND v_valuation.vin != '' THEN
    IF EXISTS (
      SELECT 1 FROM cars 
      WHERE vin = v_valuation.vin 
      AND id != p_valuation_id::text::uuid
    ) THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'A car with this VIN already exists'
      );
    END IF;
  END IF;

  -- Apply any admin updates if provided
  IF p_car_updates IS NOT NULL THEN
    UPDATE manual_valuations
    SET 
      make = COALESCE(p_car_updates->>'make', make),
      model = COALESCE(p_car_updates->>'model', model),
      year = COALESCE((p_car_updates->>'year')::integer, year),
      mileage = COALESCE((p_car_updates->>'mileage')::integer, mileage),
      vin = COALESCE(p_car_updates->>'vin', vin),
      transmission = COALESCE((p_car_updates->>'transmission')::car_transmission_type, transmission),
      fuel_type = COALESCE(p_car_updates->>'fuel_type', fuel_type),
      notes = COALESCE(p_car_updates->>'notes', notes),
      seller_notes = COALESCE(p_car_updates->>'seller_notes', seller_notes),
      updated_at = NOW()
    WHERE id = p_valuation_id;

    -- Refresh valuation data
    SELECT * INTO v_valuation FROM manual_valuations WHERE id = p_valuation_id;
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

  -- Get images from manual file uploads
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
    COALESCE(COALESCE(v_valuation.mobile_number, v_valuation.contact_phone), ''),
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
      'transferred_by', auth.uid(),
      'admin_updates', COALESCE(p_car_updates, '{}'::jsonb)
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