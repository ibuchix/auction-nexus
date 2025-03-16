
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OperationStatus } from "./types";
import { CheckCircle2, AlertCircle, CircleAlert } from "lucide-react";

interface OperationCardsProps {
  operationsStatus: Record<string, OperationStatus>;
}

export function OperationCards({ operationsStatus }: OperationCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Object.entries(operationsStatus).map(([key, status]) => (
        <Card key={key} className={`border-l-4 ${
          status.status === 'success' ? 'border-l-green-500' : 
          status.status === 'error' ? 'border-l-red-500' :
          status.status === 'warning' ? 'border-l-amber-500' : 'border-l-gray-300'
        }`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              {status.status === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
              {status.status === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
              {status.status === 'warning' && <CircleAlert className="h-5 w-5 text-amber-500" />}
              {status.status === 'unknown' && <CircleAlert className="h-5 w-5 text-gray-400" />}
              {key === 'closeAuctions' ? 'Auction Closure' : 
               key === 'proxyBids' ? 'Proxy Bidding' : 'Auction Startup'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Last run: {status.lastRun !== 'Unknown' ? 
                new Date(status.lastRun).toLocaleString() : 'Unknown'}
            </p>
            {status.details && (
              <p className="text-sm text-red-500 mt-1">{status.details}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
