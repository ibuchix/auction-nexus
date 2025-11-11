import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Auction, AuctionStatus } from "@/types/auction";
import { useToast } from "@/hooks/use-toast";
import { useAuctionOperations } from "@/hooks/useAuctionOperations";
import { supabase } from "@/integrations/supabase/client";
import { objectToCamelCase } from "@/utils/caseConverter";

export function useAuctionManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<AuctionStatus | "all">("all");
  const [showAllCars, setShowAllCars] = useState(true);
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const errorCountRef = useRef(0);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50); // Fixed at 50 items per page
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  
  const { pauseAuction, cancelAuction, startAuction } = useAuctionOperations();
  const { toast } = useToast();

  const { data: listings = [], isLoading, error, refetch } = useQuery({
    queryKey: ['adminVehicleListings', showAllCars, currentPage, pageSize],
    queryFn: async () => {
      try {
        // Fetch cars with their auction schedules
        const { data, error, count } = await supabase
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
          .order('created_at', { ascending: false })
          .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);
        
        if (error) {
          console.error('❌ [AuctionMgmt] Database error:', error);
          throw error;
        }
        
        // Reset error count on success
        errorCountRef.current = 0;
        
        // Calculate pagination metadata
        const totalRecords = count || 0;
        const calculatedTotalPages = Math.ceil(totalRecords / pageSize);
        
        setTotalCount(totalRecords);
        setTotalPages(calculatedTotalPages);
        setHasNextPage(currentPage < calculatedTotalPages);
        setHasPreviousPage(currentPage > 1);
        
        // Transform snake_case database fields to camelCase for components
        const transformedData = (data || []).map(item => objectToCamelCase(item) as Auction);
        
        return transformedData;
      } catch (err) {
        console.error('💥 [AuctionMgmt] Exception in queryFn:', err);
        errorCountRef.current = errorCountRef.current + 1;
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

  const filteredListings = (Array.isArray(listings) ? listings : []).filter(listing => {
    const matchesSearch = 
      (listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (listing.make?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (listing.model?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (listing.vin?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesStatus = statusFilter === "all" || (listing as any).auctionStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const readyAuctions = filteredListings
    .filter(listing => {
      // Cars are "ready for auction" if they don't have any active/scheduled or ended auctions
      const item = listing as any;
      
      const hasActiveOrScheduled = item.auctionSchedules?.some((schedule: any) => 
        schedule.status === 'running' || schedule.status === 'scheduled'
      );
      
      const hasEnded = item.auctionSchedules?.some((schedule: any) => 
        schedule.status === 'completed' || schedule.status === 'cancelled'
      );
      
      // Ready if: no active/scheduled AND no ended auctions
      // This means either no auctionSchedules at all, or only old completed ones
      return !hasActiveOrScheduled && !hasEnded;
    })
    .sort((a, b) => {
      // Sort by createdAt descending (newest first)
      const dateA = new Date((a as any).createdAt || 0).getTime();
      const dateB = new Date((b as any).createdAt || 0).getTime();
      return dateB - dateA;
    });
  
  const activeAuctions = filteredListings
    .filter(listing => {
      // Check if car has an active or scheduled auction in auctionSchedules
      const item = listing as any;
      const activeSchedule = item.auctionSchedules?.find((schedule: any) => 
        schedule.status === 'running' || schedule.status === 'scheduled'
      );
      
      if (!activeSchedule) return false;
      
      // If scheduled but not started yet, still show it
      if (activeSchedule.status === 'scheduled') return true;
      
      // If running, check if it hasn't ended yet
      if (activeSchedule.status === 'running') {
        if (!activeSchedule.endTime) return true;
        const endTime = new Date(activeSchedule.endTime);
        const now = new Date();
        return endTime > now;
      }
      
      return false;
    })
    .sort((a, b) => {
      // Sort by auction end time ascending (ending soonest first)
      const endA = (a as any).auctionSchedules?.[0]?.endTime ? new Date((a as any).auctionSchedules[0].endTime).getTime() : 0;
      const endB = (b as any).auctionSchedules?.[0]?.endTime ? new Date((b as any).auctionSchedules[0].endTime).getTime() : 0;
      return endA - endB;
    });
  
  const endedAuctions = filteredListings
    .filter(listing => {
      // Check if car has a completed or cancelled schedule
      const item = listing as any;
      const endedSchedule = item.auctionSchedules?.find((schedule: any) => 
        schedule.status === 'completed' || schedule.status === 'cancelled'
      );
      
      if (endedSchedule) return true;
      
      // Also check for running schedules that have passed their end time
      const runningSchedule = item.auctionSchedules?.find((schedule: any) => 
        schedule.status === 'running'
      );
      
      if (runningSchedule?.endTime) {
        const endTime = new Date(runningSchedule.endTime);
        const now = new Date();
        if (endTime <= now) return true;
      }
      
      // Include cars marked as sold
      if (item.auctionStatus === 'sold') return true;
      
      return false;
    })
    .sort((a, b) => {
      // Sort by end time descending (most recently ended first)
      const endA = (a as any).auctionSchedules?.[0]?.endTime ? new Date((a as any).auctionSchedules[0].endTime).getTime() : 0;
      const endB = (b as any).auctionSchedules?.[0]?.endTime ? new Date((b as any).auctionSchedules[0].endTime).getTime() : 0;
      return endB - endA;
    });

  const notConfiguredListings = filteredListings.filter(listing => {
    // Cars that don't have reserve price configured or are missing key auction data
    const item = listing as any;
    const hasReservePrice = item.reservePrice && item.reservePrice > 0;
    const hasSchedule = item.auctionSchedules && item.auctionSchedules.length > 0;
    const isSold = item.auctionStatus === 'sold';
    
    // Not configured if: no reserve price AND not sold AND no active schedule
    return !hasReservePrice && !isSold && !hasSchedule;
  });

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

  // Pagination control functions
  const goToNextPage = () => {
    if (hasNextPage && currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPreviousPage = () => {
    if (hasPreviousPage && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, showAllCars]);

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    showAllCars,
    setShowAllCars,
    listings,
    isLoading,
    error,
    refetch,
    filteredListings,
    readyAuctions,
    activeAuctions,
    endedAuctions,
    notConfiguredListings,
    selectedAuction,
    isScheduleDialogOpen,
    pauseAuction,
    cancelAuction,
    startAuction,
    handleScheduleClick,
    handleScheduleClose,
    handleScheduleSuccess,
    // Pagination exports
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    hasNextPage,
    hasPreviousPage,
    goToNextPage,
    goToPreviousPage,
    goToPage,
  };
}
