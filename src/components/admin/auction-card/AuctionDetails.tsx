
import { Clock } from "lucide-react";
import { PLNCurrency } from "@/components/ui/PLNCurrency";

interface AuctionDetailsProps {
  price: number;
  endTime: string;
  notes?: string;
  reservePrice?: number;
  valuation_data?: any;
  createdAt?: string;
}

export function AuctionDetails({ price, endTime, notes, reservePrice, valuation_data, createdAt }: AuctionDetailsProps) {
  // Use the reserve price from valuation_data if it exists, otherwise fall back to other prices
  const displayPrice = valuation_data?.reservePrice || reservePrice || price;
  
  return (
    <>
      <div className="flex gap-4">
        <div className="flex items-center gap-1">
          <PLNCurrency value={displayPrice} className="font-semibold" />
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>
            {endTime ? (
              <>Ends: {new Date(endTime).toLocaleString()}</>
            ) : (
              <>Listed: {new Date(createdAt || Date.now()).toLocaleString()}</>
            )}
          </span>
        </div>
      </div>
      {notes && (
        <div className="mt-2">
          <p className="text-sm text-muted-foreground">{notes}</p>
        </div>
      )}
    </>
  );
}
