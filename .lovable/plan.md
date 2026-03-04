

## Fix: Permission Denied on `metrics_weekly_snapshots`

### Root Cause
The migration created the table and RLS policies but never granted table-level SELECT permission to the `authenticated` and `anon` Postgres roles. Without this, PostgREST returns 403 regardless of RLS policies.

### Fix
Create a new migration with:

```sql
GRANT SELECT ON public.metrics_weekly_snapshots TO authenticated;
GRANT SELECT ON public.metrics_weekly_snapshots TO anon;
```

This is a one-line fix — no code changes needed. The existing RLS policy (`has_role(auth.uid(), 'admin'::user_role)`) will still enforce that only admins can read rows.

