import { useEffect, useRef, useState, useCallback } from "react";

interface UseInfiniteScrollOptions {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number;
  minLoadInterval?: number; // Minimum ms between loads
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
  minLoadInterval = 3000, // Default 3 seconds between loads
}: UseInfiniteScrollOptions) {
  const observerTarget = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastLoadTimeRef = useRef<number>(0);
  const lastScrollYRef = useRef<number>(0);

  const debouncedLoadTrigger = useCallback(() => {
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }
    
    // Check if enough time has passed since last load
    const timeSinceLastLoad = Date.now() - lastLoadTimeRef.current;
    const isScrollingUp = window.scrollY < lastScrollYRef.current;
    lastScrollYRef.current = window.scrollY;
    
    // Don't trigger if scrolling up or too soon after last load
    if (isScrollingUp || timeSinceLastLoad < minLoadInterval) {
      console.log('[Infinite Scroll] Blocked: scrolling up or too soon', { 
        isScrollingUp, 
        timeSinceLastLoad 
      });
      return;
    }
    
    loadTimeoutRef.current = setTimeout(() => {
      if (hasMore && !isLoading) {
        console.log('[Infinite Scroll] Triggering load');
        lastLoadTimeRef.current = Date.now();
        setShouldLoad(true);
      }
    }, 1500); // Increased debounce to 1.5 seconds
  }, [hasMore, isLoading, minLoadInterval]);

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
        rootMargin: "50px", // Trigger only 50px before reaching trigger element
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
