

## Fix Seller Deletion -- Silent Failure Bug

### Root Cause

The delete button click never sends a request to the edge function. The edge function logs confirm zero `deleteSeller` calls were made.

The bug is in `src/hooks/useSellerManagement.tsx` line 53:

```typescript
const handleDeleteSeller = async () => {
    if (!selectedSeller || !userId) return;  // <-- SILENT RETURN when userId is null
```

`userId` comes from `useAdminAuth()` via `AdminContext`. If the RPC admin check hasn't resolved yet, or if there's a timing/state issue, `userId` is `null` and the function silently returns -- no error toast, no request, nothing happens. The user clicks "Remove Account" and the dialog just sits there.

Critically, `userId` is never actually used in the delete operation. Only `selectedSeller.id` is passed to `operations.deleteSeller()`. The `!userId` check is an unnecessary guard that causes the silent failure.

### What We Will Change

**File: `src/hooks/useSellerManagement.tsx`**

1. Remove the unnecessary `!userId` guard that blocks the delete
2. Add proper error feedback if `selectedSeller` is missing
3. Improve error handling so failures are always visible to the user

```typescript
// Before (broken -- silently returns)
const handleDeleteSeller = async () => {
    if (!selectedSeller || !userId) return;
    ...
};

// After (works -- only checks what's actually needed)
const handleDeleteSeller = async () => {
    if (!selectedSeller) {
      toast.error('No seller selected for deletion');
      return;
    }
    ...
};
```

4. Fix the success check to handle both response formats from the edge function. The edge function returns `{ success: true, data: { success: true, message: "...", summary: {...} } }`. After `performAdminOperation` unwraps it, the result could be the inner object (with `.success`) or just the data. We should handle both:

```typescript
// Before
if (result && (result as any).success) {

// After -- accept any truthy result as success
if (result) {
```

The edge function already handles errors by throwing (which causes `performAdminOperation` to return `null`), so a non-null result means success.

### Files to Change

| File | Change |
|------|--------|
| `src/hooks/useSellerManagement.tsx` | Remove `!userId` guard, add error toast for missing seller, simplify success check |

### Why This is Safe

- `userId` was never used in the actual delete call -- removing the check doesn't change the operation
- The edge function already verifies admin access server-side via the JWT token
- Error cases (null result from edge function) are already handled with a toast

