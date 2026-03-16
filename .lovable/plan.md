

# Fix: Re-create Missing Database Triggers

## Problem Found

The attribution trigger **functions** (`attribute_listing_conversion` and `attribute_registration_conversion`) exist in the database, but the **triggers** that attach them to the `cars` and `profiles` tables are missing. This means:

1. Even when the seller app sets `profiles.tracking_ref`, the `trg_attribute_registration_conversion` trigger won't fire to create a conversion record
2. When a user with `tracking_ref` lists a car, the `trg_attribute_listing_conversion` trigger won't fire either

Additionally, **zero profiles have `tracking_ref` populated** — the seller app fix may not be deployed yet or may not be working. The most recent registration (Instagram user `4eeecd41` at 20:37) has `tracking_ref = NULL`.

## Fix

### Part 1: Re-create the triggers via migration

```sql
-- Re-attach the listing attribution trigger to cars table
CREATE TRIGGER trg_attribute_listing_conversion
  AFTER INSERT ON cars
  FOR EACH ROW
  EXECUTE FUNCTION attribute_listing_conversion();

-- Re-attach the registration attribution trigger to profiles table  
CREATE TRIGGER trg_attribute_registration_conversion
  AFTER UPDATE OF tracking_ref ON profiles
  FOR EACH ROW
  WHEN (OLD.tracking_ref IS NULL AND NEW.tracking_ref IS NOT NULL)
  EXECUTE FUNCTION attribute_registration_conversion();
```

### Part 2: Verify seller app fix

After the triggers are re-created, you should test by:
1. Opening `https://www.autaro.pl/sell?ref=ot-instagram-post-done--nyn4` in a fresh browser
2. Registering as a new seller and completing the phone number step
3. I can then query `profiles.tracking_ref` and `tracking_conversions` to confirm the full chain works

### Files changed
1. New SQL migration to re-create the two triggers

