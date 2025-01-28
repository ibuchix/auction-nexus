import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database } from "@/integrations/supabase/types";
import { Ban, Clock, DollarSign, Pause, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Auction = Database['public']['Tables']['cars']['Row'] & {
  bids: Database['public']['Tables']['bids']['Row'][];
  auction_metrics: Database['public']['Tables']['auction_metrics']['Row'][];
};

interface AuctionCardProps {
  auction: Auction;
  onPause: (id: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
}

export function AuctionCard({ auction, onPause, onCancel }: AuctionCardProps) {
  const { toast } = useToast();
  const timeLeft = new Date(auction.auction_end_time || '').getTime() - new Date().getTime();
  const isEndingSoon = timeLeft < 3600000; // Less than 1 hour

  const handlePause = async () => {
    try {
      await onPause(auction.id);
      toast({
        title: "Auction Paused",
        description: "The auction has been paused successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to pause the auction.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = async () => {
    try {
      await onCancel(auction.id);
      toast({
        title: "Auction Cancelled",
        description: "The auction has been cancelled successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel the auction.",
        variant: "destructive",
      });
    }
  };

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
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePause}
            >
              <Pause className="h-4 w-4 mr-1" />
              Pause
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleCancel}
            >
              <Ban className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
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