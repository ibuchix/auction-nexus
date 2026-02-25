

## Client-Side Search Across All Dealers

### Approach

Keep the existing client-side filtering logic but ensure it has access to ALL dealers when searching -- not just the current page. The trick: when the user types a search query, fire a separate query that fetches all dealers (with a large page size) and filter those client-side. When the search is cleared, revert to the normal paginated view.

No edge function or backend changes needed.

### Changes

**File: `src/components/admin/dealer-verification/useDealerVerification.tsx`**

1. Add a second React Query that activates only when `searchQuery` is non-empty (debounced at 300ms). This query calls the same `fetchDealers` but with a large `pageSize` (e.g. 500) and page 1, effectively fetching all dealers for that tab.

2. When the debounced search is active, use the "all dealers" query result and apply the existing client-side filter on it. Hide the pagination controls since we're showing filtered results.

3. When search is cleared, the second query is disabled and the normal paginated query takes over again.

### Technical Detail

```
// New debounced search state
const [debouncedSearch, setDebouncedSearch] = useState("");

useEffect(() => {
  const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
  return () => clearTimeout(timer);
}, [searchQuery]);

// Second query: fetch ALL dealers when searching
const { data: allDealerData, isLoading: isSearchLoading } = useQuery({
  queryKey: ['dealersSearch', activeTab, debouncedSearch],
  queryFn: () => fetchDealers(activeTab, 1, 500),
  enabled: debouncedSearch.trim().length > 0,
  staleTime: 5 * 60 * 1000,
});

// Client-side filter on the full dataset
const searchFilteredDealers = useMemo(() => {
  if (!debouncedSearch.trim()) return null;
  const source = allDealerData?.dealers || [];
  const query = debouncedSearch.toLowerCase().trim();
  return source.filter(dealer =>
    dealer.email?.toLowerCase().includes(query) ||
    dealer.dealershipName?.toLowerCase().includes(query) ||
    dealer.supervisorName?.toLowerCase().includes(query)
  );
}, [allDealerData, debouncedSearch]);

// Use search results when searching, otherwise paginated results
const isSearching = debouncedSearch.trim().length > 0;
const displayDealers = isSearching ? (searchFilteredDealers || []) : filteredDealers;
const displayPagination = isSearching ? null : pagination;
```

The return values change so the page hides pagination during search and shows all matching results.

**File: `src/pages/admin/DealerVerification.tsx`**

- Minor update: only render `DealerPagination` when `pagination` is non-null (already the case with the `&&` check, so this should work automatically).
- Update the loading state to account for `isSearchLoading`.

### Files to Change

| File | Change |
|------|--------|
| `src/components/admin/dealer-verification/useDealerVerification.tsx` | Add second "search all" query with debounce, switch between paginated and full-search results |
| `src/pages/admin/DealerVerification.tsx` | Pass search loading state for better UX feedback |

