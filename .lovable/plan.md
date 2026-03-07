

# Diagnosis: Campaign Tracking Data Not Showing

## What I Found

### 1. The `tracking_links` table is completely empty
The link you created via the admin UI **did not persist** in the database. The table has zero rows. This is the root cause of everything else failing.

### 2. Events exist but are unlinked
The edge function logged 4 events successfully (1 link_click, 1 valuation_started, 1 valuation_completed, and an earlier test click). However, all have `link_id = NULL` because the edge function tried to look up code `in-test-0o0t` in `tracking_links` and found nothing.

### 3. Funnel stats return empty
The `get_tracking_funnel_stats` RPC joins `tracking_links` with `tracking_events` on `link_id`. Since no links exist, it returns nothing — even though events exist.

### 4. Seller app hooks are correctly integrated
I verified the seller app ([auto-strada001testing](/projects/2e214cd6-929f-4573-bcb7-4fa30f9779b0)). The `useTrackingCapture` hook is called in `App.tsx`, and `useTrackEvent` is integrated at the valuation form, auth page, and listing form. The implementation looks correct.

## Why Link Creation Failed

The RLS policy on `tracking_links` uses `has_role(auth.uid(), 'admin')` which is correct and works for your admin user. The most likely cause is that the Supabase client's `insert` call failed silently — possibly because `tracking_links` is not in the TypeScript types file (`src/integrations/supabase/types.ts`), causing the Supabase client to reject the query or the response typing to swallow the error.

## Fix Plan

### Fix 1: Update Supabase TypeScript types
The `types.ts` file needs to include `tracking_links`, `tracking_events`, and `tracking_conversions` table definitions so the Supabase JS client can properly interact with them. Currently, the Supabase client likely treats these as unknown tables.

### Fix 2: Update the funnel stats query to also show unlinked events
Currently, events without a `link_id` (organic or from failed link lookups) are invisible. Add an "Organic / Unlinked" row to the funnel stats so you can see all activity regardless of attribution.

### Fix 3: Backfill existing events
Once the link is successfully created, update the 3 existing events that have code `in-test-0o0t` in their `page_url` to link them to the correct `link_id`. This is a one-time data fix via SQL.

## Files to Change

| File | Change |
|------|--------|
| `src/integrations/supabase/types.ts` | Add type definitions for `tracking_links`, `tracking_events`, `tracking_conversions` tables and the `get_tracking_funnel_stats` + `increment_click_count` functions |
| `src/hooks/useTrackingData.ts` | Add error logging to surface silent failures; ensure insert payloads match expected types |
| Migration SQL | Update `get_tracking_funnel_stats` to include an "Organic" row for events with `link_id IS NULL` |

