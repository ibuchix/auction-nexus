import { Loader2 } from "lucide-react";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

interface InfiniteScrollTriggerProps {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  totalCount: number;
  loadedCount: number;
}

export function InfiniteScrollTrigger({
  onLoadMore,
  hasMore,
  isLoading,
  totalCount,
  loadedCount,
}: InfiniteScrollTriggerProps) {
  const { observerTarget } = useInfiniteScroll({
    onLoadMore,
    hasMore,
    isLoading,
    threshold: 0.1, // Trigger only when 90% scrolled (near bottom)
  });

  if (!hasMore && loadedCount > 0) {
    return (
      <div className="text-center py-8 text-muted-foreground border-t border-border">
        <p className="text-sm font-medium">
          ✓ Showing all {totalCount} auctions
        </p>
        <p className="text-xs mt-1 opacity-70">
          You've reached the end of the list
        </p>
      </div>
    );
  }

  return (
    <div ref={observerTarget} className="py-8">
      {isLoading && hasMore && (
        <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <div className="text-center">
            <span className="text-sm font-medium">Loading more auctions...</span>
            <p className="text-xs mt-1 opacity-70">
              Showing {loadedCount} of {totalCount} total
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
