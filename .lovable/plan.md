

## Add Metrics Card and Placeholder Page

### What's changing

1. **New "Metrics" card** on the dashboard grid, placed after Dealer Verification
2. **New placeholder page** at `/admin/metrics` with a basic layout ready to be filled in later
3. **New route** registered in SystemRoutes

### Files to create

| File | Purpose |
|------|---------|
| `src/pages/admin/Metrics.tsx` | Placeholder metrics page with title, subtitle, and empty state message |

### Files to modify

| File | Change |
|------|--------|
| `src/components/dashboard/AdminCardGrid.tsx` | Add Metrics card entry with `BarChart3` icon after Dealer Verification |
| `src/components/routes/SystemRoutes.tsx` | Add `/admin/metrics` route pointing to the new page |

### Technical detail

**AdminCardGrid.tsx** -- add to `adminCards` array and import `BarChart3` icon:
```typescript
{
  title: "Metrics",
  description: "View platform metrics and performance data",
  icon: BarChart3,
  path: "/admin/metrics",
  iconColor: "text-blue-500"
}
```

**Metrics.tsx** -- simple placeholder page following existing page patterns (card with icon, title, description, and "Coming soon" message).

**SystemRoutes.tsx** -- add the route wrapped in `AdminProtectedRoute`.
