import { PLNCurrency } from "@/components/ui/PLNCurrency";

interface CurrentBidDisplayProps {
  currentBid: number | null | undefined;
}

export function CurrentBidDisplay({ currentBid }: CurrentBidDisplayProps) {
  return (
    <div className="flex justify-end mt-6 pt-4 border-t">
      <div className="text-right">
        <p className="text-sm text-muted-foreground mb-1">Current Bid</p>
        <PLNCurrency 
          value={currentBid || 0} 
          className="text-3xl font-bold text-purple-600"
        />
      </div>
    </div>
  );
}
