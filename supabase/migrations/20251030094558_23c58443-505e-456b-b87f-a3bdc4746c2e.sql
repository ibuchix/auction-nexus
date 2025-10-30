-- Fix admin_get_manual_valuations to return all missing fields
-- This ensures finance documents, damage status, reserve price, and valuation results are returned

CREATE OR REPLACE FUNCTION public.admin_get_manual_valuations(p_status text DEFAULT 'all'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_valuations jsonb := '[]'::jsonb;
  v_valuation_record RECORD;
  v_images jsonb;
  v_image_record RECORD;
  v_is_admin boolean;
BEGIN
  -- Check if user is admin
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) INTO v_is_admin;
  
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- Loop through manual valuations based on status filter
  FOR v_valuation_record IN 
    SELECT mv.*
    FROM manual_valuations mv
    WHERE (p_status = 'all' OR mv.status = p_status)
    ORDER BY mv.created_at DESC
  LOOP
    -- Get images for this valuation
    v_images := '[]'::jsonb;
    
    FOR v_image_record IN 
      SELECT image_url, image_category, uploaded_at
      FROM manual_valuation_images
      WHERE manual_valuation_id = v_valuation_record.id
      ORDER BY uploaded_at ASC
    LOOP
      v_images := v_images || jsonb_build_object(
        'image_url', v_image_record.image_url,
        'image_category', v_image_record.image_category,
        'uploaded_at', v_image_record.uploaded_at
      );
    END LOOP;
    
    -- Build complete valuation object with ALL fields including previously missing ones
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
      'has_outstanding_finance', v_valuation_record.has_outstanding_finance,
      'finance_document_url', v_valuation_record.finance_document_url,
      'finance_document_name', v_valuation_record.finance_document_name,
      'finance_document_uploaded_at', v_valuation_record.finance_document_uploaded_at,
      'is_damaged', v_valuation_record.is_damaged,
      'has_full_registration_document', v_valuation_record.has_full_registration_document,
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
      'reserve_price', v_valuation_record.reserve_price,
      'valuation_result', v_valuation_record.valuation_result,
      'created_at', v_valuation_record.created_at,
      'updated_at', v_valuation_record.updated_at,
      'images', to_jsonb(v_images)
    );
  END LOOP;
  
  RETURN v_valuations;
END;
$function$;