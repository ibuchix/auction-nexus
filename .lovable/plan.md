
# Fix Campaign Tracking Attribution Accuracy

## Status: Parts 1-3 DONE ✅ — Backfill & Smart Funnel DONE ✅ — Parts 4-7 pending (seller app)

## What was implemented (this project)

### Database changes (migrations applied):

1. **`profiles.tracking_ref`** column added — stores the `ref` code that brought the user
2. **`trg_attribute_listing_conversion`** trigger on `cars` INSERT — when a seller with a `tracking_ref` lists a car, automatically creates a `tracking_events` record (`listing_submitted`) and a `tracking_conversions` record
3. **`trg_attribute_registration_conversion`** trigger on `profiles` UPDATE — when `tracking_ref` is first set on a profile, automatically creates a `registration` conversion record
4. **Retroactive backfill** — attributed 6 previously unlinked events (2 listings, 4 valuations) to Facebook via IP hash matching
5. **Smart `get_tracking_funnel_stats`** — updated RPC function now auto-attributes unlinked events to their original tracking link via IP hash matching at query time, no manual backfills needed going forward

### Current attribution numbers (after fix):
| Link | Clicks | Valuations | Registrations | Listings |
|------|--------|------------|---------------|----------|
| Facebook | 873 | 171 | 12 | 3 |
| Instagram | 578 | 6 | 1 | 0 |
| Organic | 2 | 155 | 12 | 4 |

Both triggers use `SECURITY DEFINER` so they work regardless of RLS policies.

## What's needed next (seller app — auto-strada001testing)

The seller app needs these changes to actually populate `profiles.tracking_ref`:

4. **`useTrackingCapture`**: When `?ref=CODE` is in the URL, persist it in localStorage AND keep it in URL state across navigation
5. **`useTrackEvent`**: Remove silent drop when `visitor_id` is missing — generate one on the fly
6. **Registration flow**: After signup, UPDATE the user's profile to set `tracking_ref` from localStorage/URL — this fires the registration trigger
7. **Valuation flow**: Read `ref` from URL params as fallback when localStorage is empty

### How the seller app should set tracking_ref:

```typescript
// After successful registration/login, if ref code exists:
const ref = localStorage.getItem('tracking_ref') || new URLSearchParams(window.location.search).get('ref');
if (ref) {
  await supabase.from('profiles').update({ tracking_ref: ref }).eq('id', user.id);
}
```

This single line wires up the entire server-side attribution chain — the database triggers handle the rest automatically.
