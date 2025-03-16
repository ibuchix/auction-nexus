
import { useEffect } from "react";
import { ProxyBidControls } from "./ProxyBidControls";
import { BidHistoryList } from "./BidHistoryList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBiddingOperations } from "@/hooks/useBiddingOperations";
import { Bid } from "@/types/auction";
import { Loader2, AlertCircle } from "lucide-react";
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
  const {
    isPlacingBid,
    isCancellingBid,
    isLoadingProxyBid,
    existingProxyBid,
    submitBid,
    cancelProxyBid,
    fetchProxyBid
  } = useBiddingOperations(auctionId, dealerId);

  useEffect(() => {
    fetchProxyBid();
  }, [auctionId, dealerId]);

  // Create wrapper functions to adapt return types
  const handlePlaceBid = async (amount: number, useProxy: boolean, maxProxyAmount: number): Promise<void> => {
    await submitBid(amount, useProxy, maxProxyAmount);
  };

  const handleDeleteProxyBid = async (): Promise<void> => {
    await cancelProxyBid();
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
            
            {isLoadingProxyBid ? (
              <div className="py-8 flex justify-center items-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <ProxyBidControls
                auctionId={auctionId}
                dealerId={dealerId}
                currentBid={currentBid}
                bidIncrement={bidIncrement}
                existingProxyBid={existingProxyBid}
                onPlaceBid={handlePlaceBid}
                onDeleteProxyBid={handleDeleteProxyBid}
                className={!isAuctionActive ? "opacity-50 pointer-events-none" : ""}
              />
            )}
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
