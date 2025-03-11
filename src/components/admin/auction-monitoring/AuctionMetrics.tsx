
import { StatCard } from "@/components/StatCard";
import { 
  Activity, Clock, Gavel, 
  Users, DollarSign, TrendingUp, AlertCircle
} from "lucide-react";
import { useMemo } from "react";
import { Auction } from "@/types/auction";

interface AuctionMetricsProps {
  auctions: Auction[] | undefined;
}

export function AuctionMetrics({ auctions }: AuctionMetricsProps) {
  // Calculate metrics (with performance optimization using useMemo)
  const metrics = useMemo(() => {
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

    return {
      totalBidsToday,
      activeBidders,
      totalValue,
      endingSoonCount,
      errorCount
    };
  }, [auctions]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Active Auctions"
        value={auctions?.length || 0}
        icon={Gavel}
      />
      <StatCard
        title="Total Bids Today"
        value={metrics.totalBidsToday}
        icon={Activity}
        trend={{
          value: 12,
          isPositive: true
        }}
      />
      <StatCard
        title="Active Bidders"
        value={metrics.activeBidders}
        icon={Users}
      />
      <StatCard
        title="Total Value"
        value={`$${metrics.totalValue.toLocaleString()}`}
        icon={DollarSign}
      />
      <StatCard
        title="Ending Soon"
        value={metrics.endingSoonCount}
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
        value={`${metrics.errorCount} errors`}
        icon={AlertCircle}
        trend={{
          value: 5,
          isPositive: false
        }}
      />
    </div>
  );
}
