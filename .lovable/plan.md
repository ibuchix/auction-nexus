

# Update WhatsApp Sender Number

## Change
Update the hardcoded `TWILIO_FROM_NUMBER` in `supabase/functions/send-whatsapp/index.ts` from `+48732096585` to `+48459569800`.

## File
- `supabase/functions/send-whatsapp/index.ts` — change line defining `TWILIO_FROM_NUMBER`

## After
Redeploy the edge function and test sending a message.

