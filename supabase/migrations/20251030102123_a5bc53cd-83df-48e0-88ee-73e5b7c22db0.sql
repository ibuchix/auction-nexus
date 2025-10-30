-- Migration to normalize manual valuation data from JSON to dedicated columns
-- This extracts finance document details and other fields from valuation_result JSON

-- Step 1: Populate dedicated finance document columns from valuation_result JSON
UPDATE manual_valuations
SET 
  finance_document_url = (valuation_result->>'finance_document_url')::text,
  finance_document_name = (valuation_result->>'finance_document_name')::text,
  finance_document_uploaded_at = CASE 
    WHEN (valuation_result->>'finance_document_url') IS NOT NULL THEN created_at
    ELSE NULL
  END
WHERE valuation_result IS NOT NULL
  AND (valuation_result->>'finance_document_url') IS NOT NULL
  AND finance_document_url IS NULL;

-- Step 2: Populate service_history_type from JSON if missing
UPDATE manual_valuations
SET service_history_type = (valuation_result->>'service_history_type')::text
WHERE valuation_result IS NOT NULL
  AND (valuation_result->>'service_history_type') IS NOT NULL
  AND service_history_type IS NULL;

-- Step 3: Create or replace the RPC function for submitting manual valuations
-- This ensures future submissions populate both JSON and dedicated columns
CREATE OR REPLACE FUNCTION submit_manual_valuation_form(p_form_data jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_valuation_id uuid;
BEGIN
  -- Insert the manual valuation with both JSON and dedicated columns
  INSERT INTO manual_valuations (
    user_id,
    make,
    model,
    year,
    mileage,
    transmission,
    fuel_type,
    vin,
    registration_number,
    name,
    contact_email,
    contact_phone,
    mobile_number,
    street_address,
    town,
    county,
    postcode,
    has_outstanding_finance,
    finance_amount,
    finance_document_url,
    finance_document_name,
    finance_document_uploaded_at,
    service_history_type,
    seat_material,
    is_registered_in_poland,
    has_full_registration_document,
    is_selling_on_behalf,
    is_damaged,
    number_of_keys,
    has_tool_pack,
    features,
    notes,
    seller_notes,
    valuation_result,
    status
  ) VALUES (
    auth.uid(),
    (p_form_data->>'make')::text,
    (p_form_data->>'model')::text,
    (p_form_data->>'year')::integer,
    (p_form_data->>'mileage')::integer,
    (p_form_data->>'transmission')::transmission_type,
    (p_form_data->>'fuel_type')::text,
    (p_form_data->>'vin')::text,
    (p_form_data->>'registration_number')::text,
    (p_form_data->>'name')::text,
    (p_form_data->>'contact_email')::text,
    (p_form_data->>'contact_phone')::text,
    (p_form_data->>'mobile_number')::text,
    (p_form_data->>'street_address')::text,
    (p_form_data->>'town')::text,
    (p_form_data->>'county')::text,
    (p_form_data->>'postcode')::text,
    COALESCE((p_form_data->>'has_outstanding_finance')::boolean, false),
    (p_form_data->>'finance_amount')::numeric,
    (p_form_data->>'finance_document_url')::text,
    (p_form_data->>'finance_document_name')::text,
    CASE 
      WHEN (p_form_data->>'finance_document_url') IS NOT NULL THEN now()
      ELSE NULL
    END,
    (p_form_data->>'service_history_type')::text,
    (p_form_data->>'seat_material')::text,
    COALESCE((p_form_data->>'is_registered_in_poland')::boolean, true),
    COALESCE((p_form_data->>'has_full_registration_document')::boolean, false),
    COALESCE((p_form_data->>'is_selling_on_behalf')::boolean, false),
    COALESCE((p_form_data->>'is_damaged')::boolean, false),
    (p_form_data->>'number_of_keys')::integer,
    COALESCE((p_form_data->>'has_tool_pack')::boolean, false),
    COALESCE(p_form_data->'features', '{}'::jsonb),
    (p_form_data->>'notes')::text,
    (p_form_data->>'seller_notes')::text,
    p_form_data,
    'pending'
  )
  RETURNING id INTO v_valuation_id;

  RETURN v_valuation_id;
END;
$$;