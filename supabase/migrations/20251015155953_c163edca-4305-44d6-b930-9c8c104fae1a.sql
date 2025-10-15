-- Fix image category mapping during manual valuation transfer
-- Maps generic "additional" category to numbered categories (additional_1, additional_2, etc.)

CREATE OR REPLACE FUNCTION public.admin_transfer_manual_valuation_to_cars_enhanced(
  p_manual_valuation_id uuid,
  p_reserve_price numeric DEFAULT NULL
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
    has_private_plate,
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
    COALESCE(v_valuation.has_private_plate, false),
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
  -- Map generic "additional" to numbered categories (additional_1, additional_2, etc.)
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
    -- Smart category mapping
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

  -- Update manual valuation status to completed
  UPDATE manual_valuations
  SET status = 'completed',
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
      'title', v_generated_title
    ),
    v_log_id
  );

  RETURN jsonb_build_object(
    'success', true,
    'car_id', v_car_id,
    'message', 'Vehicle successfully transferred to cars table'
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
    'Exception in manual valuation transfer', 
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