-- Fix missing seller_id and remove non-existent transferred_to_car_id column
-- Add seller_id mapping and fix UPDATE statement

CREATE OR REPLACE FUNCTION admin_transfer_manual_valuation_to_cars_enhanced(
  p_manual_valuation_id UUID,
  p_reserve_price NUMERIC DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_valuation manual_valuations%ROWTYPE;
  v_new_car_id UUID;
  v_image_record RECORD;
  v_transferred_count INTEGER := 0;
BEGIN
  -- Get the valuation record
  SELECT * INTO v_valuation
  FROM manual_valuations
  WHERE id = p_manual_valuation_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Valuation not found';
  END IF;

  -- Check if VIN already exists in cars table
  IF v_valuation.vin IS NOT NULL AND EXISTS (
    SELECT 1 FROM cars WHERE vin = v_valuation.vin
  ) THEN
    RAISE EXCEPTION 'VIN already exists in cars table';
  END IF;

  -- Insert into cars table with seller_id
  INSERT INTO cars (
    seller_id,
    make,
    model,
    year,
    mileage,
    vin,
    transmission,
    fuel_type,
    seat_material,
    reserve_price,
    seller_name,
    mobile_number,
    street_address,
    town,
    postcode,
    county,
    service_history_type,
    number_of_keys,
    seller_notes,
    features,
    valuation_data,
    is_damaged,
    has_full_registration_document,
    is_registered_in_poland,
    has_service_history,
    has_outstanding_finance,
    is_selling_on_behalf,
    status,
    created_at,
    updated_at
  )
  VALUES (
    v_valuation.user_id,
    v_valuation.make,
    v_valuation.model,
    v_valuation.year,
    v_valuation.mileage,
    v_valuation.vin,
    v_valuation.transmission,
    v_valuation.fuel_type,
    v_valuation.seat_material,
    COALESCE(p_reserve_price, v_valuation.reserve_price),
    v_valuation.name,
    COALESCE(v_valuation.mobile_number, v_valuation.contact_phone),
    v_valuation.street_address,
    v_valuation.town,
    v_valuation.postcode,
    v_valuation.county,
    v_valuation.service_history_type,
    v_valuation.number_of_keys,
    v_valuation.seller_notes,
    v_valuation.features,
    v_valuation.valuation_result,
    v_valuation.is_damaged,
    v_valuation.has_full_registration_document,
    v_valuation.is_registered_in_poland,
    (v_valuation.service_history_type IS NOT NULL AND v_valuation.service_history_type != 'none'),
    v_valuation.has_outstanding_finance,
    v_valuation.is_selling_on_behalf,
    'available',
    now(),
    now()
  )
  RETURNING id INTO v_new_car_id;

  -- Transfer images from manual_file_uploads to car_file_uploads
  FOR v_image_record IN
    SELECT * FROM manual_file_uploads
    WHERE manual_valuation_id = p_manual_valuation_id
      AND upload_status = 'completed'
    ORDER BY display_order
  LOOP
    INSERT INTO car_file_uploads (
      car_id,
      file_path,
      file_type,
      upload_status,
      image_metadata,
      category,
      display_order,
      seller_id,
      created_at,
      updated_at
    )
    VALUES (
      v_new_car_id,
      v_image_record.file_path,
      v_image_record.file_type,
      'completed',
      v_image_record.image_metadata,
      v_image_record.category,
      v_image_record.display_order,
      v_image_record.user_id,
      now(),
      now()
    );
    
    v_transferred_count := v_transferred_count + 1;
  END LOOP;

  -- Update valuation status (removed transferred_to_car_id reference)
  UPDATE manual_valuations
  SET 
    status = 'completed',
    updated_at = now()
  WHERE id = p_manual_valuation_id;

  -- Return success with details
  RETURN jsonb_build_object(
    'success', true,
    'car_id', v_new_car_id,
    'images_transferred', v_transferred_count,
    'message', 'Transfer completed successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Transfer failed: %', SQLERRM;
END;
$$;