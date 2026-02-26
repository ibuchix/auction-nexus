

## Dashboard Card Removal + Calendar Fix

### 1. Remove 5 cards from the dashboard grid

**File: `src/components/dashboard/AdminCardGrid.tsx`**

Remove these cards from the `adminCards` array:
- Auction Scheduling
- Proxy Bid Management
- Purchase Records
- Audit Logs
- Fraud Detection

Clean up unused icon imports: `ShieldCheck`, `CalendarClock`, `History`, `Wallet`, `CircleDollarSign`

This leaves 5 cards: Auction Monitoring, Analytics, User Management, Compliance, Dealer Verification.

### 2. Fix broken calendars across the app

**File: `src/components/ui/calendar.tsx`**

The Calendar component is missing `pointer-events-auto` in its className. When calendars render inside a Dialog or Popover (like the auction scheduling dialog and the car edit dialog), pointer events get blocked. Adding `pointer-events-auto` to the DayPicker className fixes date selection everywhere in the app.

Change:
```
className={cn("p-3", className)}
```
To:
```
className={cn("p-3 pointer-events-auto", className)}
```

This single fix resolves the broken calendars in both the auction scheduling dialog and the car details editing section.

### Files to Change

| File | Change |
|------|--------|
| `src/components/dashboard/AdminCardGrid.tsx` | Remove 5 cards, clean up imports |
| `src/components/ui/calendar.tsx` | Add `pointer-events-auto` to fix date selection |

