import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuctionMonitoring } from "@/hooks/useAuctionMonitoring";
import { AuctionCard } from "@/components/admin/AuctionCard";
import { StatCard } from "@/components/StatCard";
import { 
  Activity, AlertTriangle, Clock, Gavel, 
  Users, DollarSign, TrendingUp, AlertCircle 
} from "lucide-react";

const AuctionMonitoring = () => {
  const { auctions, isLoading, pauseAuction, cancelAuction } = useAuctionMonitoring();

  // Calculate metrics
  const totalBidsToday = auctions?.reduce((acc, auction) => {
    return acc + auction.bids.filter(bid => {
      const bidDate = new Date(bid.created_at);
      const today = new Date();
      return bidDate.toDateString() === today.toDateString();
    }).length;
  }, 0) || 0;

  const activeBidders = new Set(
    auctions?.flatMap(auction => 
      auction.bids.map(bid => bid.dealer_id)
    )
  ).size;

  const totalValue = auctions?.reduce((acc, auction) => {
    const highestBid = auction.bids[0]?.amount || auction.price;
    return acc + highestBid;
  }, 0) || 0;

  const endingSoonCount = auctions?.filter(auction => 
    new Date(auction.auction_end_time || '').getTime() - new Date().getTime() < 3600000
  ).length || 0;

  const errorCount = auctions?.reduce((acc, auction) => {
    return acc + auction.bids.filter(bid => bid.status === 'error').length;
  }, 0) || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Auction Monitoring
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Active Auctions"
            value={auctions?.length || 0}
            icon={Gavel}
          />
          <StatCard
            title="Total Bids Today"
            value={totalBidsToday}
            icon={Activity}
            trend={{
              value: 12,
              isPositive: true
            }}
          />
          <StatCard
            title="Active Bidders"
            value={activeBidders}
            icon={Users}
          />
          <StatCard
            title="Total Value"
            value={`$${totalValue.toLocaleString()}`}
            icon={DollarSign}
          />
          <StatCard
            title="Ending Soon"
            value={endingSoonCount}
            icon={Clock}
          />
          <StatCard
            title="Performance"
            value="98%"
            icon={TrendingUp}
            trend={{
              value: 2,
              isPositive: true
            }}
          />
          <StatCard
            title="Error Rate"
            value={`${errorCount} errors`}
            icon={AlertCircle}
            trend={{
              value: 5,
              isPositive: false
            }}
          />
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