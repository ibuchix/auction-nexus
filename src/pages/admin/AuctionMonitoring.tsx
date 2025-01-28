import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Activity, AlertTriangle, Ban, Clock, 
  DollarSign, Flag, Gavel, Users 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const AuctionMonitoring = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch active auctions
  const { data: activeAuctions } = useQuery({
    queryKey: ['activeAuctions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cars')
        .select(`
          *,
          bids (
            amount,
            dealer_id,
            created_at
          ),
          auction_metrics (
            total_bids,
            unique_bidders,
            final_price
          )
        `)
        .eq('is_auction', true)
        .eq('auction_status', 'active')
        .order('auction_end_time', { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  const handleCancelAuction = async (auctionId: string) => {
    try {
      const { error } = await supabase
        .from('cars')
        .update({ auction_status: 'cancelled' })
        .eq('id', auctionId);

      if (error) throw error;

      toast({
        title: "Auction Cancelled",
        description: "The auction has been successfully cancelled.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel the auction. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Auction Monitoring
          </h1>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/admin/analytics')}>
              View Analytics
            </Button>
            <Button onClick={() => navigate('/admin/audit-logs')}>
              View Logs
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Auctions</CardTitle>
              <Gavel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeAuctions?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Bids Today</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeAuctions?.reduce((acc, auction) => acc + (auction.bids?.length || 0), 0) || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Flagged Auctions</CardTitle>
              <Flag className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">0</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Ending Soon</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">
                {activeAuctions?.filter(auction => 
                  new Date(auction.auction_end_time).getTime() - new Date().getTime() < 3600000
                ).length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Active Auctions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeAuctions?.map((auction) => (
                <Card key={auction.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{auction.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Ends: {new Date(auction.auction_end_time).toLocaleString()}
                      </p>
                      <div className="flex gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span>
                            {auction.bids?.[0]?.amount || auction.price}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>
                            {auction.auction_metrics?.[0]?.unique_bidders || 0} bidders
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity className="h-4 w-4" />
                          <span>
                            {auction.bids?.length || 0} bids
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/auctions/manage/${auction.id}`)}
                      >
                        Manage
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelAuction(auction.id)}
                      >
                        <Ban className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              {(!activeAuctions || activeAuctions.length === 0) && (
                <div className="text-center py-6 text-muted-foreground">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                  <p>No active auctions found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AuctionMonitoring;