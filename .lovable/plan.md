

## Security Analysis: `sellers` Table — FALSE POSITIVE

### Current State

The `sellers` table has:
- **RLS enabled**: Yes (`relrowsecurity = true`)
- **Table-level grants**: Both `anon` and `authenticated` have SELECT (this is the standard Supabase default for all public schema tables)

**Columns**: id, user_id, full_name, company_name, tax_id, address, verification_status, is_verified, created_at, updated_at

### RLS Policies in Place

| Policy | Command | Condition |
|--------|---------|-----------|
| Sellers can view their own profile | SELECT | `user_id = auth.uid()` |
| Sellers can update their own profile | UPDATE | `user_id = auth.uid()` |
| Users can create seller profile | INSERT | `user_id = auth.uid()` |
| admin_sellers_access | ALL | hardcoded UUID check |

All policies are **PERMISSIVE**. For any user who is not the seller themselves (or the hardcoded admin), **zero rows are returned**. Anonymous users get `auth.uid() = NULL`, which matches nothing.

### Verdict: This is a false positive

The security scanner flagged the table-level `SELECT` grant to `anon`/`authenticated`, but it did not account for the fact that RLS is enabled and all policies correctly restrict access to only the row owner and admin. No unauthorized user — anonymous or authenticated — can read any seller data.

**Proof**: An anonymous API call like `supabase.from('sellers').select('*')` returns 0 rows because no RLS policy grants access to anonymous users.

### The only real issue (separate finding)

The `admin_sellers_access` policy uses a hardcoded UUID instead of `has_role()`. This is already flagged as a separate security finding and should be addressed in a dedicated migration to replace all 8 hardcoded UUID policies across the codebase.

### Recommendation

No action needed for this specific finding — dismiss it as a false positive. The seller phone numbers are stored in the `cars` table (as `mobile_number`), not in the `sellers` table, and dealer access to car data is already gated by auction status through RLS policies on the `cars` table.

