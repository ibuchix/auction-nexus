-- Drop and recreate admin_get_manual_valuations with correct address fields
DROP FUNCTION IF EXISTS public.admin_get_manual_valuations(text);

CREATE OR REPLACE FUNCTION public.admin_get_manual_valuations(p_status text DEFAULT 'all')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
  v_valuations jsonb[];
  v_valuation_record record;
  v_images jsonb[];
  v_image_record record;
  v_signed_url text;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'::user_role
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- Initialize array
  v_valuations := ARRAY[]::jsonb[];

  -- Get manual valuations based on status filter
  FOR v_valuation_record IN 
    SELECT 
      mv.*
    FROM manual_valuations mv
    WHERE (p_status = 'all' OR mv.status = p_status)
    ORDER BY mv.created_at DESC
  LOOP
    -- Initialize images array for this valuation
    v_images := ARRAY[]::jsonb[];

    -- Get images for this valuation with signed URLs
    FOR v_image_record IN 
      SELECT 
        mfu.id,
        mfu.file_path,
        mfu.category,
        mfu.display_order,
        mfu.file_type
      FROM manual_file_uploads mfu
      WHERE mfu.manual_valuation_id = v_valuation_record.id
      ORDER BY mfu.display_order, mfu.created_at
    LOOP
      -- Generate signed URL (valid for 1 hour)
      BEGIN
        SELECT storage.create_signed_url('manual-valuations', v_image_record.file_path, 3600) INTO v_signed_url;
        
        -- If signed URL creation fails, use null
        IF v_signed_url IS NULL THEN
          v_signed_url := NULL;
        END IF;
      EXCEPTION WHEN OTHERS THEN
        v_signed_url := NULL;
      END;

      -- Add image with signed URL to images array
      v_images := v_images || jsonb_build_object(
        'id', v_image_record.id,
        'file_path', v_image_record.file_path,
        'signed_url', v_signed_url,
        'category', v_image_record.category,
        'display_order', v_image_record.display_order,
        'file_type', v_image_record.file_type
      );
    END LOOP;

    -- Add valuation with images to valuations array
    v_valuations := v_valuations || jsonb_build_object(
      'id', v_valuation_record.id,
      'user_id', v_valuation_record.user_id,
      'make', v_valuation_record.make,
      'model', v_valuation_record.model,
      'year', v_valuation_record.year,
      'mileage', v_valuation_record.mileage,
      'vin', v_valuation_record.vin,
      'transmission', v_valuation_record.transmission,
      'fuel_type', v_valuation_record.fuel_type,
      'name', v_valuation_record.name,
      'contact_email', v_valuation_record.contact_email,
      'contact_phone', v_valuation_record.contact_phone,
      'mobile_number', v_valuation_record.mobile_number,
      'street_address', v_valuation_record.street_address,
      'town', v_valuation_record.town,
      'postcode', v_valuation_record.postcode,
      'county', v_valuation_record.county,
      'registration_number', v_valuation_record.registration_number,
      'finance_amount', v_valuation_record.finance_amount,
      'is_damaged', v_valuation_record.is_damaged,
      'has_private_plate', v_valuation_record.has_private_plate,
      'is_selling_on_behalf', v_valuation_record.is_selling_on_behalf,
      'has_documentation', v_valuation_record.has_documentation,
      'has_tool_pack', v_valuation_record.has_tool_pack,
      'is_registered_in_poland', v_valuation_record.is_registered_in_poland,
      'seat_material', v_valuation_record.seat_material,
      'number_of_keys', v_valuation_record.number_of_keys,
      'service_history_type', v_valuation_record.service_history_type,
      'seller_notes', v_valuation_record.seller_notes,
      'notes', v_valuation_record.notes,
      'features', v_valuation_record.features,
      'status', v_valuation_record.status,
      'created_at', v_valuation_record.created_at,
      'updated_at', v_valuation_record.updated_at,
      'images', to_jsonb(v_images)
    );
  END LOOP;

  -- Build final result
  v_result := jsonb_build_object(
    'success', true,
    'data', to_jsonb(v_valuations)
  );

  RETURN v_result;

EXCEPTION WHEN OTHERS THEN
  -- Return error response
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;