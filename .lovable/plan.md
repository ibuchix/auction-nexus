

# Show Seller Phone Numbers with WhatsApp Button

## Problem
The `sellers` table has a `phone_number` column (recently added, 2 out of 3008 sellers have one), but:
1. The `get_sellers_with_emails()` RPC function doesn't include `phone_number`
2. The edge function hardcodes `mobile_number: null` on line 276
3. The SellerList component already has phone display UI but receives null data

## Changes

### 1. Database Migration — Update `get_sellers_with_emails()` RPC
Add `phone_number` to the function's return type, SELECT, and GROUP BY.

### 2. Edge Function — `supabase/functions/admin-api/index.ts`
Line 276: Change `mobile_number: null` to `mobile_number: seller.phone_number`.

### 3. Seller List Component — `src/components/admin/seller-management/SellerList.tsx`
Add a WhatsApp button next to phone numbers. When clicked, opens `https://wa.me/{cleanedNumber}` in a new tab. Will use a green WhatsApp-styled icon/button.

### 4. Seller Interface
The existing `Seller` interface already has `mobile_number: string | null`, so no type changes needed.

## Files to Change

| File | Change |
|------|--------|
| New migration SQL | Update `get_sellers_with_emails()` to include `phone_number` |
| `supabase/functions/admin-api/index.ts` | Map `seller.phone_number` instead of `null` |
| `src/components/admin/seller-management/SellerList.tsx` | Add WhatsApp button next to phone numbers |

