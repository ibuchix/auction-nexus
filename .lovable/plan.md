

# Fix: Grant Table Permissions for Tracking Tables

## Root Cause

The `tracking_links` table (and likely `tracking_events` and `tracking_conversions`) was created without granting any privileges to the `authenticated` or `anon` Postgres roles. RLS policies exist and are correct, but PostgreSQL checks **table-level GRANT permissions first**, before RLS policies are even evaluated. No grants = immediate "permission denied."

This is a common issue when tables are created via raw SQL without the standard Supabase grants.

## Fix

A single migration that grants the necessary privileges:

| Table | Role | Privileges |
|-------|------|-----------|
| `tracking_links` | `authenticated` | SELECT, INSERT, UPDATE, DELETE |
| `tracking_events` | `authenticated` | SELECT |
| `tracking_events` | `anon` | INSERT (for edge function via anon key) |
| `tracking_conversions` | `authenticated` | SELECT |

The existing RLS policies (`has_role(auth.uid(), 'admin')` on tracking_links, service role on events/conversions) will continue to enforce row-level access after the grants are in place.

## Files Changed

| File | Change |
|------|--------|
| New migration SQL | `GRANT` statements for all three tracking tables |

No frontend code changes needed — the hooks and queries are already correct.

