

# Diagnose Twilio Connector Gateway 403 and Prepare for WhatsApp Requirements

## Key Finding

The `project_not_authorized` error originates from the **Lovable connector gateway**, not from Twilio. This means the request never reaches Twilio's servers. WhatsApp templates are irrelevant at this stage — template errors would produce Twilio error code 63016, not a gateway-level 403.

## Root Cause Candidates

1. **Stale credentials cached in edge function** — the function may still be using the old connection's `TWILIO_API_KEY` until redeployed
2. **Gateway-level project/connection mismatch** — the connector may not be fully authorized for this Lovable project despite appearing linked
3. **Credential format issue** — the API Key type or secret may still be incorrect

## Plan

### Step 1: Create a Diagnostic Edge Function

Create `supabase/functions/debug-twilio/index.ts` that:
- Logs masked versions of `LOVABLE_API_KEY` and `TWILIO_API_KEY` (first 8 chars only) to confirm which keys are loaded
- Calls a **read-only** Twilio endpoint: `GET /IncomingPhoneNumbers.json` through the gateway
- Returns the full gateway response status and body
- This isolates whether the 403 is specific to `POST /Messages.json` or affects all gateway calls

### Step 2: Add Detailed Logging to send-whatsapp

Update `supabase/functions/send-whatsapp/index.ts`:
- Log masked key prefixes before the gateway call
- Log the exact URL, headers (minus secrets), and body being sent
- Log the full gateway response status and body on failure
- This gives us the data to understand exactly what the gateway receives

### Step 3: Redeploy Both Functions

Deploy both functions to ensure they pick up the latest `TWILIO_API_KEY` from the new "Autaro" connection.

### Step 4: Add Diagnostic UI Button

Add a "Test Twilio Connection" button to `DealerMessaging.tsx` that invokes `debug-twilio` and displays the raw result, so you can test without composing a full message.

### Step 5: Prepare for WhatsApp Requirements (after gateway works)

Once the gateway auth is resolved, update the implementation for WhatsApp compliance:
- **For sandbox testing**: Add instructions that recipients must first send `join <keyword>` to the Twilio sandbox number
- **For production**: Use Twilio Content Templates API with `ContentSid` parameter instead of freeform `Body`, since business-initiated messages require approved templates

## Files to Create
- `supabase/functions/debug-twilio/index.ts`

## Files to Modify
- `supabase/functions/send-whatsapp/index.ts` — add diagnostic logging
- `supabase/config.toml` — register debug-twilio function
- `src/pages/admin/DealerMessaging.tsx` — add diagnostic button
- `src/hooks/useDealerMessaging.tsx` — add diagnostic invoke method

## Expected Outcome

Running the diagnostic will tell us:
- If **both** endpoints fail with 403 → the connector linkage itself is broken (needs Lovable support or re-link)
- If **GET works but POST fails** → permissions issue on the Twilio account side
- If **both work after redeploy** → it was stale cached credentials

