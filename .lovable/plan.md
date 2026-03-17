

# Secure Fix: Column-Level GRANT for profiles

## The Risk

A blanket `GRANT UPDATE ON profiles TO authenticated` would allow any user to modify their own `role` (escalate to admin) and `suspended` (unsuspend themselves) columns. RLS only restricts row access, not column access.

## Safe Alternative

PostgreSQL supports column-level grants. We should grant UPDATE only on the columns users legitimately need to modify:

```sql
GRANT UPDATE (full_name, avatar_url, tracking_ref, updated_at) ON public.profiles TO authenticated;
```

This allows the seller app's `profiles.update({ tracking_ref: ref })` to work while preventing any changes to `role` or `suspended`.

## What This Achieves

- `tracking_ref` updates from the seller app will succeed
- The `trg_attribute_registration_conversion` trigger will fire on tracking_ref changes
- Users **cannot** modify `role`, `suspended`, or `id`
- No other code changes needed

## Files Changed

1. New SQL migration: column-level GRANT statement

