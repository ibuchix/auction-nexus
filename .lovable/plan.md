

## Plan: Display Seller Preferred Price with Top Bids

### Overview
Add the seller's preferred/acceptable price to the `CurrentBidDisplay` component so admins can easily compare incoming bids against what the seller expects to receive.

---

### Current State

The `CurrentBidDisplay` component (in `src/components/admin/auction-card/CurrentBidDisplay.tsx`) shows the top 3 bids for active auctions in an expandable accordion. It currently receives:
- `carId` - for fetching bids
- `currentBid` - the highest bid amount
- `isActive` - whether the auction is active

---

### Proposed Design

```text
┌─────────────────────────────────────────────────────────┐
│  [Accordion Header: Top Bids (3)]            [●]       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Seller's Preferred Price           95 000 zł   │   │
│  │  (muted text, subtle background)               │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  [1st]                              92 000 zł   │   │  ← Compare: below preferred
│  │         by ABC Dealership                       │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  [2nd]                              88 500 zł   │   │
│  │         by XYZ Motors                           │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  [3rd]                              85 000 zł   │   │
│  │         by Quick Cars                           │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Visual Comparison Indicator:**
- If highest bid ≥ seller's preferred price: Show green check/highlight
- If highest bid < seller's preferred price: Show amber/warning indicator with the gap amount

---

### Changes Required

#### File 1: `src/components/admin/auction-card/CurrentBidDisplay.tsx`

**Updates:**
1. Add `sellerAcceptablePrice` to the component props
2. Display the seller's preferred price in a distinct row above the bid list
3. Add a visual comparison indicator to help admins quickly see if bids are meeting seller expectations
4. Show the difference/gap between top bid and seller price when relevant

```typescript
interface CurrentBidDisplayProps {
  carId: string;
  currentBid: number | null | undefined;
  isActive?: boolean;
  sellerAcceptablePrice?: number | null;  // NEW PROP
}
```

**New UI element (inside AccordionContent, before the bids list):**
- A highlighted row showing "Seller's Preferred Price: XX zł"
- Visual indicator showing if top bid meets/exceeds this price

---

#### File 2: `src/components/admin/AdminAuctionCard.tsx`

**Updates:**
Pass the `sellerAcceptablePrice` to the `CurrentBidDisplay` component:

```typescript
<CurrentBidDisplay 
  carId={auction.id}
  currentBid={auction.currentBid ?? auction.current_bid}
  isActive={...}
  sellerAcceptablePrice={auction.sellerAcceptablePrice}  // NEW PROP
/>
```

---

### Visual Design Details

| Element | Style |
|---------|-------|
| Seller Price Row | Blue-tinted background (`bg-blue-50`), blue border, positioned at top of accordion content |
| Price Label | "Seller's Preferred Price" in muted text |
| Price Value | Bold, blue color for distinction from bids |
| Met Indicator | Green checkmark if top bid ≥ preferred price |
| Gap Indicator | Amber text showing "X zł below" if not met |

---

### Summary of Changes

| File | Change |
|------|--------|
| `src/components/admin/auction-card/CurrentBidDisplay.tsx` | Add `sellerAcceptablePrice` prop, display seller price with comparison indicator |
| `src/components/admin/AdminAuctionCard.tsx` | Pass `auction.sellerAcceptablePrice` to `CurrentBidDisplay` |

This is a 2-file change that will give admins immediate visibility into how bids compare against seller expectations.

