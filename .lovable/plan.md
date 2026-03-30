

# Switch from Connector Gateway to Direct Twilio API

## Why

The Lovable connector gateway keeps returning `project_not_authorized` despite valid credentials and multiple reconnections. This is a gateway-level issue we cannot resolve. Going direct bypasses it entirely.

## What You'll Need

Three Twilio credentials (from https://console.twilio.com):
1. **Account SID** — starts with `AC`, found on dashboard home
2. **Auth Token** — found on dashboard home (click to reveal)

These will be stored as Supabase Edge Function secrets.

## Plan

### Step 1: Add Supabase Secrets
Add two secrets to the Supabase project:
- `TWILIO_ACCOUNT_SID` — your Account SID (AC...)
- `TWILIO_AUTH_TOKEN` — your primary Auth Token

### Step 2: Update `send-whatsapp/index.ts`
- Remove gateway URL, `LOVABLE_API_KEY`, and `TWILIO_API_KEY` references
- Call Twilio API directly: `https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json`
- Use HTTP Basic Auth: `Authorization: Basic base64(AccountSid:AuthToken)`
- Keep all existing validation, logging, and DB logging

### Step 3: Update `debug-twilio/index.ts`
- Same change: call Twilio directly instead of through gateway
- Test endpoint: `GET /IncomingPhoneNumbers.json`

### Step 4: Disconnect the Twilio Connector
- Once direct calls work, disconnect the connector to avoid confusion

## Files Modified
- `supabase/functions/send-whatsapp/index.ts`
- `supabase/functions/debug-twilio/index.ts`

