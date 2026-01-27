

## Fix: Transfer seller_acceptable_price from Manual Valuations to Cars

### Problem Identified

When transferring a car from the `manual_valuations` table to the `cars` table, the `seller_acceptable_price` field is **not being transferred**. 

**Evidence:**
| Table | VIN | seller_acceptable_price |
|-------|-----|------------------------|
| manual_valuations | JMBXJCW8W7U002501 | **12,000 zł** |
| cars | JMBXJCW8W7U002501 | **NULL** |

The 2008 Mitsubishi Outlander has the seller's acceptable price stored in `manual_valuations` but it was lost during transfer because the database function `admin_transfer_manual_valuation_to_cars_enhanced` doesn't include this column.

---

### Root Cause

In the database function `admin_transfer_manual_valuation_to_cars_enhanced` (from migration file), the `INSERT INTO cars` statement includes many fields but **omits `seller_acceptable_price`**:

```sql
-- Current INSERT (missing seller_acceptable_price)
INSERT INTO cars (
  seller_id, make, model, year, mileage, vin, transmission, fuel_type,
  seat_material, reserve_price, seller_name, mobile_number, contact_email,
  ...
)
VALUES (
  v_valuation.user_id, v_valuation.make, v_valuation.model, v_valuation.year,
  ...
)
```

The field exists in both tables but isn't mapped during transfer.

---

### Solution

Create a new database migration to update the `admin_transfer_manual_valuation_to_cars_enhanced` function to include `seller_acceptable_price` in the transfer.

#### Database Migration

Update the function to add `seller_acceptable_price` to both the column list and values:

```sql
CREATE OR REPLACE FUNCTION admin_transfer_manual_valuation_to_cars_enhanced(...)
...
INSERT INTO cars (
  seller_id, make, model, year, mileage, vin, transmission, fuel_type,
  seat_material, reserve_price, seller_acceptable_price,  -- ADD THIS COLUMN
  seller_name, mobile_number, contact_email,
  ...
)
VALUES (
  v_valuation.user_id, v_valuation.make, v_valuation.model, v_valuation.year,
  v_valuation.mileage, v_valuation.vin, v_valuation.transmission, v_valuation.fuel_type,
  v_valuation.seat_material, COALESCE(p_reserve_price, v_valuation.reserve_price),
  v_valuation.seller_acceptable_price,  -- ADD THIS VALUE
  v_valuation.name, COALESCE(v_valuation.mobile_number, v_valuation.contact_phone),
  ...
)
```

---

### Additional Fix: Update Existing Cars

For cars that were already transferred without the `seller_acceptable_price`, we should also provide a one-time data fix query that admins can run to backfill the missing values:

```sql
-- Backfill seller_acceptable_price for already-transferred cars
UPDATE cars c
SET seller_acceptable_price = mv.seller_acceptable_price
FROM manual_valuations mv
WHERE c.vin = mv.vin
  AND c.seller_acceptable_price IS NULL
  AND mv.seller_acceptable_price IS NOT NULL;
```

This will fix the 2008 Mitsubishi Outlander and any other cars that were transferred before this fix.

---

### Summary of Changes

| Change | Description |
|--------|-------------|
| New migration file | Update `admin_transfer_manual_valuation_to_cars_enhanced` to include `seller_acceptable_price` in the transfer |
| Data backfill | Optional SQL to fix existing cars that were transferred without this field |

---

### Technical Details

**Files to create:**
- `supabase/migrations/[timestamp]_fix_transfer_seller_acceptable_price.sql`

**Function signature remains the same:**
```sql
admin_transfer_manual_valuation_to_cars_enhanced(
  p_manual_valuation_id UUID,
  p_reserve_price NUMERIC DEFAULT NULL
)
```

No frontend changes are needed - the display code already handles `seller_acceptable_price` correctly; it just wasn't receiving the data because of this transfer bug.

