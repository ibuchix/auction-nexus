

# Fix: Flexible Destination Paths + Accurate Seller Flow Tracking

## Understanding

The seller flow is:
1. Seller clicks ad link → lands on **homepage** (`https://www.autaro.pl/`) or any other page
2. Uses VIN to do a **valuation check** on the homepage
3. If happy, clicks to **list their car**
4. If not logged in → redirected to **auth page** (`/auth`) to register or login
5. After auth → completes **listing form**

The tracking must persist across all these page transitions (homepage → valuation → auth → listing) and attribute everything back to the original link, regardless of which page was the landing page.

## Current State

The `CreateLinkDialog` already has a free-text `destinationPath` field (defaulting to `/sell`). This already supports any path. The issues are:

1. **Default path is wrong** — should be `/` (homepage) not `/sell`, since the primary flow starts at the homepage
2. **Better UX needed** — instead of a free-text input, provide a dropdown of common destinations so admins don't have to guess paths
3. **Base URL is wrong** — currently uses `window.location.origin` (admin app) instead of `https://www.autaro.pl`

## Changes

### 1. `CreateLinkDialog.tsx`
- Replace the free-text destination path input with a **Select dropdown** of predefined destinations:
  - `/` — "Homepage (Valuation Check)"
  - `/auth` — "Registration / Login"  
  - `/sell` — "Sell Your Car"
- Default selection: `/` (homepage)
- Keep an "Other" option that reveals a custom text input for flexibility

### 2. `CampaignTrackingTab.tsx`
- Replace `window.location.origin` with a constant `SELLER_APP_BASE_URL = "https://www.autaro.pl"`
- This ensures all generated and displayed URLs point to the seller app, not the admin app

### 3. `TrackingLinkTable.tsx`
- Same base URL fix — use `SELLER_APP_BASE_URL` instead of `baseUrl` prop (or pass the correct one)

### 4. Seller-side tracking note
The `?ref=CODE` parameter is captured by the seller app on whatever page the seller lands on. The tracking hooks in the seller app store the code in `localStorage` and carry it through the entire flow (homepage → valuation → auth → listing). The edge function (`track-event`) is page-agnostic — it records event types, not pages. So whether the seller lands on `/` or `/auth`, the attribution chain is maintained across all subsequent steps.

No database or edge function changes needed — the current schema's `destination_path` column already stores any path string.

