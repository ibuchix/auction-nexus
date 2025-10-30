-- Fix admin_get_manual_valuations to match manual_valuations table schema
-- Remove non-existent fields: registration_number, has_tool_pack, notes
-- Add missing fields: service_history_files, uploaded_photos

CREATE OR REPLACE FUNCTION public.admin_get_manual_valuations(p_status text DEFAULT 'all'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

    -- Get images for this valuation with signed URLs from manual_file_uploads table
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
        SELECT storage.create_signed_url('manual-valuation-photos', v_image_record.file_path, 3600) INTO v_signed_url;
        
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

    -- Add valuation with ALL fields from manual_valuations table (39 fields total)
    v_valuations := v_valuations || jsonb_build_object(
      -- Identity
      'id', v_valuation_record.id,
      'user_id', v_valuation_record.user_id,
      
      -- Vehicle Details
      'make', v_valuation_record.make,
      'model', v_valuation_record.model,
      'year', v_valuation_record.year,
      'mileage', v_valuation_record.mileage,
      'vin', v_valuation_record.vin,
      'transmission', v_valuation_record.transmission,
      'fuel_type', v_valuation_record.fuel_type,
      
      -- Contact & Seller Info
      'name', v_valuation_record.name,
      'contact_email', v_valuation_record.contact_email,
      'contact_phone', v_valuation_record.contact_phone,
      'mobile_number', v_valuation_record.mobile_number,
      'street_address', v_valuation_record.street_address,
      'town', v_valuation_record.town,
      'postcode', v_valuation_record.postcode,
      'county', v_valuation_record.county,
      
      -- Finance Information
      'finance_amount', v_valuation_record.finance_amount,
      'has_outstanding_finance', v_valuation_record.has_outstanding_finance,
      'finance_document_url', v_valuation_record.finance_document_url,
      'finance_document_name', v_valuation_record.finance_document_name,
      'finance_document_uploaded_at', v_valuation_record.finance_document_uploaded_at,
      
      -- Vehicle Condition & Documentation
      'is_damaged', v_valuation_record.is_damaged,
      'has_full_registration_document', v_valuation_record.has_full_registration_document,
      'is_selling_on_behalf', v_valuation_record.is_selling_on_behalf,
      'has_documentation', v_valuation_record.has_documentation,
      'is_registered_in_poland', v_valuation_record.is_registered_in_poland,
      'seat_material', v_valuation_record.seat_material,
      'number_of_keys', v_valuation_record.number_of_keys,
      
      -- Service History & Notes
      'service_history_type', v_valuation_record.service_history_type,
      'service_history_files', v_valuation_record.service_history_files,
      'seller_notes', v_valuation_record.seller_notes,
      
      -- Features & Media
      'features', v_valuation_record.features,
      'uploaded_photos', v_valuation_record.uploaded_photos,
      
      -- Status & Pricing
      'status', v_valuation_record.status,
      'reserve_price', v_valuation_record.reserve_price,
      'valuation_result', v_valuation_record.valuation_result,
      
      -- Timestamps
      'created_at', v_valuation_record.created_at,
      'updated_at', v_valuation_record.updated_at,
      
      -- Computed Images from manual_file_uploads
      'images', to_jsonb(v_images)
    );
  END LOOP;

  -- Build final result with proper structure
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
$function$;