

## Admin Review Management -- Approve/Decline Seller and Dealer Reviews

### Overview

Build a new admin page for reviewing, approving, and declining seller and dealer reviews. The entry point will be a "Reviews" item under the **User Management** submenu in the sidebar, alongside Users, Sellers, Dealer Verification, and Valuation Stats.

### Database (No Changes Needed)

Both tables already exist with a `status` column:

| Table | Key columns |
|-------|------------|
| `seller_reviews` | id, seller_id, car_id, rating, review_text, seller_name, car_title, status (pending/approved/rejected), created_at |
| `dealer_reviews` | id, dealer_id, car_id, rating, review_text, dealer_name, car_title, status (pending/approved/rejected), created_at |

### What Will Be Built

**1. Edge function action: `manageReview`**

A new case in `admin-api/index.ts` that updates the `status` of a review:
- Parameters: `reviewId`, `reviewType` (seller/dealer), `newStatus` (approved/rejected)
- Selects the correct table and updates the status

**2. New page: Review Management**

A tabbed page at `/admin/reviews` with three tabs -- Pending, Approved, Rejected. Each tab shows merged seller and dealer review cards sorted by date, with:
- Review type badge (Seller Review / Dealer Review)
- Reviewer name, car title, star rating, review text, date
- Approve and Reject buttons (Pending tab only)
- Confirmation dialog before rejecting

**3. Sidebar and routing integration**

- Add "Reviews" to the User Management submenu in the sidebar (between "Valuation Stats" and the next group)
- Add the `/admin/reviews` route to `UserManagementRoutes.tsx`

### Files to Create/Change

| File | Action | Change |
|------|--------|--------|
| `supabase/functions/admin-api/index.ts` | Edit | Add `manageReview` case to switch block |
| `src/pages/admin/ReviewManagement.tsx` | Create | New page with tabs, review cards, approve/reject buttons |
| `src/components/routes/UserManagementRoutes.tsx` | Edit | Add `/admin/reviews` route |
| `src/constants/sidebarMenuItems.ts` | Edit | Add "Reviews" item to User Management submenu |

### Sidebar Result

After implementation, the User Management submenu will look like:

```text
User Management
  Users
  Sellers
  Dealer Verification
  Valuation Stats
  Reviews            <-- NEW
```

### Technical Details

**Edge function (`admin-api/index.ts`)**:
```typescript
case 'manageReview': {
  const { reviewId, reviewType, newStatus } = params;
  const table = reviewType === 'seller' ? 'seller_reviews' : 'dealer_reviews';
  const { error } = await supabase.from(table).update({ status: newStatus }).eq('id', reviewId);
  if (error) throw error;
  return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
```

**Review Management page**:
- Uses `useQuery` with two parallel fetches from `seller_reviews` and `dealer_reviews`
- Merges results into a unified list with a `reviewType` field, sorted by `created_at` descending
- Tabs filter by `status` and show count badges
- Approve/Reject calls `performAdminOperation('manageReview', { reviewId, reviewType, newStatus })`
- Invalidates query cache on mutation success
- Uses existing UI components: `Tabs`, `Card`, `Badge`, `Button`, `AlertDialog`

**Route (`UserManagementRoutes.tsx`)**:
```typescript
<Route path="/admin/reviews" element={<AdminProtectedRoute><ReviewManagement /></AdminProtectedRoute>} />
```

**Sidebar (`sidebarMenuItems.ts`)**:
```typescript
// Added to User Management submenu array:
{ title: "Reviews", path: "/admin/reviews" }
```

