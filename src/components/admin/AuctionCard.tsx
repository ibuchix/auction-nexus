
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, DollarSign, Users } from "lucide-react";
import { Auction } from "@/types/auction";
import { AuctionStatusActions } from "./auction-card/AuctionStatusActions";
import { AuctionStatus } from "@/types/auction";

interface AuctionCardProps {
  auction: Auction;
  onPause: (id: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
  onEndImmediately: (id: string) => Promise<void>;
}

export function AuctionCard({ auction, onPause, onCancel, onEndImmediately }: AuctionCardProps) {
  const timeLeft = new Date(auction.auction_end_time || '').getTime() - new Date().getTime();
  const isEndingSoon = timeLeft < 3600000; // Less than 1 hour

  const handlePause = async () => {
    await onPause(auction.id);
  };

  const handleCancel = async () => {
    await onCancel(auction.id);
  };

  const handleEndImmediately = async () => {
    await onEndImmediately(auction.id);
  };

  const metrics = auction.auction_metrics?.[0] || { unique_bidders: 0 };

  return (
    <Card className={`hover:shadow-md transition-shadow ${isEndingSoon ? 'border-yellow-500' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{auction.title}</h3>
            <p className="text-sm text-muted-foreground">
              Ends: {new Date(auction.auction_end_time || '').toLocaleString()}
            </p>
          </div>
        </CardTitle>
        <AuctionStatusActions
          status={(auction.auction_status || 'active') as AuctionStatus}
          startTime={auction.created_at}
          endTime={auction.auction_end_time}
          isManuallyControlled={auction.is_manually_controlled || false}
          onStart={handlePause}
          onPause={handlePause}
          onCancel={handleCancel}
          onEndImmediately={handleEndImmediately}
        />
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mt-2">
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            <span>
              {auction.bids?.[0]?.amount || auction.reserve_price}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>
              {metrics.unique_bidders} bidders
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span className={isEndingSoon ? 'text-yellow-500' : ''}>
              {isEndingSoon ? 'Ending Soon' : 'Active'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
