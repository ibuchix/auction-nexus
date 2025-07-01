import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Auction, AuctionStatus } from "@/types/auction";
import { useToast } from "@/hooks/use-toast";
import { useAuctionOperations } from "@/hooks/useAuctionOperations";
import { edgeFunctionAdminOperations } from "@/utils/edgeFunctionAdminOperations";
import { supabase } from "@/integrations/supabase/client";
import { fixAllCarTitles } from "@/utils/fixCarTitles";
import { fixStuckAuctionStatuses } from "@/utils/fixAuctionStatuses";

export function useAuctionManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<AuctionStatus | "all">("all");
  const [showAllCars, setShowAllCars] = useState(true);
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [titleFixRun, setTitleFixRun] = useState(false);
  const [statusFixRun, setStatusFixRun] = useState(false);
  const { pauseAuction, cancelAuction, startAuction } = useAuctionOperations();
  const { toast } = useToast();

  const { data: listings = [], isLoading, error, refetch } = useQuery({
    queryKey: ['adminVehicleListings', showAllCars],
    queryFn: async () => {
      console.log('Fetching car listings via Edge Function');
      try {
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
        
        const response = await edgeFunctionAdminOperations.getAuctionListings({ 
          showAllCars, 
          status: statusFilter === "all" ? null : statusFilter,
          includeFiles: true
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
        
        let auctionData: Auction[] = [];
        
        if (Array.isArray(response)) {
          auctionData = response as Auction[];
        } else if (response && typeof response === 'object') {
          const responseObj = response as Record<string, any>;
          if (responseObj.data && Array.isArray(responseObj.data)) {
            auctionData = responseObj.data as Auction[];
          } else {
            console.error('Unexpected response format:', response);
            return [];
          }
        }
        
        console.log(`Successfully fetched ${auctionData.length} car listings`);
        
        // Run title fix once if not already done
        if (!titleFixRun && auctionData.length > 0) {
          console.log('Running car title fix operation...');
          const fixResult = await fixAllCarTitles();
          if (fixResult.success && fixResult.updatedCount > 0) {
            console.log(`Fixed ${fixResult.updatedCount} car titles`);
            setTimeout(() => refetch(), 1000);
          }
          setTitleFixRun(true);
        }
        
        // Run auction status fix once if not already done
        if (!statusFixRun && auctionData.length > 0) {
          console.log('Running auction status fix operation...');
          const statusResult = await fixStuckAuctionStatuses();
          if (statusResult.success && statusResult.updatedCount > 0) {
            console.log(`Fixed ${statusResult.updatedCount} auction statuses`);
            setTimeout(() => refetch(), 1000);
          }
          setStatusFixRun(true);
        }
        
        auctionData = auctionData.map(auction => {
          try {
            if (auction.valuation_data) {
              console.log(`Valuation data for ${auction.id}:`, auction.valuation_data);
            }
            return auction;
          } catch (err) {
            console.error('Error processing auction valuation data:', err);
            return auction;
          }
        });
        
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
