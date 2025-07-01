
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bid } from "@/types/auction";
import { User, Clock, ArrowDown, ArrowUp } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface BidHistoryListProps {
  bids: Bid[];
  currentUserId?: string;
  maxItems?: number;
}

export function BidHistoryList({ 
  bids, 
  currentUserId,
  maxItems = 5
}: BidHistoryListProps) {
  const [showAll, setShowAll] = useState(false);
  
  if (!bids || bids.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No bids have been placed yet
      </div>
    );
  }
  
  // Sort bids by created_at in descending order (most recent first)
  const sortedBids = [...bids].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  
  const displayedBids = showAll ? sortedBids : sortedBids.slice(0, maxItems);
  
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium mb-2">Bid History</h3>
      
      <div className="space-y-2">
        {displayedBids.map((bid, index) => {
          const isCurrentUser = bid.dealer_id === currentUserId;
          const prevBid = sortedBids[index + 1];
          const bidIncrease = prevBid ? bid.amount - prevBid.amount : bid.amount;
          
          return (
            <div 
              key={bid.id} 
              className={`flex items-center justify-between p-2 rounded-md ${
                isCurrentUser ? "bg-blue-50" : "bg-gray-50"
              } ${bid.status === 'outbid' ? "opacity-75" : ""}`}
            >
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-full ${
                  isCurrentUser ? "bg-blue-100" : "bg-gray-200"
                }`}>
                  <User className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium">
                      {isCurrentUser ? "You" : "Bidder"}
                    </span>
                    {bid.status === 'active' && (
                      <Badge variant="secondary" className="gap-1 text-xs py-0 h-5">
                        Leading
                      </Badge>
                    )}
                    {bid.status === 'outbid' && (
                      <Badge variant="outline" className="gap-1 text-xs py-0 h-5 opacity-70">
                        Outbid
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span title={format(new Date(bid.created_at), 'PPpp')}>
                      {formatDistanceToNow(new Date(bid.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-mono font-medium">
                  {bid.amount.toLocaleString()}
                </div>
                <div className="text-xs flex items-center justify-end gap-1">
                  {bidIncrease > 0 && (
                    <>
                      <ArrowUp className="h-3 w-3 text-emerald-500" />
                      <span className="text-emerald-600">+{bidIncrease.toLocaleString()}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {sortedBids.length > maxItems && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-2"
        >
          {showAll ? (
            <>
              <ArrowUp className="h-4 w-4 mr-1" />
              Show Less
            </>
          ) : (
            <>
              <ArrowDown className="h-4 w-4 mr-1" />
              Show All ({sortedBids.length}) Bids
            </>
          )}
        </Button>
      )}
    </div>
  );
}
