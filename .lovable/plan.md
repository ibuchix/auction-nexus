

# Fix Campaign Tracking Attribution Accuracy

## Problem Diagnosis

The tracking system has a fundamental attribution gap caused by reliance on `localStorage` for linking users to their original tracking link. Here is what the data shows:

| Link | Clicks | Valuations | Registrations | Listings |
|------|--------|------------|---------------|----------|
| Instagram | 521 | 2 | 0 | 0 |
| Facebook | 871 | 101 | 12 | 1 (your test) |
| **Actual new listings since promo started** | — | — | — | **~25** |

### Why attribution breaks

1. **In-app browser isolation** (main cause): When someone clicks your link on Instagram or Facebook, it opens in the app's built-in browser. The tracking code stores the `ref` code and `visitor_id` in that browser's localStorage. But when the user later opens Safari/Chrome to register or list a car, that localStorage data is gone. The tracking events fire with no `visitor_id`, so they are silently dropped.

2. **Silent drop on missing visitor_id**: The `useTrackEvent` hook (in the seller app) returns early without firing if no `visitor_id` exists in localStorage — meaning any user who lost their localStorage gets zero tracking for valuations, registrations, and listings.

3. **No server-side attribution**: There is no fallback mechanism to attribute a registration or listing to a tracking link on the server side.

## Proposed Fix (3 parts)

### Part 1: Server-side attribution via `ref` cookie (seller app changes)

Instead of relying solely on localStorage, also persist the `ref` code in the URL state and pass it through the registration flow:

- When a user arrives with `?ref=CODE`, store the code in **both** localStorage (existing) AND as a query parameter that survives through the valuation and registration flow
- On registration, save the `ref` code to a new `tracking_ref` column on the user's profile/metadata so the server can attribute them permanently
- This ensures that even if localStorage is wiped, the `ref` code travels with the user through the URL

### Part 2: Server-side attribution trigger (this project — database)

Create a database trigger or scheduled function that:
- When a new user registers with a `tracking_ref`, retroactively creates a `tracking_conversion` record for `registration`
- When a new car is inserted, checks if the `seller_id` has a `tracking_ref` and creates a `listing_submitted` conversion
- This provides a server-side safety net that doesn't depend on client-side tracking

### Part 3: Resilient client-side tracking (seller app changes)

- Remove the silent early return when `visitor_id` is missing — generate a new one on the fly instead
- On registration success, re-read the `ref` from the URL or from the user's profile metadata and re-establish attribution
- Pass `ref` code through the auth redirect flow so it survives the OAuth/email confirmation round-trip

## Implementation Plan

### In THIS project (admin dashboard database):

1. **New migration**: Add `tracking_ref` column to the `cars` table (nullable text) to store the originating tracking code at listing time
2. **New database function**: `attribute_tracking_conversion` — a server-side function that, given a user_id, looks up their tracking_ref and creates conversion records
3. **New database trigger**: On `cars` INSERT, if the seller has a tracking_ref, automatically insert a `tracking_conversions` record for `listing_submitted`

### In the SELLER APP project (auto-strada001testing):

4. **Update `useTrackingCapture`**: Persist `ref` code in URL state across navigation (not just localStorage)
5. **Update `useTrackEvent`**: Remove silent drop — generate visitor_id on the fly if missing
6. **Update registration flow**: Save `ref` code to user metadata on signup
7. **Update valuation flow**: Read `ref` from URL params as fallback when localStorage is empty

## What this achieves

- Instagram users who click → switch browsers → register → list will be tracked via server-side attribution
- Facebook users who list days after clicking will be attributed via their stored `tracking_ref`
- The dashboard numbers will accurately reflect the ~25 listings that came from your promotions
- No changes to the edge function needed — it's working correctly

## Scope note

Parts 4-7 require changes to the **seller app** project ([auto-strada001testing](/projects/2e214cd6-929f-4573-bcb7-4fa30f9779b0)). We should implement Parts 1-3 here first (database infrastructure), then switch to the seller app to wire up the client-side fixes.

