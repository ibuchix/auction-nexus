import { PLNCurrency } from "@/components/ui/PLNCurrency";
import { useTopBids } from "@/hooks/useTopBids";
import { Badge } from "@/components/ui/badge";

interface CurrentBidDisplayProps {
  carId: string;
  currentBid: number | null | undefined;
  isActive?: boolean;
}

export function CurrentBidDisplay({ carId, currentBid, isActive = false }: CurrentBidDisplayProps) {
  const { topBids, isLoading } = useTopBids(carId, isActive);
  
  if (!isActive) return null;
  
  if (isLoading) {
    return (
      <div className="flex justify-end mt-6 pt-4 border-t">
        <div className="text-sm text-muted-foreground">Loading bids...</div>
      </div>
    );
  }
  
  if (topBids.length === 0) {
    return (
      <div className="flex justify-end mt-6 pt-4 border-t">
        <div className="text-right">
          <p className="text-sm text-muted-foreground">No bids yet</p>
        </div>
      </div>
    );
  }
  
  const rankLabels = ['1st', '2nd', '3rd'];
  const rankColors = [
    'bg-purple-100 text-purple-800 border-purple-300',
    'bg-gray-100 text-gray-800 border-gray-300',
    'bg-orange-100 text-orange-800 border-orange-300'
  ];
  
  return (
    <div className="flex justify-end mt-6 pt-4 border-t">
      <div className="text-right space-y-3 w-full">
        <div className="flex items-center gap-2 justify-end mb-2">
          <p className="text-sm text-muted-foreground">Top Bids</p>
          {isActive && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          )}
        </div>
        
        {topBids.map((bid, index) => (
          <div 
            key={bid.id} 
            className={`flex items-center justify-between gap-3 p-2 rounded-lg ${
              index === 0 ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50'
            }`}
          >
            <Badge variant="outline" className={`${rankColors[index]} text-xs font-semibold shrink-0`}>
              {rankLabels[index]}
            </Badge>
            <div className="flex-1 text-right min-w-0">
              <PLNCurrency 
                value={bid.amount} 
                className={`${
                  index === 0 ? 'text-2xl font-bold text-purple-600' :
                  index === 1 ? 'text-xl font-semibold text-gray-700' :
                  'text-lg font-medium text-gray-600'
                }`}
              />
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                by {bid.dealershipName}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
