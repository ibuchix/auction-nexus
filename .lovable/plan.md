

## Enhanced Delete Seller - Using Existing Code

There is already a `deleteSeller` case in `supabase/functions/admin-api/index.ts` (lines 465-485). Instead of creating a new database function, we will enhance this existing case to perform the full cascading deletion.

### Current Code (Broken)

The existing `deleteSeller` case has two problems:
- It uses `params.sellerId` directly as both `seller_id` on `cars` AND `user_id` on `sellers` -- but the frontend passes the `sellers.id` (primary key), not the `user_id`. These are different UUIDs.
- It only deletes from `cars` and `sellers`, leaving orphaned records in many other tables.

### What We'll Change

**File: `supabase/functions/admin-api/index.ts`** (lines 465-485)

Replace the existing `deleteSeller` case with an enhanced version that:

1. First looks up the seller's `user_id` from the `sellers` table using `params.sellerId` (which is `sellers.id`)
2. Gets all car IDs belonging to that seller
3. Deletes related data in the correct dependency order:
   - `car_file_uploads` (by seller's user_id)
   - `cars_history` (by seller's user_id)
   - `notifications` (by seller's user_id)
   - `bids` on the seller's cars (by car_id)
   - `auction_schedules` for the seller's cars (by car_id)
   - `auction_results` for the seller's cars (by car_id)
   - `auction_metrics` for the seller's cars (by car_id)
   - `cars` (by seller's user_id)
   - `sellers` record (by sellers.id)
   - `user_roles` (by seller's user_id)
   - `profiles` (by seller's user_id)
4. Returns a summary of what was deleted

**File: `src/components/admin/seller-management/DeleteSellerDialog.tsx`**

Update the confirmation dialog to show the seller's name, email, and listing count so the admin knows exactly who they're deleting.

**File: `src/hooks/useSellerManagement.tsx`**

No changes needed -- it already passes `selectedSeller.id` correctly.

**File: `src/pages/admin/SellerManagement.tsx`**

Pass the `selectedSeller` object to `DeleteSellerDialog`.

### Summary

| File | Change |
|------|--------|
| `supabase/functions/admin-api/index.ts` | Enhance existing `deleteSeller` case (lines 465-485) with full cascade logic and ID resolution |
| `src/components/admin/seller-management/DeleteSellerDialog.tsx` | Show seller details in confirmation |
| `src/pages/admin/SellerManagement.tsx` | Pass `selectedSeller` to dialog |

No new database functions. No new files. Just enhancing what already exists.

