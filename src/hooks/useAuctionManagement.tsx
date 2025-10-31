import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Auction, AuctionStatus } from "@/types/auction";
import { useToast } from "@/hooks/use-toast";
import { useAuctionOperations } from "@/hooks/useAuctionOperations";
import { adminSupabase } from "@/integrations/supabase/adminClient";
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
        const { data, error, count } = await adminSupabase
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
    
    const matchesStatus = statusFilter === "all" || listing.auction_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const readyAuctions = filteredListings
    .filter(listing => {
      // Check if car has any active or scheduled auction schedule
      const hasActiveSchedule = listing.auction_schedules?.some((schedule: any) => 
        schedule.status === 'active' || schedule.status === 'scheduled'
      );
      
      // If car has an active/scheduled auction, it's not "ready" anymore
      if (hasActiveSchedule) return false;
      
      // Cars ready for auction:
      // 1. Must have reserve price configured (greater than 0)
      // 2. Don't have an active schedule
      // 3. Haven't been sold
      const hasReservePrice = listing.reserve_price && listing.reserve_price > 0;
      const notSold = listing.auction_status !== 'sold';
      
      return hasReservePrice && notSold;
    })
    .sort((a, b) => {
      // Sort by created_at descending (newest first)
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });
  
  const activeAuctions = filteredListings
    .filter(listing => {
      // Check if car has an active or scheduled auction in auction_schedules
      const activeSchedule = listing.auction_schedules?.find((schedule: any) => 
        schedule.status === 'active' || schedule.status === 'scheduled'
      );
      
      if (!activeSchedule) return false;
      
      // If scheduled but not started yet, still show it
      if (activeSchedule.status === 'scheduled') return true;
      
      // If active, check if it hasn't ended yet
      if (activeSchedule.status === 'active') {
        if (!activeSchedule.end_time) return true;
        const endTime = new Date(activeSchedule.end_time);
        const now = new Date();
        return endTime > now;
      }
      
      return false;
    })
    .sort((a, b) => {
      // Sort by auction end time ascending (ending soonest first)
      const endA = a.auction_schedules?.[0]?.end_time ? new Date(a.auction_schedules[0].end_time).getTime() : 0;
      const endB = b.auction_schedules?.[0]?.end_time ? new Date(b.auction_schedules[0].end_time).getTime() : 0;
      return endA - endB;
    });
  
  const endedAuctions = filteredListings
    .filter(listing => {
      // Check if car has an ended, cancelled, or paused schedule
      const endedSchedule = listing.auction_schedules?.find((schedule: any) => 
        schedule.status === 'ended' || schedule.status === 'cancelled' || schedule.status === 'paused'
      );
      
      if (endedSchedule) return true;
      
      // Also check for active schedules that have passed their end time
      const activeSchedule = listing.auction_schedules?.find((schedule: any) => 
        schedule.status === 'active'
      );
      
      if (activeSchedule?.end_time) {
        const endTime = new Date(activeSchedule.end_time);
        const now = new Date();
        if (endTime <= now) return true;
      }
      
      // Include cars marked as sold
      if (listing.auction_status === 'sold') return true;
      
      return false;
    })
    .sort((a, b) => {
      // Sort by end time descending (most recently ended first)
      const endA = a.auction_schedules?.[0]?.end_time ? new Date(a.auction_schedules[0].end_time).getTime() : 0;
      const endB = b.auction_schedules?.[0]?.end_time ? new Date(b.auction_schedules[0].end_time).getTime() : 0;
      return endB - endA;
    });

  const notConfiguredListings = filteredListings.filter(listing => {
    // Cars that don't have reserve price configured or are missing key auction data
    const hasReservePrice = listing.reserve_price && listing.reserve_price > 0;
    const hasSchedule = listing.auction_schedules && listing.auction_schedules.length > 0;
    const isSold = listing.auction_status === 'sold';
    
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
