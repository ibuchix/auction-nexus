

# Fix Per-Link Attribution Numbers

## What the Data Shows

| | Per-Link Total | Aggregate Total | Gap |
|---|---|---|---|
| Valuations | 173 (167 FB + 6 IG) | 322 | 149 organic |
| Registrations | 13 (12 FB + 1 IG) | 24 | 12 organic (no link_id) |
| Listings | 1 (FB) | 7 | 6 organic (no link_id) |

The aggregate stats card sums ALL events (including organic). The per-link table only counts events where `link_id` matches the specific link. The problem: when users switch from in-app browser to Safari, their registration/listing events fire without a `link_id`, so they show up in aggregate but not attributed to any link.

## Root Cause

The server-side trigger we deployed this morning works correctly, but it depends on `profiles.tracking_ref` being set — and **zero profiles have tracking_ref populated** because the seller app hasn't been updated yet to save the ref code on registration.

Meanwhile, the client-side events for registrations and listings fire with `link_id = NULL` because the localStorage `visitor_id` doesn't match across browser switches.

## Two-Part Fix

### Part 1: Retroactive backfill migration

Use IP hash matching to retroactively set `link_id` on unlinked registration and listing events. The query already confirmed 2 of 6 unlinked listings match Facebook via IP hash. We'll also try user_id-based matching (if a user's click event has a link_id, attribute their later events to the same link).

```sql
-- Backfill link_id on unlinked events using user_id from linked events
UPDATE tracking_events te
SET link_id = matched.link_id
FROM (
  SELECT DISTINCT ON (unlinked.id) unlinked.id, linked.link_id
  FROM tracking_events unlinked
  JOIN tracking_events linked 
    ON linked.user_id = unlinked.user_id 
    AND linked.link_id IS NOT NULL
  WHERE unlinked.link_id IS NULL
    AND unlinked.event_type IN ('listing_submitted', 'registration', 'valuation_started', 'valuation_completed')
    AND unlinked.user_id IS NOT NULL
) matched
WHERE te.id = matched.id;

-- Also try IP hash matching for events without user_id match
UPDATE tracking_events te
SET link_id = matched.link_id
FROM (
  SELECT DISTINCT ON (unlinked.id) unlinked.id, linked.link_id
  FROM tracking_events unlinked
  JOIN tracking_events linked 
    ON linked.ip_hash = unlinked.ip_hash 
    AND linked.link_id IS NOT NULL
    AND linked.event_type = 'link_click'
  WHERE unlinked.link_id IS NULL
    AND unlinked.event_type IN ('listing_submitted', 'registration')
    AND unlinked.ip_hash IS NOT NULL
) matched
WHERE te.id = matched.id AND te.link_id IS NULL;
```

### Part 2: Update `get_tracking_funnel_stats` for ongoing smart attribution

Modify the RPC function so that even if an event has `link_id = NULL`, it checks if the same `user_id` has a prior linked click and attributes accordingly. This way future events won't need manual backfills.

### What this achieves

- The per-link table for Facebook and Instagram will immediately show corrected numbers after the backfill
- Going forward, the funnel function will auto-attribute unlinked events to their original tracking link
- No seller app changes needed for this fix (those are still needed for the `tracking_ref` trigger path)

### Files changed

1. New SQL migration: retroactive backfill + updated `get_tracking_funnel_stats` function

