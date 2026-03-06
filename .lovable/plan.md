

# Campaign Link Tracking — Integrated into Metrics Page

## Overview

Extend the existing `/admin/metrics` page with a tabbed layout: the current platform KPIs become the first tab, and a new "Campaign Tracking" tab provides link management, event tracking, and funnel analytics — all in one place.

## Architecture

```text
/admin/metrics
├── Tab: Platform KPIs (existing content, unchanged)
└── Tab: Campaign Tracking (new)
    ├── Stat Cards: Total Clicks, Valuations, Registrations, Listings
    ├── Link Management Table + Create Link Dialog
    ├── Funnel Chart: Clicks → Valuations → Registrations → Listings
    └── Per-link performance table with conversion rates
```

The seller app is a separate project but shares the same Supabase database. The tracking hooks (`useTrackingCapture`, `useTrackEvent`) will be implemented in the seller app separately. This plan covers the **admin side**: database schema, the `track-event` edge function for receiving events, and the admin UI for managing links and viewing analytics.

## Database (1 migration, 3 tables)

### `tracking_links`
Stores each generated tracking link with UTM metadata.
- `id` uuid PK, `code` text unique (short code like `fb-spring25`), `name` text, `platform` text (`facebook`/`tiktok`/`affiliate`/`influencer`/`other`), `utm_source`/`utm_medium`/`utm_campaign`/`utm_content`/`utm_term` (all text nullable), `destination_path` text default `/sell`, `affiliate_name` text nullable, `is_active` boolean default true, `click_count` integer default 0, `created_by` uuid, `created_at`/`updated_at` timestamptz.

### `tracking_events`
Every seller interaction logged by the edge function.
- `id` uuid PK, `link_id` uuid FK nullable, `event_type` text (`link_click`/`valuation_started`/`valuation_completed`/`registration`/`listing_submitted`), `session_id` text, `visitor_id` text, `user_id` uuid nullable, `ip_hash` text nullable, `user_agent` text nullable, `referrer` text nullable, `page_url` text nullable, `metadata` jsonb default `{}`, `created_at` timestamptz.

### `tracking_conversions`
Materialized conversion events for fast analytics queries.
- `id` uuid PK, `link_id` uuid FK, `event_id` uuid FK, `conversion_type` text, `user_id` uuid nullable, `created_at` timestamptz.

### RLS
- All three tables: admin read/write via `has_role(auth.uid(), 'admin')`.
- `tracking_events` INSERT: open (the edge function uses service role, but we allow anonymous inserts for the event logging).
- Indexes on `tracking_events(link_id, event_type)`, `tracking_events(visitor_id)`, `tracking_links(code)`.

### DB Function: `get_tracking_funnel_stats`
A `SECURITY DEFINER` function that returns aggregated funnel data per link (click count, valuation count, registration count, listing count) with optional date range filtering — avoids complex client-side aggregation.

## Edge Function: `track-event`

New function at `supabase/functions/track-event/index.ts`. Config: `verify_jwt = false` (must accept anonymous seller-side visitors).

**Logic:**
1. Accept POST with `{ code, event_type, session_id, visitor_id, user_id?, referrer?, page_url?, metadata? }`
2. Resolve `code` → `link_id` from `tracking_links` (skip if no code / organic)
3. For `link_click`: deduplicate by `visitor_id + link_id` within 1 hour, increment `click_count`
4. Hash IP server-side (`Deno.env` has no client IP, use `request.headers.get('x-forwarded-for')` and SHA-256)
5. Insert into `tracking_events`
6. For conversion types (`valuation_started`, `valuation_completed`, `registration`, `listing_submitted`): also insert into `tracking_conversions`
7. Return `{ success: true }`

Rate limiting: max 10 events per `visitor_id` per minute to prevent abuse.

## Frontend Changes

### `src/pages/admin/Metrics.tsx`
Wrap existing content in a `Tabs` component with two tabs:
- **Platform KPIs** — current 8 stat cards + 2 charts (no changes)
- **Campaign Tracking** — new component `CampaignTrackingTab`

### New Components (in `src/components/admin/campaign-tracking/`)

1. **`CampaignTrackingTab.tsx`** — Main container with stat cards, link table, funnel chart
2. **`TrackingLinkTable.tsx`** — Table of all tracking links with columns: Name, Platform, Code, Clicks, Conversions, Conv. Rate, Status, Actions (copy URL, toggle active, delete)
3. **`CreateLinkDialog.tsx`** — Dialog form: name, platform (select), UTM fields, destination path, affiliate name. Auto-generates a short code. Shows the full copyable URL after creation.
4. **`TrackingFunnelChart.tsx`** — Horizontal funnel or bar chart showing Clicks → Valuations → Registrations → Listings with drop-off percentages
5. **`TrackingStatsCards.tsx`** — 4 MetricCard-style cards for total clicks, total valuations, total registrations, total listings

### New Hook: `src/hooks/useTrackingData.ts`
- Fetches `tracking_links` with computed conversion counts (via `get_tracking_funnel_stats` RPC)
- CRUD operations for links (create, toggle active, delete)
- Fetches aggregate funnel stats for the stat cards and chart
- Uses `@tanstack/react-query` like all other hooks

### Sidebar Navigation
Change the "Insights" menu item from a direct link to a submenu:
```
Insights
  ├── Platform Metrics  → /admin/metrics
  └── Analytics         → /admin/analytics
```

## File Changes Summary

| File | Action |
|------|--------|
| Migration SQL | Create 3 tables + RLS + indexes + `get_tracking_funnel_stats` function |
| `supabase/functions/track-event/index.ts` | New edge function |
| `supabase/config.toml` | Add `[functions.track-event]` with `verify_jwt = false` |
| `src/pages/admin/Metrics.tsx` | Add Tabs wrapper, import CampaignTrackingTab |
| `src/components/admin/campaign-tracking/CampaignTrackingTab.tsx` | New |
| `src/components/admin/campaign-tracking/TrackingLinkTable.tsx` | New |
| `src/components/admin/campaign-tracking/CreateLinkDialog.tsx` | New |
| `src/components/admin/campaign-tracking/TrackingFunnelChart.tsx` | New |
| `src/components/admin/campaign-tracking/TrackingStatsCards.tsx` | New |
| `src/hooks/useTrackingData.ts` | New |
| `src/constants/sidebarMenuItems.ts` | Change Insights to submenu with Metrics + Analytics |

