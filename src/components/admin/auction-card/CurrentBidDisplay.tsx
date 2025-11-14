import { PLNCurrency } from "@/components/ui/PLNCurrency";
import { useEffect, useState } from "react";

interface CurrentBidDisplayProps {
  currentBid: number | null | undefined;
  dealerName?: string | null;
  isActive?: boolean;
}

export function CurrentBidDisplay({ currentBid, dealerName, isActive = false }: CurrentBidDisplayProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [prevBid, setPrevBid] = useState(currentBid);
  
  useEffect(() => {
    if (currentBid !== prevBid && currentBid && prevBid) {
      console.log('💸 [Bid Update] Bid changed:', {
        from: prevBid,
        to: currentBid,
        difference: currentBid - prevBid
      });
      setIsUpdating(true);
      const timer = setTimeout(() => setIsUpdating(false), 1000);
      setPrevBid(currentBid);
      return () => clearTimeout(timer);
    }
    setPrevBid(currentBid);
  }, [currentBid]);
  
  if (!isActive) return null;
  
  const hasBid = currentBid && currentBid > 0;
  
  return (
    <div className="flex justify-end mt-6 pt-4 border-t">
      <div className="text-right">
        <div className="flex items-center gap-2 justify-end mb-1">
          <p className="text-sm text-muted-foreground">Current Bid</p>
          {isActive && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          )}
        </div>
        <div className={`transition-all duration-300 ${isUpdating ? 'scale-110' : 'scale-100'}`}>
          <PLNCurrency 
            value={currentBid || 0} 
            className={`text-3xl font-bold ${isUpdating ? 'text-green-600' : 'text-purple-600'} transition-colors duration-300`}
          />
        </div>
        {hasBid && dealerName && (
          <p className="text-sm text-muted-foreground mt-1">
            by {dealerName}
          </p>
        )}
      </div>
    </div>
  );
}
