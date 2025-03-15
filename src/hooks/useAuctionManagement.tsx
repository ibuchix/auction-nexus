
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminSupabase } from "@/integrations/supabase/adminClient";
import { Auction, AuctionStatus } from "@/types/auction";
import { useToast } from "@/hooks/use-toast";
import { useAuctionOperations } from "@/hooks/useAuctionOperations";

export function useAuctionManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<AuctionStatus | "all">("all");
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const { pauseAuction, cancelAuction, startAuction } = useAuctionOperations();
  const { toast } = useToast();

  const { data: listings, isLoading, error, refetch } = useQuery({
    queryKey: ['adminVehicleListings'],
    queryFn: async () => {
      const { data, error } = await adminSupabase
        .from('cars')
        .select(`
          *,
          bids (*),
          seller:profiles (*),
          auction_metrics (*)
        `)
        .eq('status', 'approved');
      
      if (error) {
        console.error('Error fetching listings:', error);
        toast({
          title: "Error",
          description: "Failed to load auction listings. Please check admin permissions.",
          variant: "destructive",
        });
        throw error;
      }
      
      return data as unknown as Auction[];
    }
  });

  // Set up real-time subscription
  useEffect(() => {
    const channel = adminSupabase
      .channel('auction-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cars'
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
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
    listings,
    isLoading,
    error,
    refetch,
    filteredListings,
    readyAuctions,
    activeAuctions,
    otherAuctions,
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
