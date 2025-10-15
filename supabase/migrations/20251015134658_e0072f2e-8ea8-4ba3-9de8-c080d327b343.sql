-- Fix admin_update_manual_valuation to use separate address fields
CREATE OR REPLACE FUNCTION admin_update_manual_valuation(
  p_valuation_id uuid,
  p_valuation_data jsonb
)
RETURNS jsonb
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

  -- Update the manual valuation with separate address fields
  UPDATE manual_valuations
  SET 
    make = COALESCE(p_valuation_data->>'make', make),
    model = COALESCE(p_valuation_data->>'model', model),
    year = COALESCE((p_valuation_data->>'year')::integer, year),
    mileage = COALESCE((p_valuation_data->>'mileage')::integer, mileage),
    vin = COALESCE(p_valuation_data->>'vin', vin),
    transmission = COALESCE((p_valuation_data->>'transmission')::car_transmission_type, transmission),
    fuel_type = COALESCE(p_valuation_data->>'fuel_type', fuel_type),
    registration_number = COALESCE(p_valuation_data->>'registration_number', registration_number),
    features = COALESCE(p_valuation_data->'features', features),
    contact_email = COALESCE(p_valuation_data->>'contact_email', contact_email),
    contact_phone = COALESCE(p_valuation_data->>'contact_phone', contact_phone),
    notes = COALESCE(p_valuation_data->>'notes', notes),
    seller_notes = COALESCE(p_valuation_data->>'seller_notes', seller_notes),
    name = COALESCE(p_valuation_data->>'name', name),
    street_address = COALESCE(p_valuation_data->>'street_address', street_address),
    town = COALESCE(p_valuation_data->>'town', town),
    postcode = COALESCE(p_valuation_data->>'postcode', postcode),
    county = COALESCE(p_valuation_data->>'county', county),
    mobile_number = COALESCE(p_valuation_data->>'mobile_number', mobile_number),
    is_damaged = COALESCE((p_valuation_data->>'is_damaged')::boolean, is_damaged),
    is_registered_in_poland = COALESCE((p_valuation_data->>'is_registered_in_poland')::boolean, is_registered_in_poland),
    seat_material = COALESCE(p_valuation_data->>'seat_material', seat_material),
    number_of_keys = COALESCE((p_valuation_data->>'number_of_keys')::integer, number_of_keys),
    has_tool_pack = COALESCE((p_valuation_data->>'has_tool_pack')::boolean, has_tool_pack),
    has_documentation = COALESCE((p_valuation_data->>'has_documentation')::boolean, has_documentation),
    is_selling_on_behalf = COALESCE((p_valuation_data->>'is_selling_on_behalf')::boolean, is_selling_on_behalf),
    has_private_plate = COALESCE((p_valuation_data->>'has_private_plate')::boolean, has_private_plate),
    finance_amount = COALESCE((p_valuation_data->>'finance_amount')::numeric, finance_amount),
    service_history_type = COALESCE(p_valuation_data->>'service_history_type', service_history_type),
    valuation_result = COALESCE(p_valuation_data->'valuation_result', valuation_result),
    updated_at = NOW()
  WHERE id = p_valuation_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Manual valuation updated successfully'
  );
END;
$$;