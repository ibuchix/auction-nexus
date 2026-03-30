

# Dealer WhatsApp Messaging Feature

## Overview
Build an admin feature to send WhatsApp messages to verified dealers about vehicles available for bidding, using the connected Twilio connector gateway.

## Architecture

```text
Admin UI (Dealer Messaging page)
  └─► supabase.functions.invoke('send-whatsapp')
        └─► Twilio Gateway (connector-gateway.lovable.dev/twilio)
              └─► WhatsApp message to dealer phone
  └─► whatsapp_message_log table (tracks history)
```

## Implementation Steps

### Step 1: Database Migration — `whatsapp_message_log` table
Create table to track message history:
- `id` (uuid, PK)
- `dealer_id` (uuid, FK to dealers)
- `car_id` (uuid, nullable FK to cars)
- `phone_number` (text)
- `message_body` (text)
- `template_name` (text, nullable)
- `twilio_message_sid` (text, nullable)
- `status` (text: queued/sent/delivered/failed)
- `error_message` (text, nullable)
- `sent_by` (uuid, FK to profiles — the admin who sent it)
- `created_at` (timestamptz)

RLS: admin-only access via `has_role(auth.uid(), 'admin')`.
GRANTs for `authenticated` role (SELECT, INSERT).

### Step 2: Edge Function — `send-whatsapp`
New edge function at `supabase/functions/send-whatsapp/index.ts`:
- Validates JWT and admin role via `has_role` RPC
- Input validation with Zod: `dealerId`, `phoneNumber`, `messageBody`, optional `carId`
- Calls Twilio gateway: `POST https://connector-gateway.lovable.dev/twilio/Messages.json` with `Content-Type: application/x-www-form-urlencoded`
- WhatsApp format: `To=whatsapp:+48...`, `From=whatsapp:+{twilio_number}`
- Logs result to `whatsapp_message_log` table
- Returns success/failure with Twilio SID

Register in `supabase/config.toml` with `verify_jwt = false`.

### Step 3: Admin UI — Dealer Messaging Page
New page at `src/pages/admin/DealerMessaging.tsx`:
- **Dealer selector**: dropdown of verified dealers (from `dealers` table, filtered by `is_verified = true`), showing dealership name + phone number
- **Car selector** (optional): dropdown of active auction cars to reference in message
- **Message template**: editable textarea with Polish-language default template, e.g. "Cześć! Mamy nowy pojazd dostępny do licytacji: {car_title}. Sprawdź szczegóły na aukcja.autaro.pl"
- **Send button**: calls edge function, shows toast on success/failure
- **Message history table**: paginated list from `whatsapp_message_log` showing dealer name, car, status, timestamp

### Step 4: Routing & Navigation
- Add route `/admin/dealer-messaging` in `UserManagementRoutes.tsx` wrapped in `AdminProtectedRoute`
- Add "Dealer Messaging" entry to sidebar under "User Management" submenu in `sidebarMenuItems.ts`

### Step 5: Hook — `useDealerMessaging`
Custom hook to:
- Fetch verified dealers with phone numbers
- Fetch active cars for the car selector
- Send message via `supabase.functions.invoke('send-whatsapp')`
- Fetch message history from `whatsapp_message_log`

## Files to Create
- `supabase/functions/send-whatsapp/index.ts`
- `src/pages/admin/DealerMessaging.tsx`
- `src/hooks/useDealerMessaging.tsx`

## Files to Modify
- `supabase/config.toml` — register new function
- `src/constants/sidebarMenuItems.ts` — add menu item
- `src/components/routes/UserManagementRoutes.tsx` — add route

## Technical Notes
- Dealers table has no direct `phone_number` column — it's on the related `profiles` or fetched via existing RPCs. The `sellers` table has `phone_number`. For dealers, phone numbers come from the `profiles` table email or from the dealer creation RPC (`p_phone_number`). We'll query via a join or existing RPC.
- Twilio gateway auto-prepends `/2010-04-01/Accounts/{AccountSid}` — we only specify `/Messages.json`
- Uses `application/x-www-form-urlencoded` (not JSON) for Twilio POST
- The `LOVABLE_API_KEY` and `TWILIO_API_KEY` env vars are already available from the connected "AUTARO 3" connection

