import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuctionMonitoring } from "@/hooks/useAuctionMonitoring";
import { AuctionCard } from "@/components/admin/AuctionCard";
import { StatCard } from "@/components/StatCard";
import { 
  Activity, AlertTriangle, Clock, Gavel, 
  Users, DollarSign, TrendingUp, AlertCircle,
  Search, Filter, SlidersHorizontal
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useState, useMemo } from "react";
import debounce from "lodash/debounce";

const AuctionMonitoring = () => {
  const { auctions, isLoading, pauseAuction, cancelAuction } = useAuctionMonitoring();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("end_time");

  // Memoized filtering and sorting logic
  const filteredAndSortedAuctions = useMemo(() => {
    if (!auctions) return [];

    return auctions
      .filter(auction => {
        const matchesSearch = auction.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || auction.auction_status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "end_time":
            return new Date(a.auction_end_time || '').getTime() - new Date(b.auction_end_time || '').getTime();
          case "bids":
            return (b.bids?.length || 0) - (a.bids?.length || 0);
          case "value":
            return (b.bids?.[0]?.amount || b.price) - (a.bids?.[0]?.amount || a.price);
          default:
            return 0;
        }
      });
  }, [auctions, searchTerm, statusFilter, sortBy]);

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

  // Debounced search handler
  const handleSearch = debounce((value: string) => {
    setSearchTerm(value);
  }, 300);

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

        {/* Advanced Search and Filtering */}
        <div className="flex flex-col md:flex-row gap-4 bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search auctions..."
                className="pl-10"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-4">
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="ended">Ended</option>
            </Select>
            <Select
              value={sortBy}
              onValueChange={setSortBy}
            >
              <option value="end_time">End Time</option>
              <option value="bids">Number of Bids</option>
              <option value="value">Current Value</option>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-6">Loading...</div>
          ) : filteredAndSortedAuctions.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p>No auctions found</p>
            </div>
          ) : (
            filteredAndSortedAuctions.map((auction) => (
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