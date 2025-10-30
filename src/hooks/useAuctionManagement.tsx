import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Auction, AuctionStatus } from "@/types/auction";
import { useToast } from "@/hooks/use-toast";
import { useAuctionOperations } from "@/hooks/useAuctionOperations";
import { adminOperations } from "@/utils/adminOperations";

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
        const response = await adminOperations.getAuctionListings(
          showAllCars, 
          statusFilter === "all" ? undefined : statusFilter,
          currentPage,
          pageSize
        );
        
        if (!response) {
          console.error('❌ [AuctionMgmt] No response from admin operations');
          errorCountRef.current = errorCountRef.current + 1;
          if (errorCountRef.current < 3) {
            return [];
          }
          toast({
            title: "Error",
            description: "Failed to load auction listings",
            variant: "destructive",
          });
          return [];
        }
        
        // Reset error count on success
        errorCountRef.current = 0;
        
        // Extract pagination metadata if available with proper type checking
        if (response && typeof response === 'object' && 'pagination' in response) {
          const paginationData = (response as any).pagination;
          if (paginationData) {
            setTotalCount(paginationData.totalCount || 0);
            setTotalPages(paginationData.totalPages || 1);
            setHasNextPage(paginationData.hasNextPage || false);
            setHasPreviousPage(paginationData.hasPreviousPage || false);
          }
        }
        
        // Return just the data array with proper type checking
        if (response && typeof response === 'object' && 'data' in response) {
          const responseData = (response as any).data;
          const auctionData = Array.isArray(responseData) ? responseData : [responseData];
          return auctionData;
        }
        
        // Fallback for legacy response format
        const auctionData = Array.isArray(response) ? response : [response];
        return auctionData;
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
    staleTime: 30000, // Data stays fresh for 30 seconds
  });

  const filteredListings = (Array.isArray(listings) ? listings : []).filter(listing => {
    const matchesSearch = 
      (listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (listing.make?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (listing.model?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (listing.vin?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesStatus = statusFilter === "all" || listing.auctionStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const readyAuctions = filteredListings
    .filter(listing => {
      // Cars ready for auction include:
      // 1. New cars with no auction_status
      // 2. Cars with 'ready' status
      // Note: Ended auctions should NOT appear here, only in ended tab
      if (!listing.auctionStatus || listing.auctionStatus === 'ready') {
        return true;
      }
      
      // Include cancelled or paused auctions that can be restarted
      if ((listing.auctionStatus === 'cancelled' || listing.auctionStatus === 'paused') && 
          listing.status === 'available') {
        return true;
      }
      
      return false;
    })
    .sort((a, b) => {
      // Sort by created_at descending (newest first)
      const dateA = new Date(a.createdAt || a.created_at || 0).getTime();
      const dateB = new Date(b.createdAt || b.created_at || 0).getTime();
      return dateB - dateA;
    });
  
  const activeAuctions = filteredListings
    .filter(listing => {
      // Only show auctions that are marked as active AND haven't ended yet
      if (listing.auctionStatus !== 'active') return false;
      if (!listing.auctionEndTime) return true; // No end time set, show it
      
      const endTime = new Date(listing.auctionEndTime);
      const now = new Date();
      return endTime > now; // Only include if end time is in the future
    })
    .sort((a, b) => {
      // Sort by auction end time ascending (ending soonest first)
      const endA = new Date(a.auctionEndTime || 0).getTime();
      const endB = new Date(b.auctionEndTime || 0).getTime();
      return endA - endB;
    });
  
  const endedAuctions = filteredListings
    .filter(listing => {
      // Show auctions that are explicitly ended OR active but past their end time
      if (listing.auctionStatus === 'ended') return true;
      if (listing.auctionStatus === 'cancelled') return true;
      if (listing.auctionStatus === 'paused') return true;
      if (listing.auctionStatus === 'sold') return true;
      
      // Also include active auctions that have passed their end time
      if (listing.auctionStatus === 'active' && listing.auctionEndTime) {
        const endTime = new Date(listing.auctionEndTime);
        const now = new Date();
        return endTime <= now;
      }
      
      return false;
    })
    .sort((a, b) => {
      // Sort by end time descending (most recently ended first)
      const endA = new Date(a.auctionEndTime || 0).getTime();
      const endB = new Date(b.auctionEndTime || 0).getTime();
      return endB - endA;
    });

  const notConfiguredListings = filteredListings.filter(listing =>
    !listing.auctionStatus && !listing.isAuction
  );

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
