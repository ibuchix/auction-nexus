
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Auction, AuctionStatus } from "@/types/auction";
import { useToast } from "@/hooks/use-toast";
import { useAuctionOperations } from "@/hooks/useAuctionOperations";
import { edgeFunctionAdminOperations } from "@/utils/edgeFunctionAdminOperations";
import { supabase } from "@/integrations/supabase/client";

export function useAuctionManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<AuctionStatus | "all">("all");
  const [showAllCars, setShowAllCars] = useState(true); // State for toggling all cars
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const { pauseAuction, cancelAuction, startAuction } = useAuctionOperations();
  const { toast } = useToast();

  const { data: listings = [], isLoading, error, refetch } = useQuery({
    queryKey: ['adminVehicleListings', showAllCars],
    queryFn: async () => {
      console.log('Fetching car listings via Edge Function');
      try {
        // Check if VITE_SUPABASE_SERVICE_ROLE_KEY is set in environment variables
        const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
        if (!serviceRoleKey) {
          console.warn('VITE_SUPABASE_SERVICE_ROLE_KEY is not set in environment variables');
          toast({
            title: "Warning",
            description: "Admin API key is missing. Check your environment variables.",
            variant: "destructive",
          });
          return [];
        } else {
          console.log('VITE_SUPABASE_SERVICE_ROLE_KEY is set in environment variables');
        }
        
        // Use Edge Function to get auction listings
        // Pass status as null to match the required parameter type
        const response = await edgeFunctionAdminOperations.getAuctionListings({ 
          showAllCars, 
          status: statusFilter === "all" ? null : statusFilter 
        });
        
        if (!response) {
          console.error('Failed to fetch listings from Edge Function');
          toast({
            title: "Error",
            description: `Failed to load auction listings`,
            variant: "destructive",
          });
          return [];
        }
        
        // Handle case where response might be an object with data property rather than direct array
        let auctionData: Auction[] = [];
        
        if (Array.isArray(response)) {
          auctionData = response as Auction[];
        } else if (response && typeof response === 'object') {
          // Safely check if response has a data property that is an array
          const responseObj = response as Record<string, any>;
          if (responseObj.data && Array.isArray(responseObj.data)) {
            auctionData = responseObj.data as Auction[];
          } else {
            // If response is an object but not in expected format
            console.error('Unexpected response format:', response);
            return [];
          }
        }
        
        console.log(`Successfully fetched ${auctionData.length} car listings`);
        return auctionData;
      } catch (err) {
        console.error('Exception in queryFn:', err);
        toast({
          title: "Error",
          description: "An unexpected error occurred while fetching listings",
          variant: "destructive",
        });
        throw err;
      }
    },
    retry: 1,
  });

  // Set up real-time subscription
  useEffect(() => {
    console.log('Setting up real-time subscription');
    const channel = supabase
      .channel('auction-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cars'
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          refetch();
        }
      )
      .subscribe();

    return () => {
      console.log('Removing real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  // Ensure filteredListings is always an array, even if listings is undefined
  const filteredListings = (Array.isArray(listings) ? listings : []).filter(listing => {
    const matchesSearch = 
      (listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (listing.make?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (listing.model?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (listing.vin?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesStatus = statusFilter === "all" || listing.auction_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Derived states that depend on filteredListings - now guaranteed to be arrays
  const readyAuctions = filteredListings.filter(listing => 
    listing.auction_status === 'ready' || !listing.auction_status
  );
  
  const activeAuctions = filteredListings.filter(listing => 
    listing.auction_status === 'active'
  );
  
  const otherAuctions = filteredListings.filter(listing => 
    listing.auction_status !== 'ready' && 
    listing.auction_status !== 'active' && 
    listing.auction_status !== undefined
  );

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
    otherAuctions,
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
