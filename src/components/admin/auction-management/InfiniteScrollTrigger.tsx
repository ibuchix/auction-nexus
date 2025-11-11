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
    threshold: 0.8,
  });

  if (!hasMore && loadedCount > 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <p className="text-sm">
          Showing all {totalCount} items
        </p>
      </div>
    );
  }

  return (
    <div ref={observerTarget} className="py-6">
      {isLoading && hasMore && (
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading more auctions...</span>
        </div>
      )}
    </div>
  );
}
