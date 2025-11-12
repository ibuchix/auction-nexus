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
      `, { count: 'exact' });

    // Add search if present (server-side full-text search)
    if (searchTerm) {
      query = query.or(
        `title.ilike.%${searchTerm}%,make.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%,vin.ilike.%${searchTerm}%`
      );
    }

    // Tab-specific filters
    switch (tab) {
      case 'ready':
        // Cars with reserve price - post-processing will filter by schedule status
        query = query.gt('reserve_price', 0);
        break;
      
      case 'active':
        // Cars with active or scheduled auction schedules
        // We'll filter this in post-processing since we need to check nested schedules
        break;
      
      case 'ended':
        // Cars with completed/cancelled schedules or sold status
        // We'll filter this in post-processing
        break;
      
      case 'notConfigured':
        // Cars without reserve price or missing configuration
        query = query.or('reserve_price.is.null,reserve_price.eq.0');
        break;
    }

    return query
      .order('created_at', { ascending: false })
      .range(0, limit - 1);
  }, [searchTerm]);

  // Filter results based on auction_schedules (post-processing for complex logic)
  const filterByTabLogic = useCallback((data: any[], tab: TabType): any[] => {
    return data.filter(item => {
      const schedules = item.auction_schedules || [];
      const hasActiveSchedule = schedules.some((s: any) => 
        s.status === 'running' || s.status === 'scheduled'
      );
      
      // For ended auctions, check if ended in last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const hasRecentEndedSchedule = schedules.some((s: any) => {
        const isEnded = s.status === 'completed' || s.status === 'cancelled';
        if (!isEnded) return false;
        
        // Check if ended in last 7 days using end_time or updated_at
        const endDate = new Date(s.end_time || s.updated_at);
        return endDate >= sevenDaysAgo;
      });

      switch (tab) {
        case 'ready':
          // Ready if no active/scheduled schedules - cars can have ended schedules and be re-auctioned
          return !hasActiveSchedule && item.reserve_price > 0;
        
        case 'active':
          return hasActiveSchedule;
        
        case 'ended':
          // Only show auctions that ended in the last 7 days
          return hasRecentEndedSchedule;
        
        case 'notConfigured':
          return !item.reserve_price || item.reserve_price === 0;
        
        default:
          return true;
      }
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
        
        // Apply tab-specific filtering
        const filteredData = filterByTabLogic(transformedData, currentTab);
        
        // Update tab state
        const totalRecords = count || 0;
        setTabStates(prev => ({
          ...prev,
          [currentTab]: {
            ...prev[currentTab],
            totalCount: totalRecords,
            hasMore: currentState.loadedItems < totalRecords,
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
