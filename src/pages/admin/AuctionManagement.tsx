
import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { adminSupabase } from "@/integrations/supabase/adminClient"; 
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Search, AlertTriangle, Clock, CheckCircle, PauseCircle, XCircle, CalendarClock } from "lucide-react";
import { AdminAuctionCard } from "@/components/admin/AdminAuctionCard";
import { useAuctionOperations } from "@/hooks/useAuctionOperations";
import { useToast } from "@/hooks/use-toast";
import { Auction, AuctionStatus } from "@/types/auction";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AuctionScheduleDialog } from "@/components/admin/auction-scheduling/AuctionScheduleDialog";

const AuctionManagement = () => {
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

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'ready':
        return <Badge variant="outline" className="bg-blue-50 text-blue-600">Ready</Badge>;
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-700">Active</Badge>;
      case 'paused':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Paused</Badge>;
      case 'ended':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-700">Ended</Badge>;
      case 'cancelled':
        return <Badge variant="destructive" className="bg-red-100 text-red-700">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Not Set</Badge>;
    }
  };

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Auction Management
          </h1>
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
              onValueChange={(value) => setStatusFilter(value as AuctionStatus | "all")}
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

        <Tabs defaultValue="ready" className="space-y-4">
          <TabsList>
            <TabsTrigger value="ready" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Ready for Auction
              {readyAuctions && readyAuctions.length > 0 && (
                <Badge variant="secondary" className="ml-1">{readyAuctions.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Active Auctions
              {activeAuctions && activeAuctions.length > 0 && (
                <Badge variant="secondary" className="ml-1">{activeAuctions.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="other" className="flex items-center gap-1">
              <PauseCircle className="h-4 w-4" />
              Other Auctions
              {otherAuctions && otherAuctions.length > 0 && (
                <Badge variant="secondary" className="ml-1">{otherAuctions.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ready" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Listings Ready to Start Auction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <p className="text-center py-4">Loading...</p>
                ) : readyAuctions?.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                    <p>No listings ready for auction</p>
                  </div>
                ) : (
                  readyAuctions?.map((listing) => (
                    <div key={listing.id} className="relative">
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute right-3 top-3 z-10 bg-white"
                        onClick={() => handleScheduleClick(listing)}
                      >
                        <CalendarClock className="h-4 w-4 mr-1" />
                        Schedule
                      </Button>
                      <AdminAuctionCard
                        key={listing.id}
                        auction={listing}
                        onPause={pauseAuction}
                        onCancel={cancelAuction}
                        onStart={startAuction}
                      />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Active Auctions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <p className="text-center py-4">Loading...</p>
                ) : activeAuctions?.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                    <p>No active auctions</p>
                  </div>
                ) : (
                  activeAuctions?.map((listing) => (
                    <AdminAuctionCard
                      key={listing.id}
                      auction={listing}
                      onPause={pauseAuction}
                      onCancel={cancelAuction}
                      onStart={startAuction}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="other" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-gray-600" />
                  Other Auctions (Paused, Ended, Cancelled)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <p className="text-center py-4">Loading...</p>
                ) : otherAuctions?.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                    <p>No other auctions</p>
                  </div>
                ) : (
                  otherAuctions?.map((listing) => (
                    <AdminAuctionCard
                      key={listing.id}
                      auction={listing}
                      onPause={pauseAuction}
                      onCancel={cancelAuction}
                      onStart={startAuction}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {selectedAuction && (
        <AuctionScheduleDialog
          auction={selectedAuction}
          isOpen={isScheduleDialogOpen}
          onClose={handleScheduleClose}
          onScheduled={handleScheduleSuccess}
        />
      )}
    </DashboardLayout>
  );
};

export default AuctionManagement;
