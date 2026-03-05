

## Security Fix: Make Storage Buckets Private — Risk Analysis

### Verification Result: SAFE TO PROCEED

I searched the entire codebase exhaustively:

- **`getPublicUrl()`** — 0 uses across all files
- **`/storage/v1/object/public/`** hardcoded URLs — 0 uses
- **`createSignedUrl()`** — 30 uses across 5 files (this is the only access pattern)
- **`upload()` / `remove()`** — used for writes, unaffected by public/private setting

Every file access path in the app — dealer side, seller side, admin side — goes through signed URLs which work identically on both public and private buckets. The `public` flag on a bucket only controls whether the `/object/public/` endpoint works; it has zero effect on signed URLs, uploads, or deletions.

### What Changes

| Bucket | Current | After | Impact |
|--------|---------|-------|--------|
| `car-images` | public | **private** | None — all 30 `createSignedUrl` calls unaffected |
| `car-files` | public | **private** | None — accessed via signed URLs in `useFileManagement` |
| `manual-valuation-photos` | public | **private** | None — accessed via signed URLs in `ManualValuationImages` |
| `avatars` | public | **stays public** | No change — low-sensitivity profile pictures |
| `dealer-documents` | private | **stays private** | Already correct |

### What Won't Break

- **Dealer viewing auction car images** — uses `createSignedUrl` via `VehicleImages` component
- **Seller uploading/viewing their car photos** — uses `upload()` and `createSignedUrl`
- **Admin editing car images/documents** — uses `createSignedUrl` in `useFileManagement`
- **Manual valuation photo viewing** — uses `createSignedUrl` in `ManualValuationImages`
- **Document downloads** — uses `createSignedUrl` in `useDealerDocuments`
- **Image exports to ZIP** — fetches from signed URLs
- **Cleanup edge function** — uses `remove()` with service role key

### Migration

```sql
UPDATE storage.buckets SET public = false 
WHERE name IN ('car-images', 'car-files', 'manual-valuation-photos');
```

One statement, immediately effective, no downtime. Existing signed URLs that were already generated continue to work until their 1-hour expiry.

### Overly Permissive Storage Policies to Remove

These policies allow unauthenticated public reads and are redundant once buckets are private:

- `"Public can read car images"` on `storage.objects`
- `"Allow public to view photos"` on `storage.objects`

Other policies (authenticated user access, car owner access, dealer access) remain unchanged.

