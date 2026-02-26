

## Dashboard Cleanup and Bug Fixes

### Problem Summary
There are 4 issues to address:

1. **Announcements card/route** - needs to be removed entirely (not used)
2. **Dispute Resolution card/route** - needs to be removed (obsolete)
3. **Active Auctions shows 566 instead of 126** - the dashboard query counts ALL cars with `auction_status=active` without filtering by `auction_end_time`, so it includes stale/ended auctions that haven't been cleaned up
4. **Crash when navigating back to dashboard** - the dashboard's `useDashboardData` hook uses query key `['activeAuctions']` which collides with `useAuctionMonitoring` hook (same key). The monitoring page caches an array of full car objects under that key. When the dashboard reads the cache, it gets an array of objects instead of a number, and React crashes trying to render an object as a child

### Plan

**1. Fix the query key collision and active auction count** (`src/hooks/useDashboardData.tsx`)
- Rename the query key from `['activeAuctions']` to `['activeAuctionsCount']` to avoid collision with the monitoring hook
- Add a filter `.gt('auction_end_time', new Date().toISOString())` to only count auctions that haven't ended yet -- matching the monitoring page logic

**2. Remove Announcements from everywhere**
- `src/components/dashboard/AdminCardGrid.tsx` -- remove Announcements card entry and `Megaphone` import
- `src/components/admin/dashboard/AdminCardGrid.tsx` -- remove Announcements card entry and `Megaphone` import
- `src/constants/sidebarMenuItems.ts` -- remove the "Communications" menu item
- `src/components/routes/SystemRoutes.tsx` -- remove Announcements route and import
- `src/pages/admin/Announcements.tsx` -- delete the file
- `src/components/admin/announcements/AnnouncementForm.tsx` -- delete the file
- `src/components/admin/announcements/AnnouncementList.tsx` -- delete the file

**3. Remove Dispute Resolution from everywhere**
- `src/components/dashboard/AdminCardGrid.tsx` -- remove Dispute Resolution card entry
- `src/components/admin/dashboard/AdminCardGrid.tsx` -- remove Dispute Resolution card entry and `MessageSquare` import
- `src/constants/sidebarMenuItems.ts` -- remove "Disputes" from Risk Management submenu
- `src/components/routes/RiskManagementRoutes.tsx` -- remove DisputeResolution route and import
- `src/pages/admin/DisputeResolution.tsx` -- delete the file
- `src/components/admin/disputes/` -- delete the entire disputes folder (DisputeList, DisputeStats, DisputeFilters, DisputeDetailDialog, DisputeResolutionForm, DisputeComments, and all sub-components)
- `src/types/disputes.ts` -- delete the file
- `src/components/DashboardLayout.tsx` -- remove the keyboard shortcut `Alt+D` that navigates to disputes

### Technical Details

**Query key fix** (the critical bug):
```
// Before (collides with useAuctionMonitoring)
queryKey: ['activeAuctions']

// After (unique key)
queryKey: ['activeAuctionsCount']
```

**Active auction count fix**:
```
// Before (counts stale auctions too)
.eq('is_auction', true)
.eq('auction_status', 'active')

// After (only truly active auctions)
.eq('is_auction', true)
.eq('auction_status', 'active')
.gt('auction_end_time', new Date().toISOString())
```

### Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useDashboardData.tsx` | Fix query key collision and add end_time filter |
| `src/components/dashboard/AdminCardGrid.tsx` | Remove Announcements and Dispute Resolution cards |
| `src/components/admin/dashboard/AdminCardGrid.tsx` | Remove Announcements and Dispute Resolution cards |
| `src/constants/sidebarMenuItems.ts` | Remove Communications and Disputes menu items |
| `src/components/routes/SystemRoutes.tsx` | Remove Announcements route |
| `src/components/routes/RiskManagementRoutes.tsx` | Remove DisputeResolution route |
| `src/components/DashboardLayout.tsx` | Remove Alt+D shortcut for disputes |

### Files to Delete

| File | Reason |
|------|--------|
| `src/pages/admin/Announcements.tsx` | Feature removed |
| `src/components/admin/announcements/AnnouncementForm.tsx` | Feature removed |
| `src/components/admin/announcements/AnnouncementList.tsx` | Feature removed |
| `src/pages/admin/DisputeResolution.tsx` | Feature removed |
| `src/components/admin/disputes/*` (all files) | Feature removed |
| `src/types/disputes.ts` | Feature removed |

