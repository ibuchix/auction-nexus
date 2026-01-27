import { PLNCurrency } from "@/components/ui/PLNCurrency";
import { useTopBids } from "@/hooks/useTopBids";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, AlertTriangle } from "lucide-react";

interface CurrentBidDisplayProps {
  carId: string;
  currentBid: number | null | undefined;
  isActive?: boolean;
  sellerAcceptablePrice?: number | null;
}

export function CurrentBidDisplay({ carId, currentBid, isActive = false, sellerAcceptablePrice }: CurrentBidDisplayProps) {
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
          {sellerAcceptablePrice && sellerAcceptablePrice > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Seller expects: <PLNCurrency value={sellerAcceptablePrice} className="font-medium" />
            </p>
          )}
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

  const highestBid = topBids[0]?.amount || 0;
  const hasSellerPrice = sellerAcceptablePrice && sellerAcceptablePrice > 0;
  const meetsSellerPrice = hasSellerPrice && highestBid >= sellerAcceptablePrice;
  const priceGap = hasSellerPrice ? sellerAcceptablePrice - highestBid : 0;
  
  return (
    <Accordion type="single" collapsible className="w-full mt-6 pt-4 border-t">
      <AccordionItem value="top-bids" className="border-none">
        <AccordionTrigger className="py-2 hover:no-underline">
          <div className="flex items-center gap-2 justify-between w-full">
            <p className="text-sm font-semibold">Top Bids ({topBids.length})</p>
            {isActive && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3 w-full pt-2">
            {/* Seller's Preferred Price Row */}
            {hasSellerPrice && (
              <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-iris-light border border-iris/20">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Seller's Preferred Price</span>
                  {meetsSellerPrice ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  )}
                </div>
                <div className="text-right">
                  <PLNCurrency 
                    value={sellerAcceptablePrice} 
                    className="text-lg font-bold text-iris"
                  />
                  {!meetsSellerPrice && priceGap > 0 && (
                    <p className="text-xs text-amber-600 mt-0.5">
                      <PLNCurrency value={priceGap} className="font-medium" /> below
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Top Bids List */}
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
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
