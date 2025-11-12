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

  // Build tab-specific query
  const buildTabQuery = useCallback((tab: TabType, limit: number) => {
    // Tab-specific filters with appropriate joins
    switch (tab) {
      case 'ready': {
        // Use LEFT JOIN to include cars with no schedules
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

  // Filter results based on auction_schedules (only needed for 'ready' tab)
  const filterByTabLogic = useCallback((data: any[], tab: TabType): any[] => {
    // Only filter 'ready' tab - all other tabs filtered at DB level
    if (tab !== 'ready') {
      return data;
    }
    
    // For 'ready' tab: exclude cars with active/scheduled schedules
    return data.filter(item => {
      const schedules = item.auctionSchedules || [];
      const hasActiveSchedule = schedules.some((s: any) => 
        s.status === 'active' || s.status === 'scheduled'
      );
      return !hasActiveSchedule && item.reservePrice > 0;
    });
  }, []);

  // Query for current tab
  const { data: listings = [], isLoading, error, refetch } = useQuery({
    queryKey: ['optimizedAuctionManagement', currentTab, searchTerm, currentState.loadedItems],
    queryFn: async () => {
      try {
        const query = buildTabQuery(currentTab, currentState.loadedItems);
        const { data, error, count } = await query;
        
        if (error) {
          console.error('❌ [OptimizedAuctionMgmt] Database error:', error);
          throw error;
        }
        
        errorCountRef.current = 0;
        
        // Transform data
        const transformedData = (data || []).map(item => objectToCamelCase(item) as Auction);
        
        // Apply tab-specific filtering (only needed for 'ready' tab)
        const filteredData = filterByTabLogic(transformedData, currentTab);
        
        // For 'ready' tab use filtered count, for others use DB count
        const actualCount = currentTab === 'ready' ? filteredData.length : (count || 0);
        
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

  // Manual load more
  const loadMoreManual = useCallback(() => {
    if (currentState.isLoadingMore || !currentState.hasMore) {
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
