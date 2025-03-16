
import { Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ExistingProxyBidProps {
  amount: number;
  onCancel: () => Promise<void>;
  isSubmitting: boolean;
}

export function ExistingProxyBid({ 
  amount, 
  onCancel, 
  isSubmitting 
}: ExistingProxyBidProps) {
  return (
    <div className="bg-blue-50 p-3 rounded-md flex items-start gap-3 mb-4">
      <Zap className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
      <div>
        <h4 className="font-medium text-blue-800 flex items-center gap-2">
          Active Proxy Bid
          <Badge variant="outline" className="bg-blue-100">
            Up to {amount?.toLocaleString()}
          </Badge>
        </h4>
        <p className="text-sm text-blue-700 mt-1">
          Your proxy will automatically outbid others up to your maximum amount
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onCancel}
          disabled={isSubmitting}
          className="mt-2 text-blue-700 border-blue-300 hover:bg-blue-100"
        >
          Cancel Proxy Bid
        </Button>
      </div>
    </div>
  );
}
