

# Delete 19 Ford Transit Storage Files

## Confirmation

All 19 files verified in `car-images` bucket, including the **exterior_front** file:
`exterior_front_1773095690279_b6ffadfe-3f51-41d8-8854-ef018557d1a8.webp`

## Approach

Since this is a **data deletion** (not a schema change), we use the data operation tool — not a migration — to avoid modifying the `storage` schema structure. The DELETE only removes rows from `storage.objects` matching this car's exact folder path.

## SQL to Execute

```sql
DELETE FROM storage.objects
WHERE bucket_id = 'car-images'
  AND name LIKE 'a5be6e9f-5d11-4719-9b86-1f5fb973327e/cars/b47cf001-781b-4b1a-b9b7-a6995f0e1080/%';
```

## What This Does

- Deletes exactly 19 rows from `storage.objects` (the metadata entries)
- Supabase automatically removes the underlying physical files when `storage.objects` rows are deleted
- No schema changes — no columns, tables, or indexes are modified
- No other files are affected — the LIKE pattern is scoped to this specific car's folder

## What This Does NOT Do

- Does not alter the `storage` schema structure
- Does not affect any other bucket or any other seller's files
- Does not touch any `public` schema tables (those were already cleaned in the previous migration)

