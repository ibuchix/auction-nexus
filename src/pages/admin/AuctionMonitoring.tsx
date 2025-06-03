
import { useAuctionMonitoring } from "@/hooks/useAuctionMonitoring";
import { useState, useMemo } from "react";
import { AuctionMetrics } from "@/components/admin/auction-monitoring/AuctionMetrics";
import { AuctionFilters } from "@/components/admin/auction-monitoring/AuctionFilters";
import { AuctionList } from "@/components/admin/auction-monitoring/AuctionList";
import { Auction } from "@/types/auction";

const AuctionMonitoring = () => {
  const { auctions, isLoading, pauseAuction, cancelAuction } = useAuctionMonitoring();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("end_time");

  const filteredAndSortedAuctions = useMemo(() => {
    if (!auctions) return [];

    return auctions
      .filter(auction => {
        const matchesSearch = auction.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
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
            return (b.bids?.[0]?.amount || b.reserve_price || 0) - (a.bids?.[0]?.amount || a.reserve_price || 0);
          default:
            return 0;
        }
      });
  }, [auctions, searchTerm, statusFilter, sortBy]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        Auction Monitoring
      </h1>

      <AuctionMetrics auctions={auctions} />

      <AuctionFilters
        statusFilter={statusFilter}
        sortBy={sortBy}
        onStatusChange={setStatusFilter}
        onSortChange={setSortBy}
        onSearch={setSearchTerm}
      />

      <AuctionList
        auctions={filteredAndSortedAuctions}
        isLoading={isLoading}
        onPause={pauseAuction}
        onCancel={cancelAuction}
      />
    </div>
  );
};

export default AuctionMonitoring;
