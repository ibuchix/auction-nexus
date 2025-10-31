-- Fix the 2-parameter version of admin_transfer_manual_valuation_to_cars_enhanced
-- Remove registration_number references from the function that frontend actually calls

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

  -- Insert into cars table (removed registration_number from column list)
  INSERT INTO cars (
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
    v_valuation.make,
    v_valuation.model,
    v_valuation.year,
    v_valuation.mileage,
    v_valuation.vin,
    v_valuation.transmission,
    v_valuation.fuel_type,
    v_valuation.seat_material,
    COALESCE(p_reserve_price, v_valuation.estimated_value),
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
    v_valuation.has_service_history,
    v_valuation.has_outstanding_finance,
    v_valuation.is_selling_on_behalf,
    'available',
    now(),
    now()
  )
  RETURNING id INTO v_new_car_id;

  -- Transfer images
  FOR v_image_record IN
    SELECT * FROM manual_valuation_images
    WHERE valuation_id = p_manual_valuation_id
    ORDER BY display_order
  LOOP
    INSERT INTO car_images (
      car_id,
      image_url,
      display_order,
      is_primary,
      created_at
    )
    VALUES (
      v_new_car_id,
      v_image_record.image_url,
      v_image_record.display_order,
      v_image_record.is_primary,
      now()
    );
    
    v_transferred_count := v_transferred_count + 1;
  END LOOP;

  -- Update valuation status
  UPDATE manual_valuations
  SET 
    status = 'completed',
    transferred_to_car_id = v_new_car_id,
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