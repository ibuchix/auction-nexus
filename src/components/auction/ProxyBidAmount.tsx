
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DollarSign } from "lucide-react";

interface ProxyBidAmountProps {
  maxProxyAmount: number;
  bidAmount: number;
  bidIncrement: number;
  onChange: (value: number) => void;
}

export function ProxyBidAmount({
  maxProxyAmount,
  bidAmount,
  bidIncrement,
  onChange
}: ProxyBidAmountProps) {
  return (
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
          onChange={(e) => onChange(Number(e.target.value))}
          className="pl-9"
          required
        />
      </div>
    </div>
  );
}
