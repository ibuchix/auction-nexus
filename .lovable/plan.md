

# Add Manual Phone Number Override for Dealer Messaging

## Concept
Keep dealer selection mandatory (preserving the `dealer_id` foreign key constraint in logs). Add an optional phone number input that, when filled, overrides the dealer's registered phone number for that send. This lets admins message a dealer at an alternate number while still logging the message against that dealer.

## Changes

### 1. UI — `src/pages/admin/DealerMessaging.tsx`
- Add a new "Override phone number" input field (with `+48` placeholder) below the dealer selection list
- When populated, this number is used instead of the dealer's registered phone for all selected dealers
- Small helper text: "Leave empty to use registered numbers"
- Also allow selecting dealers who have no phone on file (currently filtered out), since the override number will be used

### 2. Send logic — same file
- In `handleSend`, if override phone is set, map all recipients to use that number instead of `d.phone`
- Validation: if override is set, check it looks like a valid E.164 number before allowing send

### 3. No edge function or hook changes needed
The `send-whatsapp` function already accepts any `phoneNumber` + `dealerId` combo. The hook's `sendBulkMessages` already passes whatever phone number it receives. Only the UI mapping changes.

## No database or migration changes required.

