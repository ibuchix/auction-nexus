import { useEffect, useRef, useState } from "react";

interface UseInfiniteScrollOptions {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number;
}

/**
 * Hook for infinite scroll functionality
 * Uses Intersection Observer to detect when to load more items
 */
export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  threshold = 0.8,
}: UseInfiniteScrollOptions) {
  const observerTarget = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMore && !isLoading) {
          setShouldLoad(true);
        }
      },
      {
        threshold,
        rootMargin: "200px",
      }
    );

    observer.observe(target);

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [hasMore, isLoading, threshold]);

  useEffect(() => {
    if (shouldLoad && hasMore && !isLoading) {
      onLoadMore();
      setShouldLoad(false);
    }
  }, [shouldLoad, hasMore, isLoading, onLoadMore]);

  return { observerTarget };
}
