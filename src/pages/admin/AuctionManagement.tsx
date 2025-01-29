import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useState } from "react";
import { 
  Car, 
  Search, 
  Filter,
  Play,
  Pause,
  Ban,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAuctionOperations } from "@/hooks/useAuctionOperations";

type AdminVehicleListing = {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number;
  is_auction: boolean;
  auction_status: string | null;
  auction_start_time: string | null;
  auction_end_time: string | null;
  reserve_price: number | null;
  seller_role: string;
  interested_dealers: number;
  highest_proxy_bid: number | null;
  active_bidders: number;
  highest_actual_bid: number | null;
};

const AuctionManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { pauseAuction, cancelAuction } = useAuctionOperations();

  const { data: listings, isLoading } = useQuery({
    queryKey: ['adminVehicleListings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_vehicle_listings')
        .select('*');
      
      if (error) throw error;
      return data as AdminVehicleListing[];
    }
  });

  const startAuction = async (carId: string) => {
    const startTime = new Date();
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 24); // 24-hour auction by default

    try {
      const { error } = await supabase
        .from('cars')
        .update({
          is_auction: true,
          auction_status: 'active',
          auction_start_time: startTime.toISOString(),
          auction_end_time: endTime.toISOString()
        })
        .eq('id', carId);

      if (error) throw error;
      toast.success("Auction started successfully");
    } catch (error) {
      toast.error("Failed to start auction");
      console.error('Error starting auction:', error);
    }
  };

  const filteredListings = listings?.filter(listing => {
    const matchesSearch = 
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.model.toLowerCase().includes(searchTerm.toLowerCase());
    
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
                placeholder="Search vehicles..."
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
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="ended">Ended</option>
              <option value="paused">Paused</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </div>
        </div>

        <div className="grid gap-4">
          {isLoading ? (
            <Card className="p-6">
              <p>Loading...</p>
            </Card>
          ) : filteredListings?.length === 0 ? (
            <Card className="p-6">
              <p className="text-center text-gray-500">No vehicles found</p>
            </Card>
          ) : (
            filteredListings?.map((listing) => (
              <Card key={listing.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{listing.title}</h3>
                    <p className="text-sm text-gray-500">
                      {listing.make} {listing.model} {listing.year}
                    </p>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Price:</span> ${listing.price.toLocaleString()}
                      </p>
                      {listing.reserve_price && (
                        <p className="text-sm">
                          <span className="font-medium">Reserve:</span> ${listing.reserve_price.toLocaleString()}
                        </p>
                      )}
                      <p className="text-sm">
                        <span className="font-medium">Interested Dealers:</span> {listing.interested_dealers}
                      </p>
                      {listing.highest_proxy_bid && (
                        <p className="text-sm">
                          <span className="font-medium">Highest Proxy Bid:</span> ${listing.highest_proxy_bid.toLocaleString()}
                        </p>
                      )}
                      {listing.auction_status && (
                        <p className="text-sm">
                          <span className="font-medium">Status:</span>{" "}
                          <span className={`capitalize ${
                            listing.auction_status === 'active' ? 'text-green-600' :
                            listing.auction_status === 'paused' ? 'text-yellow-600' :
                            listing.auction_status === 'cancelled' ? 'text-red-600' :
                            'text-gray-600'
                          }`}>
                            {listing.auction_status}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!listing.is_auction && (
                      <Button
                        onClick={() => startAuction(listing.id)}
                        className="flex items-center gap-2"
                      >
                        <Play className="h-4 w-4" />
                        Start Auction
                      </Button>
                    )}
                    {listing.auction_status === 'active' && (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => pauseAuction(listing.id)}
                          className="flex items-center gap-2"
                        >
                          <Pause className="h-4 w-4" />
                          Pause
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => cancelAuction(listing.id)}
                          className="flex items-center gap-2"
                        >
                          <Ban className="h-4 w-4" />
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                {listing.auction_status === 'active' && listing.auction_end_time && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>
                      Ends: {format(new Date(listing.auction_end_time), 'PPp')}
                    </span>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AuctionManagement;