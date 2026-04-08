

# Fix Message Status Display in WhatsApp History

## Problem
When Twilio successfully accepts a message, it returns status `"queued"` (Twilio's internal processing state). The edge function logs this literally as `"queued"` in the `whatsapp_message_log` table. From the admin's perspective, if Twilio accepted the message without error, it should show as **"sent"**.

The only statuses that currently get logged are:
- `"queued"` — Twilio accepted the request (line 154 of `send-whatsapp/index.ts`)
- `"failed"` — Twilio returned an error

There is no webhook set up to receive delivery status updates from Twilio, so "queued" messages never get updated to "sent" or "delivered".

## Solution
**Change the logged status from `"queued"` to `"sent"`** when Twilio returns a success response. This is a single-line change in the edge function.

Line 154 of `supabase/functions/send-whatsapp/index.ts`:
```typescript
// Before:
const status = twilioResponse.ok ? "queued" : "failed";

// After:
const status = twilioResponse.ok ? "sent" : "failed";
```

Then redeploy the `send-whatsapp` edge function.

This means all **future** messages that Twilio accepts will show as "sent". Existing "queued" records in the database that were actually delivered will remain as "queued" unless we also run a one-time SQL update to fix historical data:

```sql
UPDATE whatsapp_message_log
SET status = 'sent'
WHERE status = 'queued' AND error_message IS NULL;
```

## Summary of changes
1. **`supabase/functions/send-whatsapp/index.ts`** — change `"queued"` to `"sent"` on success
2. **Deploy** the updated edge function
3. **Migration** — update existing "queued" records to "sent" where there was no error

No frontend changes needed — the status badge component already handles "sent" with a default badge style.

