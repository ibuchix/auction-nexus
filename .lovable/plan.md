

# Implement WhatsApp Template Messaging

## Context
The Content SID `HX59c13261dc7029887afdc2be35bd6a3a` is an approved Twilio template. Using `ContentSid` + `ContentVariables` instead of `Body` allows sending messages to dealers **outside the 24-hour window** — solving the delivery problem.

## What Changes

### 1. Update Edge Function (`supabase/functions/send-whatsapp/index.ts`)
- Accept a new optional `useTemplate` boolean and `contentVariables` object from the request body
- When `useTemplate` is true, replace `Body` with `ContentSid` and `ContentVariables` in the Twilio API call:
  ```
  ContentSid: "HX59c13261dc7029887afdc2be35bd6a3a"
  ContentVariables: JSON.stringify({"1": carTitle})
  ```
- When `useTemplate` is false (or absent), keep current free-form `Body` behavior as fallback
- Store the content SID as a constant in the edge function

### 2. Update Hook (`src/hooks/useDealerMessaging.tsx`)
- Add `useTemplate` and `contentVariables` to the mutation parameters
- Pass them through to the edge function invocation

### 3. Update UI (`src/pages/admin/DealerMessaging.tsx`)
- Add a toggle/switch: **"Use approved template"** (default: on)
- When template mode is on:
  - Show the template text as read-only preview with the car name injected
  - Hide the free-text Textarea (not needed — template is fixed)
  - Vehicle selector becomes required (needed for the `{{1}}` variable)
- When template mode is off:
  - Show the existing free-text Textarea (for use within the 24-hour window only)
  - Add a small warning: "Free-form messages only work within 24h of dealer messaging you first"

### 4. No database changes needed
The existing `whatsapp_message_log` table already stores all relevant fields.

## Technical Detail

Twilio template call replaces the request body params:
```
// Before (free-form):
{ To, From, Body }

// After (template):
{ To, From, ContentSid, ContentVariables }
```

`ContentVariables` is a JSON string: `{"1": "BMW 320d 2019"}` — mapping placeholder `{{1}}` to the car title.

