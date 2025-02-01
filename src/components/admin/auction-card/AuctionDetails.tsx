import { Clock, DollarSign } from "lucide-react";

interface AuctionDetailsProps {
  price: number;
  endTime: string;
  notes?: string;
}

export function AuctionDetails({ price, endTime, notes }: AuctionDetailsProps) {
  return (
    <>
      <div className="flex gap-4">
        <div className="flex items-center gap-1">
          <DollarSign className="h-4 w-4" />
          <span>{price?.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>
            Ends: {new Date(endTime || '').toLocaleString()}
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