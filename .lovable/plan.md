

## Fix Image Upload Categories to Match Database

### Problem Summary
The admin image upload is failing because the frontend dropdown includes `damage` and `general` category options that are **not allowed** by the database's `validate_image_category()` constraint.

### Database Allowed Categories (from `validate_image_category` function)

| Category Group | Allowed Values |
|----------------|----------------|
| **Exterior Photos** | `exterior_front`, `exterior_rear`, `exterior_left`, `exterior_right` |
| **Interior Photos** | `interior_front`, `interior_rear` |
| **Mechanical** | `engine_bay`, `dashboard` |
| **Rim Photos** | `rim_front_left`, `rim_front_right`, `rim_rear_left`, `rim_rear_right` |
| **Video** | `walkaround_video` |
| **Additional** | `additional_1`, `additional_2`, `additional_3`, `additional_4`, `additional_5`, `additional_6`, `additional_7`, `additional_8` |
| **Legacy** | `oil_cap_underneath` (no longer required but valid for existing data) |

---

### Solution: Update Frontend to Match Backend

#### File 1: `src/components/admin/car-edit/tabs/ImagesTab.tsx`

**Current dropdown (lines 162-173):**
```
exterior_front, exterior_rear, exterior_left, exterior_right,
interior_front, interior_rear, engine_bay, dashboard,
damage (INVALID), general (INVALID)
```

**Updated dropdown:**
```
exterior_front, exterior_rear, exterior_left, exterior_right,
interior_front, interior_rear, engine_bay, dashboard,
rim_front_left, rim_front_right, rim_rear_left, rim_rear_right,
additional_1, additional_2, additional_3, additional_4,
additional_5, additional_6, additional_7, additional_8
```

This provides admins with all 20 valid image categories (excluding `walkaround_video` which has its own uploader, and `oil_cap_underneath` which is legacy).

---

#### File 2: `src/utils/imageUtils.ts`

Update the `categoryMap` to include all backend categories for proper display formatting:

**Add missing categories:**
- `additional_5` through `additional_8`
- `walkaround_video`
- `oil_cap_underneath` (legacy support)

---

### Summary of Changes

| File | Change |
|------|--------|
| `src/components/admin/car-edit/tabs/ImagesTab.tsx` | Replace `damage`/`general` with rim photos and all 8 additional slots |
| `src/utils/imageUtils.ts` | Add `additional_5`-`additional_8`, `walkaround_video`, `oil_cap_underneath` to categoryMap |

---

### Technical Details

The database constraint `check_valid_category` uses the `validate_image_category()` function which only accepts these specific 21 values:

```sql
RETURN category_value IN (
  'exterior_front', 'exterior_rear', 'exterior_left', 'exterior_right',
  'interior_front', 'interior_rear', 'engine_bay', 'dashboard',
  'rim_front_left', 'rim_front_right', 'rim_rear_left', 'rim_rear_right',
  'walkaround_video',
  'oil_cap_underneath',
  'additional_1', 'additional_2', 'additional_3', 'additional_4',
  'additional_5', 'additional_6', 'additional_7', 'additional_8'
);
```

Any other value will trigger the constraint violation error you experienced.

