
import { Info, CheckCircle2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ProxyBidInfo() {
  return (
    <div className="flex items-center space-x-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>Proxy bidding automatically places bids on your behalf up to your maximum amount.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

export function ProxyBidBenefits() {
  return (
    <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700">
      <div className="flex gap-2 items-center">
        <CheckCircle2 className="h-4 w-4 text-blue-500" />
        <span>System will bid automatically up to your maximum</span>
      </div>
      <div className="flex gap-2 items-center mt-1">
        <CheckCircle2 className="h-4 w-4 text-blue-500" />
        <span>You'll only pay the minimum needed to win</span>
      </div>
    </div>
  );
}
