-- Fix: Restore working transfer function with seller_acceptable_price
DROP FUNCTION IF EXISTS admin_transfer_manual_valuation_to_cars_enhanced(uuid, numeric);

CREATE FUNCTION admin_transfer_manual_valuation_to_cars_enhanced(
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
  v_mapped_category TEXT;
  v_additional_counter INTEGER := 1;
  v_generated_title TEXT;
BEGIN
  -- Fetch the manual valuation record
  SELECT * INTO v_valuation
  FROM manual_valuations
  WHERE id = p_manual_valuation_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Valuation not found';
  END IF;

  -- Check for duplicate VIN
  IF v_valuation.vin IS NOT NULL AND EXISTS (
    SELECT 1 FROM cars WHERE vin = v_valuation.vin
  ) THEN
    RAISE EXCEPTION 'VIN already exists in cars table';
  END IF;

  -- Generate title from make, model, and year
  IF v_valuation.make IS NOT NULL AND v_valuation.model IS NOT NULL 
     AND v_valuation.year IS NOT NULL THEN
    v_generated_title := v_valuation.year || ' ' || UPPER(v_valuation.make) 
                         || ' ' || UPPER(v_valuation.model);
  ELSE
    v_generated_title := 'Car Listing';
  END IF;

  -- Insert into cars table with ALL fields including seller_acceptable_price
  INSERT INTO cars (
    seller_id, make, model, year, mileage, vin, transmission, fuel_type,
    seat_material, reserve_price, seller_acceptable_price, seller_name, 
    mobile_number, contact_email, street_address, town, postcode, county, 
    service_history_type, number_of_keys, seller_notes, features, 
    valuation_data, is_damaged, has_full_registration_document,
    is_registered_in_poland, has_service_history, has_outstanding_finance,
    is_selling_on_behalf, title, finance_amount, finance_document_url, 
    finance_document_name, finance_document_uploaded_at,
    status, created_at, updated_at
  )
  VALUES (
    v_valuation.user_id, v_valuation.make, v_valuation.model, v_valuation.year,
    v_valuation.mileage, v_valuation.vin, v_valuation.transmission, 
    v_valuation.fuel_type, v_valuation.seat_material, 
    COALESCE(p_reserve_price, v_valuation.reserve_price),
    v_valuation.seller_acceptable_price,
    v_valuation.name, COALESCE(v_valuation.mobile_number, v_valuation.contact_phone),
    v_valuation.contact_email, v_valuation.street_address, v_valuation.town,
    v_valuation.postcode, v_valuation.county, v_valuation.service_history_type,
    v_valuation.number_of_keys, v_valuation.seller_notes, v_valuation.features,
    v_valuation.valuation_result, v_valuation.is_damaged,
    v_valuation.has_full_registration_document, v_valuation.is_registered_in_poland,
    (v_valuation.service_history_type IS NOT NULL 
     AND v_valuation.service_history_type != 'none'),
    v_valuation.has_outstanding_finance, v_valuation.is_selling_on_behalf,
    v_generated_title, v_valuation.finance_amount, v_valuation.finance_document_url, 
    v_valuation.finance_document_name, v_valuation.finance_document_uploaded_at,
    'available', now(), now()
  )
  RETURNING id INTO v_new_car_id;

  -- Transfer images from manual_file_uploads to car_file_uploads
  FOR v_image_record IN
    SELECT * FROM manual_file_uploads
    WHERE manual_valuation_id = p_manual_valuation_id 
      AND upload_status = 'completed'
    ORDER BY display_order
  LOOP
    -- Map category (handle 'additional' category specially)
    IF v_image_record.category = 'additional' THEN
      v_mapped_category := 'additional_' || v_additional_counter;
      v_additional_counter := v_additional_counter + 1;
      IF v_additional_counter > 4 THEN
        v_additional_counter := 4;
      END IF;
    ELSE
      v_mapped_category := v_image_record.category;
    END IF;
    
    INSERT INTO car_file_uploads (
      car_id, file_path, file_type, upload_status, image_metadata,
      category, display_order, seller_id, created_at, updated_at
    )
    VALUES (
      v_new_car_id, v_image_record.file_path, v_image_record.file_type, 
      'completed', v_image_record.image_metadata, v_mapped_category, 
      v_image_record.display_order, v_image_record.user_id, now(), now()
    );
    
    v_transferred_count := v_transferred_count + 1;
  END LOOP;

  -- Mark manual valuation as completed
  UPDATE manual_valuations
  SET status = 'completed', updated_at = now()
  WHERE id = p_manual_valuation_id;

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