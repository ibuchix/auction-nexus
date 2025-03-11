
import { AuctionCard } from "@/components/admin/AuctionCard";
import { Auction } from "@/types/auction";
import { AlertTriangle } from "lucide-react";

interface AuctionListProps {
  auctions: Auction[];
  isLoading: boolean;
  onPause: (id: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
}

export function AuctionList({ 
  auctions, 
  isLoading, 
  onPause, 
  onCancel 
}: AuctionListProps) {
  if (isLoading) {
    return <div className="text-center py-6">Loading...</div>;
  }
  
  if (auctions.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
        <p>No auctions found</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {auctions.map((auction) => (
        <AuctionCard
          key={auction.id}
          auction={auction}
          onPause={onPause}
          onCancel={onCancel}
        />
      ))}
    </div>
  );
}
