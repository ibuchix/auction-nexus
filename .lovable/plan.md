

## Fix Seller Deletion -- Handle All Foreign Key Constraints

### Root Cause

The edge function IS deployed and working (confirmed via test call), but the cascading delete fails silently because **the database has foreign key constraints with `NO ACTION`** on several tables that the current delete code doesn't handle. When the edge function tries to delete `cars` or `profiles`, PostgreSQL blocks the operation because child rows still exist in unhandled tables.

### Foreign Key Analysis

Tables referencing `cars.id` that the current code does NOT delete:

| Table | FK delete rule | Currently handled? |
|-------|---------------|-------------------|
| `bids` | CASCADE | Yes (also manually) |
| `auction_metrics` | CASCADE | Yes (also manually) |
| `auction_closure_details` | CASCADE | Auto (CASCADE) |
| `dealer_purchases` | CASCADE | Auto (CASCADE) |
| `listing_verifications` | CASCADE | Auto (CASCADE) |
| `seller_bid_decisions` | CASCADE | Auto (CASCADE) |
| `dealer_won_vehicles` | CASCADE | Auto (CASCADE) |
| `dealer_wishlists` | CASCADE | Auto (CASCADE) |
| `car_file_uploads` | **NO ACTION** | Partially (deletes by seller_id, not car_id) |
| `auction_schedules` | **NO ACTION** | Yes |
| `auction_results` (car_id) | **NO ACTION** | Yes |
| `cars_history` | **NO ACTION** | Yes (by seller_id) |
| **`disputes`** | **NO ACTION** | **NO -- BLOCKS DELETE** |
| **`seller_reviews`** | **NO ACTION** | **NO -- BLOCKS DELETE** |
| **`dealer_reviews`** | **NO ACTION** | **NO -- BLOCKS DELETE** |

Tables referencing `profiles.id` that block profile deletion:

| Table | Currently handled? |
|-------|-------------------|
| **`disputes`** (submitted_by, assigned_to) | **NO -- BLOCKS DELETE** |
| **`dispute_comments`** (author_id) | **NO -- BLOCKS DELETE** |
| **`audit_logs`** (user_id) | **NO -- BLOCKS DELETE** |
| **`manual_valuations`** (user_id) | **Needs checking** |

### What We Will Change

**1. `supabase/functions/admin-api/index.ts`** -- Update the `deleteSeller` case (lines 464-577) to delete from ALL tables with NO ACTION constraints before deleting cars and profiles.

New deletion order:
```
1. car_file_uploads (by seller_id)          -- already done
2. cars_history (by seller_id)              -- already done
3. notifications (by user_id)               -- already done
4. For each car_id:
   a. disputes (by car_id)                  -- NEW
   b. dispute_comments (for those disputes) -- NEW
   c. seller_reviews (by car_id)            -- NEW
   d. dealer_reviews (by car_id)            -- NEW
   e. bids                                  -- already done
   f. auction_schedules                     -- already done
   g. auction_results                       -- already done
   h. auction_metrics                       -- already done
5. cars (by seller_id)                      -- already done
6. sellers record                           -- already done
7. manual_valuations (by user_id)           -- NEW
8. audit_logs (by user_id)                  -- NEW
9. dispute_comments (by author_id)          -- NEW
10. disputes (by submitted_by)              -- NEW
11. user_roles                              -- already done
12. profiles                                -- already done
```

**2. `src/hooks/useSellerManagement.tsx`** -- The error handling is already correct. The issue is purely the edge function failing at the database level due to FK violations.

### Technical Details

The updated `deleteSeller` case block in `admin-api/index.ts` will add these deletion steps before deleting cars:

```typescript
// NEW: Delete disputes and their comments for seller's cars
if (carIds.length > 0) {
  // Get dispute IDs for these cars first (needed for dispute_comments)
  const { data: carDisputes } = await supabase
    .from('disputes')
    .select('id')
    .in('car_id', carIds)
  const disputeIds = carDisputes?.map(d => d.id) || []
  
  if (disputeIds.length > 0) {
    const { count: commentCount } = await supabase
      .from('dispute_comments')
      .delete({ count: 'exact' })
      .in('dispute_id', disputeIds)
    deletionSummary.dispute_comments_by_car = commentCount || 0
  }
  
  const { count: disputeCount } = await supabase
    .from('disputes')
    .delete({ count: 'exact' })
    .in('car_id', carIds)
  deletionSummary.disputes_by_car = disputeCount || 0
  
  const { count: sellerReviewCount } = await supabase
    .from('seller_reviews')
    .delete({ count: 'exact' })
    .in('car_id', carIds)
  deletionSummary.seller_reviews = sellerReviewCount || 0
  
  const { count: dealerReviewCount } = await supabase
    .from('dealer_reviews')
    .delete({ count: 'exact' })
    .in('car_id', carIds)
  deletionSummary.dealer_reviews = dealerReviewCount || 0
}
```

And after deleting sellers but before deleting profiles:

```typescript
// NEW: Delete manual valuations by this user
const { count: manualValCount } = await supabase
  .from('manual_valuations')
  .delete({ count: 'exact' })
  .eq('user_id', sellerUserId)
deletionSummary.manual_valuations = manualValCount || 0

// NEW: Delete audit logs by this user
const { count: auditCount } = await supabase
  .from('audit_logs')
  .delete({ count: 'exact' })
  .eq('user_id', sellerUserId)
deletionSummary.audit_logs = auditCount || 0

// NEW: Delete dispute comments by this user
const { count: userCommentCount } = await supabase
  .from('dispute_comments')
  .delete({ count: 'exact' })
  .eq('author_id', sellerUserId)
deletionSummary.dispute_comments_by_user = userCommentCount || 0

// NEW: Delete disputes submitted by this user
const { count: userDisputeCount } = await supabase
  .from('disputes')
  .delete({ count: 'exact' })
  .eq('submitted_by', sellerUserId)
deletionSummary.disputes_by_user = userDisputeCount || 0
```

### Files to Change

| File | Change |
|------|--------|
| `supabase/functions/admin-api/index.ts` | Add missing table deletions in the `deleteSeller` case block |

No other files need changes -- the frontend error handling is already correct. Once the FK violations are eliminated, the existing flow will work end-to-end.

