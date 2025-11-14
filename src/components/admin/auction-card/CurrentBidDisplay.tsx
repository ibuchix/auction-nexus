import { PLNCurrency } from "@/components/ui/PLNCurrency";

interface CurrentBidDisplayProps {
  currentBid: number | null | undefined;
  dealerName?: string | null;
  isActive?: boolean;
}

export function CurrentBidDisplay({ currentBid, dealerName, isActive = false }: CurrentBidDisplayProps) {
  if (!isActive) return null;
  
  const hasBid = currentBid && currentBid > 0;
  
  // Debug logging
  console.log('CurrentBidDisplay render:', {
    currentBid,
    type: typeof currentBid,
    isActive,
    dealerName,
    formattedTest: (currentBid || 0).toLocaleString('pl-PL')
  });
  
  return (
    <div className="flex justify-end mt-6 pt-4 border-t">
      <div className="text-right">
        <p className="text-sm text-muted-foreground mb-1">Current Bid</p>
        <PLNCurrency 
          value={currentBid || 0} 
          className="text-3xl font-bold text-purple-600"
        />
        {hasBid && dealerName && (
          <p className="text-sm text-muted-foreground mt-1">
            by {dealerName}
          </p>
        )}
      </div>
    </div>
  );
}
