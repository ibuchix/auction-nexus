import { useState, useRef } from "react";
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
  const { pauseAuction, cancelAuction, startAuction } = useAuctionOperations();
  const { toast } = useToast();

  const { data: listings = [], isLoading, error, refetch } = useQuery({
    queryKey: ['adminVehicleListings', showAllCars, statusFilter],
    queryFn: async () => {
      console.log('🔍 [AuctionMgmt] Fetching car listings via admin operations', { showAllCars, statusFilter });
      try {
        const response = await adminOperations.getAuctionListings(
          showAllCars, 
          statusFilter === "all" ? undefined : statusFilter
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
        
        const auctionData = Array.isArray(response) ? response : [response];
        console.log(`✅ [AuctionMgmt] Successfully fetched ${auctionData.length} car listings`);
        console.log('📊 [AuctionMgmt] Sample data structure:', auctionData.slice(0, 2));
        
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

  // Removed real-time subscription to prevent refetch loops

  const filteredListings = (Array.isArray(listings) ? listings : []).filter(listing => {
    const matchesSearch = 
      (listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (listing.make?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (listing.model?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (listing.vin?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesStatus = statusFilter === "all" || listing.auction_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const readyAuctions = filteredListings.filter(listing => {
    // Cars ready for auction include:
    // 1. New cars with no auction_status
    // 2. Cars with 'ready' status
    // 3. Cars that ended but are still available for restart
    // 4. Cars marked as available but not currently in auction
    const isReady = (() => {
      if (!listing.auction_status || listing.auction_status === 'ready') {
        console.log(`🟢 [ReadyFilter] Car ${listing.id} ready: no auction_status or ready status`);
        return true;
      }
      
      // Include ended auctions that are still available
      if (listing.auction_status === 'ended' && listing.status === 'available') {
        console.log(`🟡 [ReadyFilter] Car ${listing.id} ready: ended but available`);
        return true;
      }
      
      // Include cancelled or paused auctions that can be restarted
      if ((listing.auction_status === 'cancelled' || listing.auction_status === 'paused') && 
          listing.status === 'available') {
        console.log(`🟠 [ReadyFilter] Car ${listing.id} ready: cancelled/paused but available`);
        return true;
      }
      
      console.log(`🔴 [ReadyFilter] Car ${listing.id} NOT ready: auction_status=${listing.auction_status}, status=${listing.status}`);
      return false;
    })();
    
    return isReady;
  });
  
  console.log(`📈 [AuctionMgmt] Filter results:`, {
    totalListings: filteredListings.length,
    readyAuctions: readyAuctions.length,
    sampleReady: readyAuctions.slice(0, 2).map(car => ({
      id: car.id,
      title: car.title,
      auction_status: car.auction_status,
      status: car.status
    }))
  });
  
  const activeAuctions = filteredListings.filter(listing => {
    // Only show auctions that are marked as active AND haven't ended yet
    if (listing.auction_status !== 'active') return false;
    if (!listing.auction_end_time) return true; // No end time set, show it
    
    const endTime = new Date(listing.auction_end_time);
    const now = new Date();
    return endTime > now; // Only include if end time is in the future
  });
  
  const endedAuctions = filteredListings.filter(listing => {
    // Show auctions that are explicitly ended OR active but past their end time
    if (listing.auction_status === 'ended') return true;
    if (listing.auction_status === 'cancelled') return true;
    if (listing.auction_status === 'paused') return true;
    if (listing.auction_status === 'sold') return true;
    
    // Also include active auctions that have passed their end time
    if (listing.auction_status === 'active' && listing.auction_end_time) {
      const endTime = new Date(listing.auction_end_time);
      const now = new Date();
      return endTime <= now;
    }
    
    return false;
  });

  const notConfiguredListings = filteredListings.filter(listing =>
    !listing.auction_status && !listing.is_auction
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
  };
}
