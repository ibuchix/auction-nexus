

# Translate Dealer Messaging Platform UI to English

The platform UI is currently in Polish but should be in English. The default message template (sent to dealers) stays in Polish since dealers are Polish-speaking customers.

## Changes

### File: `src/pages/admin/DealerMessaging.tsx`

All UI labels, headings, placeholders, and helper text translated to English:

- Page title: "WhatsApp Messages to Dealers"
- Diagnostic card title: "Twilio Connection Diagnostics"
- Diagnostic description: "Check if the Twilio connector gateway is properly configured."
- Diagnostic button: "Test Twilio Connection" / "Testing..."
- Send card title: "Send Message"
- Labels: "Dealer", "Phone Number (E.164)", "Vehicle (optional)", "Message Body"
- Placeholders: "Select dealer...", "Select vehicle...", "Enter message body..."
- Helper text: "{length}/1600 characters. Use {car_title} to insert the vehicle name."
- Preview section: "Preview:", "To:"
- Send button: "Send WhatsApp" / "Sending..."
- Empty state: "No messages sent."
- Table headers: "Date", "Dealer", "Phone", "Vehicle", "Status", "Message"
- Phone validation: "Format: +48XXXXXXXXX"
- Remove `pl` locale import from date-fns (use default English formatting)

**Keep the DEFAULT_TEMPLATE in Polish** — this is the message content sent to Polish-speaking dealers.

### File: `src/hooks/useDealerMessaging.tsx`

- Success toast: "Message sent" / "WhatsApp was sent successfully."
- Error toast: "Send error" / error.message

