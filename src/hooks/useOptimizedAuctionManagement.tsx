import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Auction, AuctionStatus } from "@/types/auction";
import { useToast } from "@/hooks/use-toast";
import { useAuctionOperations } from "@/hooks/useAuctionOperations";
import { supabase } from "@/integrations/supabase/client";
import { objectToCamelCase } from "@/utils/caseConverter";
import { exportAuctionsToCSV } from "@/utils/exportAuctionCSV";

type TabType = 'ready' | 'active' | 'ended' | 'notConfigured';

interface TabState {
  currentPage: number;
  totalCount: number;
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
    ready: { currentPage: 1, totalCount: 0 },
    active: { currentPage: 1, totalCount: 0 },
    ended: { currentPage: 1, totalCount: 0 },
    notConfigured: { currentPage: 1, totalCount: 0 },
  });

  const { pauseAuction, cancelAuction, startAuction } = useAuctionOperations();
  const { toast } = useToast();
  const errorCountRef = useRef(0);
  
  // Get current tab state
  const currentState = tabStates[currentTab];

  // Build tab-specific query with database-level filtering
  const buildTabQuery = useCallback((tab: TabType, page: number, itemsPerPage: number) => {
    const offset = (page - 1) * itemsPerPage;
    const limit = offset + itemsPerPage - 1;
    
    // Tab-specific filters with appropriate joins
    switch (tab) {
      case 'ready': {
        // Use LEFT JOIN to find cars that have NO auction schedules
        // This avoids the URL length issue from excluding 600+ UUIDs
        let query = supabase
          .from('cars')
          .select(`
            *,
            auction_schedules!left(id)
          `, { count: 'exact' })
          .gt('reserve_price', 0)
          .is('auction_schedules.id', null);  // Only cars with NO matching auction_schedules

        if (searchTerm) {
          query = query.or(
            `title.ilike.%${searchTerm}%,make.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%,vin.ilike.%${searchTerm}%`
          );
        }

        return query
          .order('created_at', { ascending: false })
          .range(offset, limit);
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
            ),
            highest_bid:bids!left(
              amount,
              dealer_id,
              dealers!inner(
                dealership_name
              )
            )
          `, { count: 'exact' })
          .gt('reserve_price', 0)
          .in('auction_schedules.status', ['active', 'scheduled'])
          .order('created_at', { referencedTable: 'bids', ascending: false })
          .limit(1, { referencedTable: 'bids' });

        if (searchTerm) {
          query = query.or(
            `title.ilike.%${searchTerm}%,make.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%,vin.ilike.%${searchTerm}%`
          );
        }

        return query
          .order('created_at', { ascending: false })
          .range(offset, limit);
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
          .range(offset, limit);
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
          .range(offset, limit);
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
    queryKey: ['optimizedAuctionManagement', currentTab, searchTerm, currentState.currentPage, pageSize],
    queryFn: async () => {
      try {
        const query = await buildTabQuery(currentTab, currentState.currentPage, pageSize);
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
            currentPage: currentState.currentPage,
            totalCount: actualCount,
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

  // Pagination logic
  const totalPages = Math.ceil(currentState.totalCount / pageSize);
  const hasNextPage = currentState.currentPage < totalPages;
  const hasPreviousPage = currentState.currentPage > 1;

  const goToPage = useCallback((page: number) => {
    setTabStates(prev => ({
      ...prev,
      [currentTab]: {
        ...prev[currentTab],
        currentPage: page
      }
    }));
  }, [currentTab]);

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      goToPage(currentState.currentPage + 1);
    }
  }, [hasNextPage, currentState.currentPage, goToPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      goToPage(currentState.currentPage - 1);
    }
  }, [hasPreviousPage, currentState.currentPage, goToPage]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setTabStates(prev => ({
      ...prev,
      [currentTab]: {
        ...prev[currentTab],
        currentPage: 1,
      }
    }));
  }, [searchTerm, currentTab]);

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

  // Export current tab data to CSV
  const [isExporting, setIsExporting] = useState(false);
  
  const exportCurrentTab = async () => {
    setIsExporting(true);
    try {
      // Fetch all data for current tab (no pagination)
      const query = await buildTabQuery(currentTab, 1, 10000);
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      if (!data || data.length === 0) {
        toast({
          title: "No data to export",
          description: "There are no listings in this tab to export.",
          variant: "destructive",
        });
        return;
      }
      
      // Convert to camelCase and export
      const auctions = data.map((item: any) => objectToCamelCase(item)) as Auction[];
      exportAuctionsToCSV(auctions, currentTab);
      
      toast({
        title: "Export successful",
        description: `Exported ${auctions.length} listing${auctions.length !== 1 ? 's' : ''} to CSV`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
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
    
    // Pagination
    currentPage: currentState.currentPage,
    totalPages,
    totalCount: currentState.totalCount,
    pageSize,
    hasNextPage,
    hasPreviousPage,
    onNextPage: nextPage,
    onPreviousPage: previousPage,
    onGoToPage: goToPage,
    
    // Auction operations
    selectedAuction,
    isScheduleDialogOpen,
    pauseAuction,
    cancelAuction,
    startAuction,
    handleScheduleClick,
    handleScheduleClose,
    handleScheduleSuccess,
    
    // Export
    exportCurrentTab,
    isExporting,
    
    // All tab states (for badges)
    tabStates,
  };
}
