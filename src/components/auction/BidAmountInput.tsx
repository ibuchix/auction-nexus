
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DollarSign } from "lucide-react";

interface BidAmountInputProps {
  bidAmount: number;
  currentBid: number;
  bidIncrement: number;
  onChange: (value: number) => void;
}

export function BidAmountInput({
  bidAmount,
  currentBid,
  bidIncrement,
  onChange
}: BidAmountInputProps) {
  return (
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
          onChange={(e) => onChange(Number(e.target.value))}
          className="pl-9"
          required
        />
        <div className="text-xs text-muted-foreground mt-1">
          Current bid: {currentBid.toLocaleString()} • Minimum increment: {bidIncrement.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
