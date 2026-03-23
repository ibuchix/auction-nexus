

# Add Date Range Filter to Campaign Tracking

## What's happening now

The `CampaignTrackingTab` calls `useTrackingData()` with no date range, so the `get_tracking_funnel_stats` RPC receives `null` for both `_from` and `_to`, returning **all-time** cumulative data. The hook already supports a `dateRange` parameter — it just isn't being used.

## Changes

### 1. `CampaignTrackingTab.tsx`

- Add `useState` for `dateRange` with preset buttons: **Last 7 days**, **Last 30 days**, **Last 90 days**, **All time**
- Pass `dateRange` to `useTrackingData(dateRange)`
- Render a row of filter buttons + a calendar date picker (using existing `Popover` + `Calendar` components) above the stats cards
- Default selection: **Last 30 days**

### 2. No backend changes needed

The `get_tracking_funnel_stats` RPC already accepts `_from` and `_to` parameters and filters accordingly. The `useTrackingData` hook already passes these through. We just need to wire up the UI.

## UI Layout

```text
[ Last 7d ] [ Last 30d ] [ Last 90d ] [ All time ] [ 📅 Mar 1 - Mar 23 ]

┌─ Stats Cards ─────────────────────────────────┐
│  Clicks  |  Valuations  |  Registrations  |  Listings  │
└───────────────────────────────────────────────┘
```

## Files changed

1. `src/components/admin/campaign-tracking/CampaignTrackingTab.tsx` — add date range state, preset buttons, calendar picker, pass to hook

