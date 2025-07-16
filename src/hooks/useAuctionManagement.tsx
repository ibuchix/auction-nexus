import { useState } from "react";
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
  const [errorCount, setErrorCount] = useState(0);
  const { pauseAuction, cancelAuction, startAuction } = useAuctionOperations();
  const { toast } = useToast();

  const { data: listings = [], isLoading, error, refetch } = useQuery({
    queryKey: ['adminVehicleListings', showAllCars, statusFilter],
    queryFn: async () => {
      console.log('Fetching car listings via admin operations');
      try {
        const response = await adminOperations.getAuctionListings(
          showAllCars, 
          statusFilter === "all" ? undefined : statusFilter
        );
        
        if (!response) {
          console.error('No response from admin operations');
          // Only show error if this is a repeated failure
          setErrorCount(prev => prev + 1);
          if (errorCount < 3) {
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
        setErrorCount(0);
        
        const auctionData = Array.isArray(response) ? response : [response];
        console.log(`Successfully fetched ${auctionData.length} car listings`);
        
        return auctionData;
      } catch (err) {
        console.error('Exception in queryFn:', err);
        setErrorCount(prev => prev + 1);
        // Only show toast on repeated failures to prevent spam
        if (errorCount >= 2) {
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

  const readyAuctions = filteredListings.filter(listing => 
    listing.auction_status === 'ready' || !listing.auction_status
  );
  
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
