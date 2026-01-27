-- Fix: Add seller_acceptable_price to the transfer function
-- This ensures future transfers include the seller's preferred price

-- First, backfill existing cars that were transferred without seller_acceptable_price
UPDATE cars c
SET seller_acceptable_price = mv.seller_acceptable_price
FROM manual_valuations mv
WHERE c.vin = mv.vin
  AND c.seller_acceptable_price IS NULL
  AND mv.seller_acceptable_price IS NOT NULL;

-- Drop the existing function first (required when changing return type)
DROP FUNCTION IF EXISTS public.admin_transfer_manual_valuation_to_cars_enhanced(UUID, NUMERIC);

-- Recreate the transfer function with seller_acceptable_price included
CREATE OR REPLACE FUNCTION public.admin_transfer_manual_valuation_to_cars_enhanced(
  p_manual_valuation_id UUID,
  p_reserve_price NUMERIC DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_valuation RECORD;
  v_new_car_id UUID;
  v_result JSON;
  v_images TEXT[];
  v_file_record RECORD;
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Get the manual valuation record
  SELECT * INTO v_valuation
  FROM manual_valuations
  WHERE id = p_manual_valuation_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Manual valuation not found';
  END IF;

  -- Check if already transferred
  IF v_valuation.status = 'transferred' THEN
    RAISE EXCEPTION 'This valuation has already been transferred';
  END IF;

  -- Collect images from manual_file_uploads
  SELECT ARRAY_AGG(file_path ORDER BY display_order NULLS LAST, created_at)
  INTO v_images
  FROM manual_file_uploads
  WHERE manual_valuation_id = p_manual_valuation_id
    AND file_type LIKE 'image/%';

  -- Generate new car ID
  v_new_car_id := gen_random_uuid();

  -- Insert into cars table with seller_acceptable_price included
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
    seat_material,
    reserve_price,
    seller_acceptable_price,
    seller_name,
    mobile_number,
    contact_email,
    street_address,
    town,
    county,
    postcode,
    is_registered_in_poland,
    has_full_registration_document,
    first_registration_date,
    is_selling_on_behalf,
    number_of_keys,
    has_outstanding_finance,
    finance_amount,
    finance_document_url,
    finance_document_name,
    finance_document_uploaded_at,
    service_history_type,
    is_damaged,
    has_scratches,
    has_dents,
    has_rust,
    has_interior_stains,
    runs_smoothly,
    engine_faults,
    engine_smokes,
    gearbox_faults,
    electrical_faults,
    brakes_noisy,
    suspension_noisy,
    ac_working,
    windows_working,
    warning_lights_on,
    tires_legal_depth,
    accident_history,
    seller_notes,
    features,
    images,
    status,
    auction_status,
    is_auction,
    created_at,
    updated_at
  )
  VALUES (
    v_new_car_id,
    v_valuation.user_id,
    v_valuation.make,
    v_valuation.model,
    v_valuation.year,
    v_valuation.mileage,
    v_valuation.vin,
    v_valuation.transmission::TEXT,
    v_valuation.fuel_type,
    v_valuation.seat_material,
    COALESCE(p_reserve_price, v_valuation.reserve_price),
    v_valuation.seller_acceptable_price,
    v_valuation.name,
    COALESCE(v_valuation.mobile_number, v_valuation.contact_phone),
    v_valuation.contact_email,
    v_valuation.street_address,
    v_valuation.town,
    v_valuation.county,
    v_valuation.postcode,
    v_valuation.is_registered_in_poland,
    v_valuation.has_full_registration_document,
    v_valuation.first_registration_date,
    v_valuation.is_selling_on_behalf,
    v_valuation.number_of_keys,
    v_valuation.has_outstanding_finance,
    v_valuation.finance_amount,
    v_valuation.finance_document_url,
    v_valuation.finance_document_name,
    v_valuation.finance_document_uploaded_at,
    v_valuation.service_history_type,
    v_valuation.is_damaged,
    v_valuation.has_scratches,
    v_valuation.has_dents,
    v_valuation.has_rust,
    v_valuation.has_interior_stains,
    v_valuation.runs_smoothly,
    v_valuation.engine_faults,
    v_valuation.engine_smokes,
    v_valuation.gearbox_faults,
    v_valuation.electrical_faults,
    v_valuation.brakes_noisy,
    v_valuation.suspension_noisy,
    v_valuation.ac_working,
    v_valuation.windows_working,
    v_valuation.warning_lights_on,
    v_valuation.tires_legal_depth,
    v_valuation.accident_history,
    v_valuation.seller_notes,
    v_valuation.features,
    v_images,
    'available',
    'pending',
    false,
    NOW(),
    NOW()
  );

  -- Transfer file uploads to car_file_uploads
  FOR v_file_record IN
    SELECT * FROM manual_file_uploads
    WHERE manual_valuation_id = p_manual_valuation_id
  LOOP
    INSERT INTO car_file_uploads (
      car_id,
      seller_id,
      file_path,
      file_type,
      category,
      display_order,
      image_metadata,
      upload_status,
      session_id,
      created_at,
      updated_at
    )
    VALUES (
      v_new_car_id,
      v_valuation.user_id,
      v_file_record.file_path,
      v_file_record.file_type,
      v_file_record.category,
      v_file_record.display_order,
      v_file_record.image_metadata,
      'completed',
      v_file_record.session_id,
      v_file_record.created_at,
      NOW()
    );
  END LOOP;

  -- Update manual valuation status
  UPDATE manual_valuations
  SET status = 'transferred',
      updated_at = NOW()
  WHERE id = p_manual_valuation_id;

  -- Build result
  v_result := json_build_object(
    'success', true,
    'car_id', v_new_car_id,
    'message', 'Manual valuation transferred successfully'
  );

  RETURN v_result;
END;
$$;