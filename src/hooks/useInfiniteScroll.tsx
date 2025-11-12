import { useEffect, useRef, useState, useCallback } from "react";

interface UseInfiniteScrollOptions {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number;
}

/**
 * Hook for infinite scroll functionality
 * Uses Intersection Observer to detect when to load more items
 * Includes debouncing to prevent rapid triggers during image loading
 */
export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  threshold = 0.5,
}: UseInfiniteScrollOptions) {
  const observerTarget = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedLoadTrigger = useCallback(() => {
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }
    
    loadTimeoutRef.current = setTimeout(() => {
      if (hasMore && !isLoading) {
        setShouldLoad(true);
      }
    }, 500); // Debounce by 500ms to prevent rapid triggers
  }, [hasMore, isLoading]);

  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMore && !isLoading) {
          debouncedLoadTrigger();
        }
      },
      {
        threshold,
        rootMargin: "100px", // Reduced from 200px for more precise triggering
      }
    );

    observer.observe(target);

    return () => {
      if (target) {
        observer.unobserve(target);
      }
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [hasMore, isLoading, threshold, debouncedLoadTrigger]);

  useEffect(() => {
    if (shouldLoad && hasMore && !isLoading) {
      onLoadMore();
      setShouldLoad(false);
    }
  }, [shouldLoad, hasMore, isLoading, onLoadMore]);

  return { observerTarget };
}
