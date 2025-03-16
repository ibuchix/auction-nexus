
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { BidAmountInput } from "./BidAmountInput";
import { ProxyBidAmount } from "./ProxyBidAmount";
import { ProxyBidInfo, ProxyBidBenefits } from "./ProxyBidInfo";
import { ExistingProxyBid } from "./ExistingProxyBid";

interface ProxyBidControlsProps {
  auctionId: string;
  dealerId: string;
  currentBid: number;
  bidIncrement: number;
  existingProxyBid: number | null;
  onPlaceBid: (amount: number, useProxy: boolean, maxProxyAmount: number | null) => Promise<void>;
  onDeleteProxyBid?: () => Promise<void>;
  className?: string;
}

export function ProxyBidControls({
  auctionId,
  dealerId,
  currentBid,
  bidIncrement = 250,
  existingProxyBid,
  onPlaceBid,
  onDeleteProxyBid,
  className
}: ProxyBidControlsProps) {
  const [bidAmount, setBidAmount] = useState(currentBid + bidIncrement);
  const [useProxyBidding, setUseProxyBidding] = useState(!!existingProxyBid);
  const [maxProxyAmount, setMaxProxyAmount] = useState(existingProxyBid || currentBid + bidIncrement * 4);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasExistingProxy = existingProxyBid !== null;

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (bidAmount <= currentBid) {
      toast.error(`Bid must be at least ${currentBid + bidIncrement}`);
      return;
    }
    
    if (useProxyBidding && (!maxProxyAmount || maxProxyAmount < bidAmount)) {
      toast.error("Maximum proxy amount must be greater than or equal to your bid");
      return;
    }
    
    try {
      setIsSubmitting(true);
      await onPlaceBid(
        bidAmount, 
        useProxyBidding, 
        useProxyBidding ? maxProxyAmount : null
      );
      
      setBidAmount(currentBid + bidIncrement);
    } catch (error) {
      console.error("Bid placement error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelProxyBid = async () => {
    if (!onDeleteProxyBid) return;
    
    try {
      setIsSubmitting(true);
      await onDeleteProxyBid();
      setUseProxyBidding(false);
      toast.success("Proxy bid cancelled");
    } catch (error) {
      console.error("Error cancelling proxy bid:", error);
      toast.error("Failed to cancel proxy bid");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {hasExistingProxy && (
        <ExistingProxyBid 
          amount={existingProxyBid as number}
          onCancel={handleCancelProxyBid}
          isSubmitting={isSubmitting}
        />
      )}
      
      <form onSubmit={handleBidSubmit} className="space-y-4">
        <BidAmountInput 
          bidAmount={bidAmount}
          currentBid={currentBid}
          bidIncrement={bidIncrement}
          onChange={setBidAmount}
        />
        
        <div className="flex items-center space-x-2">
          <Switch
            id="proxy-bidding"
            checked={useProxyBidding}
            onCheckedChange={setUseProxyBidding}
          />
          <Label htmlFor="proxy-bidding" className="font-medium cursor-pointer">
            Use Proxy Bidding
          </Label>
          <ProxyBidInfo />
        </div>
        
        {useProxyBidding && (
          <div className="pl-6 border-l-2 border-blue-200 space-y-3">
            <ProxyBidAmount
              maxProxyAmount={maxProxyAmount}
              bidAmount={bidAmount}
              bidIncrement={bidIncrement}
              onChange={setMaxProxyAmount}
            />
            
            <ProxyBidBenefits />
          </div>
        )}
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Place Bid"}
        </Button>
      </form>
    </div>
  );
}
