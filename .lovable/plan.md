

# WhatsApp Messaging to Dealers via Twilio

## Overview

Add the ability for admins to send WhatsApp messages to verified dealers about cars available for bidding in their area, using Twilio's WhatsApp API through the connector gateway.

## Prerequisites

**Twilio Connector**: No Twilio connection exists yet. We need to set up the Twilio connector using the `standard_connectors--connect` tool. This provides `LOVABLE_API_KEY` and `TWILIO_API_KEY` as environment variables for the edge function.

**Twilio WhatsApp Sender**: You need a Twilio-approved WhatsApp sender number. This is configured in the Twilio console (either a sandbox number for testing or a production-approved number). You'll need to store the sender number as a secret.

## Data Available

- **Dealers table**: `id`, `dealership_name`, `address`, `user_id`, `verification_status`
- **Dealer phone numbers**: fetched via `supabase.auth.admin.getUserById(dealer.user_id)` → `user.phone`
- **Cars table**: `make`, `model`, `year`, `town`, `county`, `current_bid`, `reserve_price`, `auction_status`, `auction_end_time`

## Changes

### 1. Edge Function: `supabase/functions/send-whatsapp/index.ts`

New edge function that:
- Validates admin JWT (same pattern as `admin-api`)
- Accepts actions: `sendToDealer` (single) and `sendToMultipleDealers` (bulk)
- Calls Twilio WhatsApp API via connector gateway: `POST https://connector-gateway.lovable.dev/twilio/Messages.json`
- Message body includes car details (make, model, year, town) and a link to the dealer app
- Logs each message to a new `whatsapp_message_log` table
- Uses `Content-Type: application/x-www-form-urlencoded` with `To: whatsapp:+48...` and `From: whatsapp:+{sender_number}`

### 2. Database Migration: `whatsapp_message_log` table

```sql
create table public.whatsapp_message_log (
  id uuid primary key default gen_random_uuid(),
  dealer_id text not null,
  dealer_phone text not null,
  car_id uuid references public.cars(id),
  message_body text not null,
  twilio_sid text,
  status text default 'sent',
  sent_by uuid references auth.users(id),
  created_at timestamptz default now()
);
```

With RLS: only admins can read/insert (via `has_role` function).

### 3. Admin UI: `src/pages/admin/DealerMessaging.tsx`

New page accessible from the sidebar with:
- A car selector (dropdown of active auction cars with make/model/town)
- A dealer list showing verified dealers with phone numbers, filterable by area (matching car's town/county to dealer address)
- Checkboxes to select dealers + "Select All" option
- Message template preview (auto-generated from car details, editable before send)
- "Send via WhatsApp" button that calls the edge function
- Message history log table at the bottom

### 4. Sidebar & Routing

- Add "Dealer Messaging" menu item under the existing dealer management group in `src/constants/sidebarMenuItems.ts`
- Add route `/admin/dealer-messaging` in `src/components/routes/UserManagementRoutes.tsx`

### 5. Message Template

Default Polish template:
```
🚗 Nowy samochód na Autaro!

{year} {make} {model}
📍 Lokalizacja: {town}, {county}
💰 Cena wywoławcza: {reserve_price} PLN
⏰ Aukcja kończy się: {auction_end_time}

Złóż ofertę teraz: {dealer_app_url}
```

Editable by admin before sending.

## Files

1. `supabase/functions/send-whatsapp/index.ts` — new edge function
2. `supabase/config.toml` — register new function
3. Database migration — `whatsapp_message_log` table + RLS
4. `src/pages/admin/DealerMessaging.tsx` — new page
5. `src/constants/sidebarMenuItems.ts` — add menu item
6. `src/components/routes/UserManagementRoutes.tsx` — add route

## Implementation Order

1. Connect Twilio connector + add WhatsApp sender number secret
2. Create database migration
3. Build and deploy edge function
4. Build admin UI page
5. Add routing and sidebar entry

