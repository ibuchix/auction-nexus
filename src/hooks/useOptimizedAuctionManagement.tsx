import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Auction, AuctionStatus } from "@/types/auction";
import { useToast } from "@/hooks/use-toast";
import { useAuctionOperations } from "@/hooks/useAuctionOperations";
import { supabase } from "@/integrations/supabase/client";
import { objectToCamelCase } from "@/utils/caseConverter";

type TabType = 'ready' | 'active' | 'ended' | 'notConfigured';

interface TabState {
  loadedItems: number;
  totalCount: number;
  hasMore: boolean;
  isLoadingMore: boolean;
}

export function useOptimizedAuctionManagement() {
  const [currentTab, setCurrentTab] = useState<TabType>('ready');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [pageSize, setPageSize] = useState(30);
  const [autoLoadEnabled, setAutoLoadEnabled] = useState(true);
  
  // Per-tab state management
  const [tabStates, setTabStates] = useState<Record<TabType, TabState>>({
    ready: { loadedItems: 30, totalCount: 0, hasMore: true, isLoadingMore: false },
    active: { loadedItems: 30, totalCount: 0, hasMore: true, isLoadingMore: false },
    ended: { loadedItems: 30, totalCount: 0, hasMore: true, isLoadingMore: false },
    notConfigured: { loadedItems: 30, totalCount: 0, hasMore: true, isLoadingMore: false },
  });

  const { pauseAuction, cancelAuction, startAuction } = useAuctionOperations();
  const { toast } = useToast();
  const errorCountRef = useRef(0);
  
  // Get current tab state
  const currentState = tabStates[currentTab];

  // Build tab-specific query with database-level filtering
  const buildTabQuery = useCallback(async (tab: TabType, limit: number) => {
    // Tab-specific filters with appropriate joins
    switch (tab) {
      case 'ready': {
        // Step 1: Get car IDs that have active or scheduled auctions (to exclude them)
        const { data: activeSchedules } = await supabase
          .from('auction_schedules')
          .select('car_id')
          .in('status', ['active', 'scheduled']);
        
        const excludeCarIds = activeSchedules?.map(s => s.car_id) || [];
        
        // Step 2: Query cars with reserve_price > 0, excluding active/scheduled ones
        let query = supabase
          .from('cars')
          .select(`
            *,
            auction_schedules (
              id,
              status,
              start_time,
              end_time,
              created_at,
              notes
            )
          `, { count: 'exact' })
          .gt('reserve_price', 0);

        // Exclude cars with active/scheduled auctions
        if (excludeCarIds.length > 0) {
          query = query.not('id', 'in', `(${excludeCarIds.join(',')})`);
        }

        if (searchTerm) {
          query = query.or(
            `title.ilike.%${searchTerm}%,make.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%,vin.ilike.%${searchTerm}%`
          );
        }

        return query
          .order('created_at', { ascending: false })
          .range(0, limit - 1);
      }
      
      case 'active': {
        // Use INNER JOIN to only get cars WITH active/scheduled schedules
        let query = supabase
          .from('cars')
          .select(`
            *,
            auction_schedules!inner (
              id,
              status,
              start_time,
              end_time,
              created_at,
              notes
            )
          `, { count: 'exact' })
          .gt('reserve_price', 0)
          .in('auction_schedules.status', ['active', 'scheduled']);

        if (searchTerm) {
          query = query.or(
            `title.ilike.%${searchTerm}%,make.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%,vin.ilike.%${searchTerm}%`
          );
        }

        return query
          .order('created_at', { ascending: false })
          .range(0, limit - 1);
      }
      
      case 'ended': {
        // Use INNER JOIN to only get cars WITH ended schedules in last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        let query = supabase
          .from('cars')
          .select(`
            *,
            auction_schedules!inner (
              id,
              status,
              start_time,
              end_time,
              created_at,
              notes
            )
          `, { count: 'exact' })
          .gt('reserve_price', 0)
          .in('auction_schedules.status', ['completed', 'cancelled'])
          .gte('auction_schedules.end_time', sevenDaysAgo.toISOString());

        if (searchTerm) {
          query = query.or(
            `title.ilike.%${searchTerm}%,make.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%,vin.ilike.%${searchTerm}%`
          );
        }

        return query
          .order('created_at', { ascending: false })
          .range(0, limit - 1);
      }
      
      case 'notConfigured': {
        // No join needed for not configured cars
        let query = supabase
          .from('cars')
          .select(`*`, { count: 'exact' })
          .or('reserve_price.is.null,reserve_price.eq.0');

        if (searchTerm) {
          query = query.or(
            `title.ilike.%${searchTerm}%,make.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%,vin.ilike.%${searchTerm}%`
          );
        }

        return query
          .order('created_at', { ascending: false })
          .range(0, limit - 1);
      }
      
      default:
        throw new Error(`Unknown tab: ${tab}`);
    }
  }, [searchTerm]);

  // No client-side filtering needed anymore - all filtering done at DB level
  const filterByTabLogic = useCallback((data: any[], tab: TabType): any[] => {
    return data;
  }, []);

  // Query for current tab
  const { data: listings = [], isLoading, error, refetch } = useQuery({
    queryKey: ['optimizedAuctionManagement', currentTab, searchTerm, currentState.loadedItems],
    queryFn: async () => {
      try {
        const query = await buildTabQuery(currentTab, currentState.loadedItems);
        const { data, error, count } = await query;
        
        if (error) {
          console.error('❌ [OptimizedAuctionMgmt] Database error:', error);
          throw error;
        }
        
        errorCountRef.current = 0;
        
        // Transform data
        const transformedData = (data || []).map(item => objectToCamelCase(item) as Auction);
        
        // Apply tab-specific filtering (no longer needed, but keeping for consistency)
        const filteredData = filterByTabLogic(transformedData, currentTab);
        
        // Use DB count directly for all tabs now
        const actualCount = count || 0;
        
        // Update tab state
        setTabStates(prev => ({
          ...prev,
          [currentTab]: {
            ...prev[currentTab],
            totalCount: actualCount,
            hasMore: currentState.loadedItems < actualCount,
            isLoadingMore: false,
          }
        }));
        
        return filteredData;
      } catch (err) {
        console.error('💥 [OptimizedAuctionMgmt] Exception:', err);
        errorCountRef.current++;
        if (errorCountRef.current >= 2) {
          toast({
            title: "Error",
            description: "Failed to load auction listings",
            variant: "destructive",
          });
        }
        return [];
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 30000,
  });

  // Realtime subscription for auction status changes
  useEffect(() => {
    console.log('[OptimizedAuctionMgmt] Setting up realtime subscription');
    
    const channel = supabase
      .channel('auction-lifecycle-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'auction_schedules',
        },
        (payload) => {
          console.log('[OptimizedAuctionMgmt] Auction schedule changed:', payload);
          // Refetch current tab when schedules change
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'cars',
          filter: 'is_auction=eq.true',
        },
        (payload) => {
          console.log('[OptimizedAuctionMgmt] Car auction status changed:', payload);
          // Refetch current tab when car status changes
          refetch();
        }
      )
      .subscribe();

    return () => {
      console.log('[OptimizedAuctionMgmt] Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [currentTab, refetch]);

  // Load more for current tab
  const loadMore = useCallback(() => {
    if (currentState.isLoadingMore || !currentState.hasMore || !autoLoadEnabled) {
      return;
    }
    
    setTabStates(prev => ({
      ...prev,
      [currentTab]: {
        ...prev[currentTab],
        loadedItems: prev[currentTab].loadedItems + pageSize,
        isLoadingMore: true,
      }
    }));
  }, [currentTab, currentState, autoLoadEnabled, pageSize]);

  // Manual load more with scroll preservation
  const loadMoreManual = useCallback(() => {
    if (currentState.isLoadingMore || !currentState.hasMore) {
      return;
    }
    
    // Save current scroll position
    const scrollY = window.scrollY;
    sessionStorage.setItem('auction-scroll-position', scrollY.toString());
    
    setTabStates(prev => ({
      ...prev,
      [currentTab]: {
        ...prev[currentTab],
        loadedItems: prev[currentTab].loadedItems + pageSize,
        isLoadingMore: true,
      }
    }));
  }, [currentTab, currentState, pageSize]);

  // Load all for current tab
  const loadAll = useCallback(() => {
    if (currentState.isLoadingMore) {
      return;
    }
    
    setTabStates(prev => ({
      ...prev,
      [currentTab]: {
        ...prev[currentTab],
        loadedItems: prev[currentTab].totalCount,
        isLoadingMore: true,
      }
    }));
  }, [currentTab, currentState]);

  // Restore scroll position after loading more items
  useEffect(() => {
    if (!currentState.isLoadingMore) {
      const savedPosition = sessionStorage.getItem('auction-scroll-position');
      if (savedPosition) {
        setTimeout(() => {
          window.scrollTo({
            top: parseInt(savedPosition, 10),
            behavior: 'smooth'
          });
          sessionStorage.removeItem('auction-scroll-position');
        }, 150);
      }
    }
  }, [currentState.isLoadingMore]);

  // Reset tab state when search changes
  useEffect(() => {
    setTabStates(prev => ({
      ...prev,
      [currentTab]: {
        ...prev[currentTab],
        loadedItems: pageSize,
        hasMore: true,
      }
    }));
  }, [searchTerm, pageSize]);

  // Handle tab change
  const handleTabChange = useCallback((tab: TabType) => {
    setCurrentTab(tab);
  }, []);

  const handleScheduleClick = (auction: Auction) => {
    setSelectedAuction(auction);
    setIsScheduleDialogOpen(true);
  };

  const handleScheduleClose = () => {
    setIsScheduleDialogOpen(false);
    setSelectedAuction(null);
  };

  const handleScheduleSuccess = () => {
    refetch();
  };

  return {
    // Current tab data
    currentTab,
    setCurrentTab: handleTabChange,
    listings,
    isLoading,
    error,
    refetch,
    
    // Search
    searchTerm,
    setSearchTerm,
    
    // Current tab state
    totalCount: currentState.totalCount,
    hasMore: currentState.hasMore,
    loadedItems: currentState.loadedItems,
    isLoadingMore: currentState.isLoadingMore,
    
    // Controls
    loadMore,
    loadMoreManual,
    loadAll,
    pageSize,
    setPageSize,
    autoLoadEnabled,
    setAutoLoadEnabled,
    
    // Auction operations
    selectedAuction,
    isScheduleDialogOpen,
    pauseAuction,
    cancelAuction,
    startAuction,
    handleScheduleClick,
    handleScheduleClose,
    handleScheduleSuccess,
    
    // All tab states (for badges)
    tabStates,
  };
}
