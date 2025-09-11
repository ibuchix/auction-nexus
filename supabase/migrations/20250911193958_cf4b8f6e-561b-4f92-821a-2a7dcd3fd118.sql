-- Fix the admin_get_manual_valuations function SQL error
CREATE OR REPLACE FUNCTION admin_get_manual_valuations(p_status text DEFAULT NULL)
RETURNS TABLE(valuation_data jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'::user_role
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  -- Return manual valuations with associated file uploads
  RETURN QUERY
  SELECT 
    jsonb_build_object(
      'id', mv.id,
      'user_id', mv.user_id,
      'vin', mv.vin,
      'make', mv.make,
      'model', mv.model,
      'year', mv.year,
      'transmission', mv.transmission,
      'mileage', mv.mileage,
      'registration_number', mv.registration_number,
      'features', mv.features,
      'contact_email', mv.contact_email,
      'contact_phone', mv.contact_phone,
      'notes', mv.notes,
      'is_damaged', mv.is_damaged,
      'is_registered_in_poland', mv.is_registered_in_poland,
      'seat_material', mv.seat_material,
      'number_of_keys', mv.number_of_keys,
      'has_tool_pack', mv.has_tool_pack,
      'has_documentation', mv.has_documentation,
      'is_selling_on_behalf', mv.is_selling_on_behalf,
      'has_private_plate', mv.has_private_plate,
      'finance_amount', mv.finance_amount,
      'service_history_type', mv.service_history_type,
      'seller_notes', mv.seller_notes,
      'name', mv.name,
      'address', mv.address,
      'mobile_number', mv.mobile_number,
      'created_at', mv.created_at,
      'status', mv.status,
      'valuation_result', mv.valuation_result,
      'updated_at', mv.updated_at,
      'fuel_type', mv.fuel_type,
      'images', COALESCE(
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'id', mfu.id,
              'file_path', mfu.file_path,
              'file_type', mfu.file_type,
              'category', mfu.category,
              'display_order', mfu.display_order,
              'created_at', mfu.created_at
            ) ORDER BY mfu.display_order, mfu.created_at
          )
          FROM manual_file_uploads mfu
          WHERE mfu.manual_valuation_id = mv.id
          AND mfu.upload_status = 'completed'
        ),
        '[]'::jsonb
      )
    ) as valuation_data
  FROM manual_valuations mv
  WHERE 
    (p_status IS NULL OR mv.status = p_status)
    AND mv.status != 'transferred' -- Exclude already transferred valuations
  ORDER BY mv.created_at DESC;
END;
$$;