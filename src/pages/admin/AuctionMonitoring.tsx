import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuctionMonitoring } from "@/hooks/useAuctionMonitoring";
import { AuctionCard } from "@/components/admin/AuctionCard";
import { Activity, AlertTriangle, Clock, Gavel } from "lucide-react";

const AuctionMonitoring = () => {
  const { auctions, isLoading, pauseAuction, cancelAuction } = useAuctionMonitoring();

  const endingSoonCount = auctions?.filter(auction => 
    new Date(auction.auction_end_time || '').getTime() - new Date().getTime() < 3600000
  ).length || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Auction Monitoring
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Auctions</CardTitle>
              <Gavel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{auctions?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Bids Today</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {auctions?.reduce((acc, auction) => acc + (auction.bids?.length || 0), 0) || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Ending Soon</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">
                {endingSoonCount}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-6">Loading...</div>
          ) : auctions?.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p>No active auctions found</p>
            </div>
          ) : (
            auctions?.map((auction) => (
              <AuctionCard
                key={auction.id}
                auction={auction}
                onPause={pauseAuction}
                onCancel={cancelAuction}
              />
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AuctionMonitoring;