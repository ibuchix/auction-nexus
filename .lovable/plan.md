

# Multi-Dealer WhatsApp Messaging with Auto-Phone Numbers

## Summary
Three changes: (1) fix template preview text, (2) enable multi-dealer selection with their registered phone numbers auto-populated, (3) send messages in a loop to all selected dealers.

## Current Situation
- The `dealers` table has **no phone number column** -- dealer phones are stored on `auth.users.phone` (the number they registered with)
- Currently the admin must manually type one phone number and select one dealer at a time
- The template preview text is outdated

## What Changes

### 1. Fix Template Preview Text
Update the constant in `DealerMessaging.tsx`:
```
"Cześć! Nowy pojazd jest dostępny do licytacji. Sprawdź szczegóły na platformie AUTARO. https://aukcja.autaro.pl"
```
Note: This template has **no `{{1}}` placeholder** -- so the vehicle selector becomes optional (for logging only), and no `ContentVariables` are needed.

### 2. Add Phone Numbers to Dealer Query (Edge Function)
The dealers' phone numbers live in `auth.users.phone`, which is only accessible server-side. Two options:

**Option A -- New edge function endpoint** (recommended): Create a small RPC or modify the `send-whatsapp` edge function to also serve a `getDealersWithPhones` action. This calls `auth.admin.getUserById` for each verified dealer and returns `{ id, dealership_name, phone }`.

**Option B -- Add a `phone_number` column to `dealers` table**: Add a migration to store the phone on the dealers table directly. This requires backfilling from auth.users and keeping it in sync.

**I recommend Option A** -- a new edge function endpoint that fetches verified dealers with their auth phone numbers, avoiding schema changes and sync issues.

### 3. New Edge Function: `get-dealers-with-phones`
- Fetches all verified dealers from `dealers` table
- For each, calls `auth.admin.getUserById(user_id)` to get `phone`
- Returns `{ id, dealership_name, phone }[]`
- Admin-only (same auth check as send-whatsapp)

### 4. Update Hook (`useDealerMessaging.tsx`)
- Add a query that calls the new edge function to get dealers with phone numbers
- Change `sendMessage` mutation to accept an array of `{ dealerId, phoneNumber }` recipients
- Loop through recipients, calling `send-whatsapp` for each one sequentially (to respect rate limits and log each individually)

### 5. Update UI (`DealerMessaging.tsx`)
- **Replace single-select dealer dropdown** with a multi-select checkbox list showing each dealer's name and phone number (from the new endpoint)
- Add "Select All" / "Deselect All" buttons
- **Remove the manual phone number input** -- phones come from dealer registration data automatically
- Show a summary: "Sending to 5 dealers" with a list of names/phones
- The send button triggers sequential sends to all selected dealers
- Show a progress indicator during bulk send ("Sent 3/5...")
- Vehicle selector becomes optional (template has no placeholder)

### 6. Update Edge Function (`send-whatsapp/index.ts`)
- When `useTemplate` is true and no `contentVariables` provided, send template without `ContentVariables` (since the approved template has no placeholders)
- No other changes needed -- each message is still a single API call

## Files to Create/Modify
1. **Create** `supabase/functions/get-dealers-with-phones/index.ts` -- new edge function
2. **Modify** `src/hooks/useDealerMessaging.tsx` -- add dealers-with-phones query, bulk send logic
3. **Modify** `src/pages/admin/DealerMessaging.tsx` -- multi-select UI, remove manual phone input, fix template text
4. **Modify** `supabase/functions/send-whatsapp/index.ts` -- handle template without content variables

## No Database Changes Needed
Phone numbers are already in `auth.users`. No migrations required.

