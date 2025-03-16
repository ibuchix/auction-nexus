import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Calculator, 
  AlertCircle, 
  Info, 
  CheckCircle2, 
  DollarSign,
  Zap
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
        <div className="bg-blue-50 p-3 rounded-md flex items-start gap-3 mb-4">
          <Zap className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-800 flex items-center gap-2">
              Active Proxy Bid
              <Badge variant="outline" className="bg-blue-100">
                Up to {existingProxyBid?.toLocaleString()}
              </Badge>
            </h4>
            <p className="text-sm text-blue-700 mt-1">
              Your proxy will automatically outbid others up to your maximum amount
            </p>
            {onDeleteProxyBid && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCancelProxyBid}
                disabled={isSubmitting}
                className="mt-2 text-blue-700 border-blue-300 hover:bg-blue-100"
              >
                Cancel Proxy Bid
              </Button>
            )}
          </div>
        </div>
      )}
      
      <form onSubmit={handleBidSubmit} className="space-y-4">
        <div>
          <Label htmlFor="bidAmount" className="text-sm font-medium">
            Bid Amount
          </Label>
          <div className="mt-1.5 relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              id="bidAmount"
              type="number"
              min={currentBid + bidIncrement}
              step={bidIncrement}
              value={bidAmount}
              onChange={(e) => setBidAmount(Number(e.target.value))}
              className="pl-9"
              required
            />
            <div className="text-xs text-muted-foreground mt-1">
              Current bid: {currentBid.toLocaleString()} • Minimum increment: {bidIncrement.toLocaleString()}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="proxy-bidding"
            checked={useProxyBidding}
            onCheckedChange={setUseProxyBidding}
          />
          <Label htmlFor="proxy-bidding" className="font-medium cursor-pointer">
            Use Proxy Bidding
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Proxy bidding automatically places bids on your behalf up to your maximum amount.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {useProxyBidding && (
          <div className="pl-6 border-l-2 border-blue-200 space-y-3">
            <div>
              <Label htmlFor="maxProxyAmount" className="text-sm font-medium">
                Maximum Proxy Bid Amount
              </Label>
              <div className="mt-1.5 relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="maxProxyAmount"
                  type="number"
                  min={bidAmount}
                  step={bidIncrement}
                  value={maxProxyAmount}
                  onChange={(e) => setMaxProxyAmount(Number(e.target.value))}
                  className="pl-9"
                  required={useProxyBidding}
                />
              </div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700">
              <div className="flex gap-2 items-center">
                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                <span>System will bid automatically up to your maximum</span>
              </div>
              <div className="flex gap-2 items-center mt-1">
                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                <span>You'll only pay the minimum needed to win</span>
              </div>
            </div>
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
