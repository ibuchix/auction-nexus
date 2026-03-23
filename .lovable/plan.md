

# Mobile-Responsive Admin App Overhaul

## Problem

The admin app is unusable on mobile phones. Key issues:

1. **Tables overflow horizontally** — SellerList, DealerVerificationTable, and other tables have 6-9 columns with no horizontal scroll or card-based mobile layout
2. **Auction Management tabs overflow** — 4 tab triggers with badges don't fit on small screens
3. **Page headers overflow** — flex rows with titles + multiple buttons (export, refresh, badges) don't wrap properly
4. **Dashboard grids don't stack** — AdminDashboard has `lg:grid-cols-3` but inner content still overflows
5. **Bottom nav padding missing** — MobileNav bar covers content at the bottom (no `pb-16` on main)
6. **Dialogs too wide** — DealerReviewDialog uses `grid-cols-2` with no mobile fallback
7. **Date/time strings overflow** — AuctionHeader shows 3 date fields in a single `flex` row

## Approach

Rather than rewriting every component, apply targeted fixes to the highest-impact areas using existing Tailwind responsive classes. The `useIsMobile` hook already exists and works; we'll use it where conditional rendering is needed, and use pure CSS (responsive classes + `overflow-x-auto`) everywhere else.

## Changes

### 1. `DashboardLayout.tsx` — Add bottom padding for MobileNav
- Add `pb-20 md:pb-0` to the main content area so the fixed bottom nav doesn't cover content

### 2. `AdminDashboard.tsx` — Fix grid stacking
- Change header from `flex justify-between` to `flex flex-col sm:flex-row` so title and action buttons stack on mobile

### 3. `SellerList.tsx` — Responsive table
- Wrap `<Table>` in `<div className="overflow-x-auto">` to allow horizontal scroll on mobile
- This is the fastest fix that preserves the existing layout on desktop

### 4. `DealerVerificationTable.tsx` — Responsive table
- Same `overflow-x-auto` wrapper

### 5. `DealerVerification.tsx` — Header wrapping
- Change header buttons row from `flex items-center space-x-2` to `flex flex-wrap items-center gap-2`
- Stack title and buttons on mobile with `flex-col sm:flex-row`

### 6. `SellerManagement.tsx` — Header wrapping
- Same `flex-col sm:flex-row` fix for the header area

### 7. `AuctionManagement.tsx` — Scrollable tabs + controls
- Make `TabsList` horizontally scrollable: wrap in `overflow-x-auto`
- Controls card: already uses `flex-wrap`, but add `flex-col sm:flex-row` for the items-per-page row

### 8. `AuctionHeader.tsx` — Date row wrapping
- Change date info from `flex gap-4` to `flex flex-col sm:flex-row gap-1 sm:gap-4`

### 9. `DealerReviewDialog.tsx` — Stack on mobile
- Change `grid-cols-2` to `grid-cols-1 md:grid-cols-2`

### 10. `Metrics.tsx` — Header wrapping
- Add `flex-col sm:flex-row gap-2` to the header row

### 11. `CampaignTrackingTab.tsx` — Calendar popover
- Change `numberOfMonths={2}` to `numberOfMonths={1}` on small screens using `useIsMobile`

## Files Changed

1. `src/components/DashboardLayout.tsx`
2. `src/pages/AdminDashboard.tsx`
3. `src/components/admin/seller-management/SellerList.tsx`
4. `src/components/admin/dealer-verification/DealerVerificationTable.tsx`
5. `src/pages/admin/DealerVerification.tsx`
6. `src/pages/admin/SellerManagement.tsx`
7. `src/pages/admin/AuctionManagement.tsx`
8. `src/components/admin/auction-card/AuctionHeader.tsx`
9. `src/components/admin/dealer-verification/DealerReviewDialog.tsx`
10. `src/pages/admin/Metrics.tsx`
11. `src/components/admin/campaign-tracking/CampaignTrackingTab.tsx`

## Safety

All changes are additive responsive classes or conditional rendering. Desktop layout remains identical. No logic changes.

