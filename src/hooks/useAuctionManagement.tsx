import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Auction, AuctionStatus } from "@/types/auction";
import { useToast } from "@/hooks/use-toast";
import { useAuctionOperations } from "@/hooks/useAuctionOperations";
import { edgeFunctionAdminOperations } from "@/utils/edgeFunctionAdminOperations";

export function useAuctionManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<AuctionStatus | "all">("all");
  const [showAllCars, setShowAllCars] = useState(true); // State for toggling all cars
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const { pauseAuction, cancelAuction, startAuction } = useAuctionOperations();
  const { toast } = useToast();

  const { data: listings, isLoading, error, refetch } = useQuery({
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
        const data = await edgeFunctionAdminOperations.getAuctionListings({ showAllCars });
        
        if (!data) {
          console.error('Failed to fetch listings from Edge Function');
          toast({
            title: "Error",
            description: `Failed to load auction listings`,
            variant: "destructive",
          });
          return [];
        }
        
        console.log(`Successfully fetched ${data?.length || 0} car listings`);
        return data as unknown as Auction[];
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
    console.log('Setting up real-time subscription with adminSupabase');
    const channel = adminSupabase
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
      adminSupabase.removeChannel(channel);
    };
  }, [refetch]);

  const filteredListings = listings?.filter(listing => {
    const matchesSearch = 
      listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.vin?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || listing.auction_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const readyAuctions = filteredListings?.filter(listing => 
    listing.auction_status === 'ready' || !listing.auction_status
  );
  
  const activeAuctions = filteredListings?.filter(listing => 
    listing.auction_status === 'active'
  );
  
  const otherAuctions = filteredListings?.filter(listing => 
    listing.auction_status !== 'ready' && 
    listing.auction_status !== 'active' && 
    listing.auction_status !== undefined
  );

  const notConfiguredListings = filteredListings?.filter(listing =>
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
