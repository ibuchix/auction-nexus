

# Revised Plan: Seller Listing Reminder Email (No Nullable car_id Change)

## Key Change from Previous Plan

Instead of making `car_id` nullable (which introduces risk of future bugs if any code assumes `car_id` is always present), we'll keep `car_id NOT NULL` and use a **separate lightweight table** for seller reminder email logs. This completely isolates the new feature from the existing auction outcome email system.

## Changes

### 1. Database Migration

**New table** `seller_email_events` — simple, dedicated log for seller-level emails:

```sql
CREATE TABLE public.seller_email_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  type text NOT NULL,  -- e.g. 'seller_listing_reminder'
  seller_id uuid NOT NULL,
  recipient_email text NOT NULL,
  subject text NOT NULL,
  message_id text NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);
```

With RLS (service role full access, admin SELECT), an index on `seller_id`, and a new RPC:

```sql
CREATE FUNCTION public.get_seller_email_notification_counts(p_seller_ids uuid[])
RETURNS TABLE(seller_id uuid, type text, send_count integer)
```

The existing `email_notification_events` table and `get_email_notification_counts` RPC remain **completely untouched**.

### 2. Edge Function: `send-notifications/index.ts`

- Add `seller_listing_reminder` type handler
- Add `buildSellerListingReminderEmail()` — branded Polish HTML template encouraging sellers to list their cars
- Log to the new `seller_email_events` table instead of `email_notification_events`
- Accept `sellerId` and `sellerEmail` in the request body
- Redeploy the edge function

### 3. New Hook: `useSellerNotificationCounts.ts`

React Query hook calling `get_seller_email_notification_counts` RPC. Returns `Map<seller_id, { seller_listing_reminder: count }>`.

### 4. UI: `SellerList.tsx`

Add a "Remind" button (Mail icon) with a count badge to each seller row, next to the existing delete button.

### 5. `SellerManagement.tsx`

Wire up the new hook and pass counts + send handler to `SellerList`.

## Files Changed

1. New SQL migration (new table + RPC)
2. `supabase/functions/send-notifications/index.ts` (new type + template + handler)
3. `src/hooks/useSellerNotificationCounts.ts` (new file)
4. `src/components/admin/seller-management/SellerList.tsx` (add button + badge)
5. `src/pages/admin/SellerManagement.tsx` (wire up hook)

## Safety

- Zero changes to existing `email_notification_events` table or `get_email_notification_counts` RPC
- All existing auction outcome email flows remain completely untouched
- Clean separation between car-level and seller-level email tracking

