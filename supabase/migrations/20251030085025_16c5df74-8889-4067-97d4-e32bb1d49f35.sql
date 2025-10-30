-- Fix database transfer function to preserve NULL values from seller choices
-- This ensures admin sees exactly what sellers specified vs. what they didn't

CREATE OR REPLACE FUNCTION public.admin_transfer_manual_valuation_to_cars_enhanced(
  p_manual_valuation_id uuid, 
  p_reserve_price numeric DEFAULT NULL::numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_valuation record;
  v_car_id uuid;
  v_result jsonb;
  v_image_count int := 0;
BEGIN
  -- Fetch the manual valuation record
  SELECT * INTO v_valuation
  FROM manual_valuations
  WHERE id = p_manual_valuation_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Manual valuation not found';
  END IF;

  -- Check if VIN already exists in cars table
  IF v_valuation.vin IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM cars WHERE vin = v_valuation.vin) THEN
      RAISE EXCEPTION 'A car with VIN % already exists in the cars table', v_valuation.vin;
    END IF;
  END IF;

  -- Validate reserve price
  IF p_reserve_price IS NULL OR p_reserve_price <= 0 THEN
    RAISE EXCEPTION 'Reserve price must be provided and must be greater than 0';
  END IF;

  -- Insert into cars table with proper NULL preservation
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
    registration_number,
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
    p_reserve_price,
    v_valuation.name,
    COALESCE(v_valuation.mobile_number, v_valuation.contact_phone),
    v_valuation.street_address,
    v_valuation.town,
    v_valuation.postcode,
    v_valuation.county,
    v_valuation.registration_number,
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
  RETURNING id INTO v_car_id;

  -- Transfer images from manual_valuation_images to car_images
  WITH transferred_images AS (
    INSERT INTO car_images (
      car_id,
      file_path,
      category,
      display_order,
      created_at
    )
    SELECT 
      v_car_id,
      file_path,
      category,
      display_order,
      now()
    FROM manual_valuation_images
    WHERE manual_valuation_id = p_manual_valuation_id
    RETURNING *
  )
  SELECT COUNT(*) INTO v_image_count FROM transferred_images;

  -- Update manual valuation status
  UPDATE manual_valuations
  SET 
    status = 'transferred',
    updated_at = now()
  WHERE id = p_manual_valuation_id;

  -- Build result
  v_result := jsonb_build_object(
    'success', true,
    'car_id', v_car_id,
    'images_transferred', v_image_count,
    'message', format('Successfully transferred to cars table. Car ID: %s, Images transferred: %s', v_car_id, v_image_count)
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'error_detail', SQLSTATE
    );
END;
$function$;