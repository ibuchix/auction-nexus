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
  const { pauseAuction, cancelAuction, startAuction } = useAuctionOperations();
  const { toast } = useToast();

  // Track query key changes
  useEffect(() => {
    console.log('🔑 [DEBUG] Query Key Changed:', { 
      showAllCars, 
      statusFilter,
      queryKey: ['adminVehicleListings', showAllCars]
    });
  }, [showAllCars, statusFilter]);

  const { data: listings = [], isLoading, error, refetch } = useQuery({
    queryKey: ['adminVehicleListings', showAllCars],
    queryFn: async () => {
      console.log('🔍 [AuctionMgmt] Fetching car listings via admin operations', { showAllCars, statusFilter });
      try {
        const response = await adminOperations.getAuctionListings(
          showAllCars, 
          statusFilter === "all" ? undefined : statusFilter
        );
        
        console.log('🔬 [AuctionMgmt] RAW RESPONSE DEBUG:');
        console.log('  - Type:', typeof response);
        console.log('  - Is Array:', Array.isArray(response));
        console.log('  - Length/Keys:', Array.isArray(response) ? response.length : Object.keys(response || {}));
        console.log('  - Constructor:', response?.constructor?.name);
        console.log('  - First item keys:', Array.isArray(response) && response[0] ? Object.keys(response[0]).slice(0, 15) : 'No first item');
        console.log('  - Sample items:', Array.isArray(response) ? response.slice(0, 2) : 'Not an array');
        
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
        console.log('🔬 [AuctionMgmt] PROCESSED DATA DEBUG:');
        console.log('  - Processed length:', auctionData.length);
        console.log('  - First 3 items field names:', auctionData.slice(0, 3).map(item => Object.keys(item || {}).slice(0, 10)));
        console.log('  - Sample auctionStatus values:', auctionData.slice(0, 5).map(item => ({ id: item?.id, auctionStatus: item?.auctionStatus, status: item?.status })));
        
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

  // Track successful data loading
  useEffect(() => {
    if (!isLoading && listings.length > 0) {
      console.log('✅ [DEBUG] Data Successfully Loaded:', {
        listingsCount: listings.length,
        filipFound: !!listings.find((l: any) => l?.id === '889213dc-9fec-41b9-b8f0-f815292eb86c'),
        lolFound: !!listings.find((l: any) => l?.id === '59519d65-9f5f-43c1-97e7-1520b21c9ec3')
      });
    }
  }, [isLoading, listings]);

  console.log('🔍 [DEBUG] React Query State:', {
    listingsIsArray: Array.isArray(listings),
    listingsLength: listings?.length,
    isLoading,
    error: error,
    hasError: !!error,
    errorMessage: error?.message
  });

  const filipReceived = listings?.find((l: any) => l?.id === '889213dc-9fec-41b9-b8f0-f815292eb86c');
  const lolReceived = listings?.find((l: any) => l?.id === '59519d65-9f5f-43c1-97e7-1520b21c9ec3');
  console.log('🔍 [5/6] Received in React hook:', {
    filipCar: filipReceived ? '✅ FOUND' : '❌ MISSING',
    lolCar: lolReceived ? '✅ FOUND' : '❌ MISSING',
    totalListings: listings?.length,
    currentFilters: { searchTerm, statusFilter }
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

  const filipFiltered = filteredListings.find(l => l.id === '889213dc-9fec-41b9-b8f0-f815292eb86c');
  const lolFiltered = filteredListings.find(l => l.id === '59519d65-9f5f-43c1-97e7-1520b21c9ec3');
  console.log('🔍 [6/6] After final filter:', {
    filipCar: filipFiltered ? '✅ FOUND' : '❌ MISSING',
    lolCar: lolFiltered ? '✅ FOUND' : '❌ MISSING',
    totalFiltered: filteredListings.length,
    // Show why they were filtered out if missing
    ...((!filipFiltered && filipReceived) && {
      filipReason: {
        matchesSearch: (
          (filipReceived.title?.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (filipReceived.make?.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (filipReceived.model?.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (filipReceived.vin?.toLowerCase().includes(searchTerm.toLowerCase()))
        ),
        matchesStatus: statusFilter === "all" || filipReceived.auctionStatus === statusFilter,
        auctionStatus: filipReceived.auctionStatus
      }
    }),
    ...((!lolFiltered && lolReceived) && {
      lolReason: {
        matchesSearch: (
          (lolReceived.title?.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (lolReceived.make?.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (lolReceived.model?.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (lolReceived.vin?.toLowerCase().includes(searchTerm.toLowerCase()))
        ),
        matchesStatus: statusFilter === "all" || lolReceived.auctionStatus === statusFilter,
        auctionStatus: lolReceived.auctionStatus
      }
    })
  });

  const readyAuctions = filteredListings.filter(listing => {
    // Cars ready for auction include:
    // 1. New cars with no auction_status
    // 2. Cars with 'ready' status
    // Note: Ended auctions should NOT appear here, only in ended tab
    const isReady = (() => {
      if (!listing.auctionStatus || listing.auctionStatus === 'ready') {
        console.log(`🟢 [ReadyFilter] Car ${listing.id} ready: no auctionStatus or ready status`);
        return true;
      }
      
      // Include cancelled or paused auctions that can be restarted
      if ((listing.auctionStatus === 'cancelled' || listing.auctionStatus === 'paused') && 
          listing.status === 'available') {
        console.log(`🟠 [ReadyFilter] Car ${listing.id} ready: cancelled/paused but available`);
        return true;
      }
      
      console.log(`🔴 [ReadyFilter] Car ${listing.id} NOT ready: auctionStatus=${listing.auctionStatus}, status=${listing.status}`);
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
      auctionStatus: car.auctionStatus,
      status: car.status
    }))
  });
  
  const activeAuctions = filteredListings.filter(listing => {
    // Only show auctions that are marked as active AND haven't ended yet
    if (listing.auctionStatus !== 'active') return false;
    if (!listing.auctionEndTime) return true; // No end time set, show it
    
    const endTime = new Date(listing.auctionEndTime);
    const now = new Date();
    return endTime > now; // Only include if end time is in the future
  });
  
  const endedAuctions = filteredListings.filter(listing => {
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
