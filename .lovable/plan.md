# Add "Bezwypadkowy" and "Salon PL" Badges to Listings

## Goal
Let admins toggle two visual badges — **Bezwypadkowy** (accident-free) and **Salon PL** (Polish showroom origin) — on any car listing from the admin auction management edit dialog. When enabled, the badges appear on the dealer-facing auction card and the vehicle details page.

## Approach
Reuse the existing data fields (`is_accident_record_poland`, `is_accident_record_abroad`, `is_polish_origin`) as the source of truth, but expose **dedicated, prominent admin toggles** in a new "Badges" tab so the admin doesn't have to hunt through the Vehicle History section.

The toggles map to the underlying fields like this:
- **Bezwypadkowy ON** → sets both `is_accident_record_poland = false` and `is_accident_record_abroad = false`
- **Salon PL ON** → sets `is_polish_origin = true`
- Toggling OFF reverts the relevant field(s) to `null` (unknown), so we don't accidentally assert the opposite.

This keeps a single source of truth (no schema changes) while giving the admin one-click control.

## Changes

### 1. New "Badges" tab in admin edit dialog
**File:** `src/components/admin/car-edit/tabs/BadgesTab.tsx` (new)
- Two large `Switch` controls with clear labels and short descriptions:
  - "Bezwypadkowy — Display the accident-free badge on the listing"
  - "Salon PL — Display the Polish showroom badge on the listing"
- Each switch reads its derived state from `formData` and writes back to the underlying fields via `updateField`.
- Show a small note explaining that toggling ON also updates the related vehicle history fields.

**File:** `src/components/admin/car-edit/AdminCarEditDialog.tsx`
- Add a 6th tab `<TabsTrigger value="badges">Badges</TabsTrigger>` and matching `<TabsContent>`.
- Update `grid-cols-5` → `grid-cols-6`.

### 2. Shared badge display component
**File:** `src/components/listing/ListingBadges.tsx` (new)
- Small component that takes a car/auction object and renders the applicable badges.
- Logic:
  - Show **Bezwypadkowy** when `is_accident_record_poland === false && is_accident_record_abroad === false` (both explicitly false, not null).
  - Show **Salon PL** when `is_polish_origin === true`.
- Styled with the existing `Badge` component using distinct colors (e.g., green for Bezwypadkowy, blue for Salon PL) to differentiate from the red Damaged badge.

### 3. Show badges on the auction card
**File:** `src/components/admin/auction-card/AuctionHeader.tsx`
- Render `<ListingBadges />` next to the existing Damaged badge.
- Accept the new fields via props (or extend the existing auction prop).

**File:** `src/components/admin/AdminAuctionCard.tsx` (and/or parent that passes data)
- Pass `is_accident_record_poland`, `is_accident_record_abroad`, `is_polish_origin` through to `AuctionHeader`.

### 4. Show badges on the vehicle details page
**File:** `src/components/admin/car-details/AdminCarDetailsDialog.tsx`
- Render `<ListingBadges />` near the title/header area alongside any existing badges.

### 5. Form data wiring
**File:** `src/components/admin/car-edit/hooks/useCarEdit.tsx`
- The three fields (`is_accident_record_poland`, `is_accident_record_abroad`, `is_polish_origin`) are already part of the schema and form — no changes needed beyond confirming they're in `formData` and saved.

## What does NOT change
- No database migration (reusing existing nullable boolean columns).
- No edge function changes.
- Dealer-facing browse pages outside the auction card scope are unchanged.
- The existing Vehicle History & Records section in the Vehicle Details tab remains as-is for granular editing; the new Badges tab is just a friendlier shortcut for the most common toggles.

## Acceptance criteria
- In `/admin/auctions/manage`, opening Edit on any listing shows a new **Badges** tab with two toggles.
- Toggling Bezwypadkowy ON and saving makes a green "Bezwypadkowy" badge appear on that auction card.
- Toggling Salon PL ON and saving makes a blue "Salon PL" badge appear on that auction card.
- Both badges also appear on the vehicle details dialog.
- Toggling OFF removes the badge.
- The two Polish words `Bezwypadkowy` and `Salon PL` are the only Polish strings introduced; everything else (tab label, descriptions, helper text) stays in English.
