
import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { AdminAuctionCard } from "@/components/admin/AdminAuctionCard";
import { useAuctionOperations } from "@/hooks/useAuctionOperations";
import { useToast } from "@/hooks/use-toast";
import { Auction } from "@/types/auction";

const AuctionManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { pauseAuction, cancelAuction, startAuction } = useAuctionOperations();
  const { toast } = useToast();

  const { data: listings, isLoading, error, refetch } = useQuery({
    queryKey: ['adminVehicleListings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cars')
        .select(`
          *,
          bids (*),
          seller:profiles (*),
          auction_metrics (*)
        `);
      
      if (error) {
        console.error('Error fetching listings:', error);
        toast({
          title: "Error",
          description: "Failed to load auction listings. Please try again.",
          variant: "destructive",
        });
        throw error;
      }
      
      // Convert the data to fit our Auction type
      return data as unknown as Auction[];
    }
  });

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
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
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center text-red-500">
            Failed to load auction listings. Please refresh the page or contact support.
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const filteredListings = listings?.filter(listing => {
    const matchesSearch = 
      listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.vin?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || listing.auction_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Auction Management</h1>
          <div className="flex gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by title, make, model, or VIN..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <option value="all">All Status</option>
              <option value="ready">Ready</option>
              <option value="active">Active</option>
              <option value="ended">Ended</option>
              <option value="paused">Paused</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </div>
        </div>

        <div className="grid gap-4">
          {isLoading ? (
            <p>Loading...</p>
          ) : filteredListings?.length === 0 ? (
            <p className="text-center text-gray-500">No vehicles found</p>
          ) : (
            filteredListings?.map((listing) => (
              <AdminAuctionCard
                key={listing.id}
                auction={listing}
                onPause={pauseAuction}
                onCancel={cancelAuction}
                onStart={startAuction}
              />
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AuctionManagement;
