
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BidAmountInput } from "./BidAmountInput";

interface SimpleBidControlsProps {
  auctionId: string;
  dealerId: string;
  currentBid: number;
  bidIncrement: number;
  onPlaceBid: (amount: number) => Promise<void>;
  className?: string;
}

export function SimpleBidControls({
  auctionId,
  dealerId,
  currentBid,
  bidIncrement = 250,
  onPlaceBid,
  className
}: SimpleBidControlsProps) {
  const [bidAmount, setBidAmount] = useState(currentBid + bidIncrement);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (bidAmount <= currentBid) {
      toast.error(`Bid must be at least ${currentBid + bidIncrement}`);
      return;
    }
    
    try {
      setIsSubmitting(true);
      await onPlaceBid(bidAmount);
      setBidAmount(currentBid + bidIncrement);
    } catch (error) {
      console.error("Bid placement error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <form onSubmit={handleBidSubmit} className="space-y-4">
        <BidAmountInput 
          bidAmount={bidAmount}
          currentBid={currentBid}
          bidIncrement={bidIncrement}
          onChange={setBidAmount}
        />
        
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
