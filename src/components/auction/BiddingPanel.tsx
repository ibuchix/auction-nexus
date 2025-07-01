
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SimpleBidControls } from "./SimpleBidControls";
import { BidHistoryList } from "./BidHistoryList";
import { useBiddingOperations } from "@/hooks/useBiddingOperations";
import { Bid } from "@/types/auction";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BiddingPanelProps {
  auctionId: string;
  dealerId: string;
  currentBid: number;
  bidIncrement?: number;
  bids: Bid[];
  isAuctionActive: boolean;
  className?: string;
}

export function BiddingPanel({
  auctionId,
  dealerId,
  currentBid,
  bidIncrement = 250,
  bids,
  isAuctionActive,
  className
}: BiddingPanelProps) {
  const { isPlacingBid, submitBid } = useBiddingOperations(auctionId, dealerId);

  const handlePlaceBid = async (amount: number): Promise<void> => {
    await submitBid(amount);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Place Your Bid</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="bid" className="space-y-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="bid">Place Bid</TabsTrigger>
            <TabsTrigger value="history">Bid History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="bid" className="space-y-4">
            {!isAuctionActive && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This auction is no longer active. Bidding has ended.
                </AlertDescription>
              </Alert>
            )}
            
            <SimpleBidControls
              auctionId={auctionId}
              dealerId={dealerId}
              currentBid={currentBid}
              bidIncrement={bidIncrement}
              onPlaceBid={handlePlaceBid}
              className={!isAuctionActive ? "opacity-50 pointer-events-none" : ""}
            />
          </TabsContent>
          
          <TabsContent value="history">
            <BidHistoryList 
              bids={bids} 
              currentUserId={dealerId}
              maxItems={7}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
