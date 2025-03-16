
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle2 } from "lucide-react";
import { SystemStatusProps } from "./types";
import { OperationCards } from "./OperationCards";
import { SystemHealthCards } from "./SystemHealthCards";
import { StatusAlerts } from "./StatusAlerts";
import { SystemStatusSkeleton } from "./SystemStatusSkeleton";

export function SystemStatus({
  isLoading,
  isRefreshing,
  failedOperations,
  systemHealth,
  operationsStatus,
  onRefresh,
  onHealthCheck
}: SystemStatusProps) {
  if (isLoading) {
    return <SystemStatusSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">System Status</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh} 
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onHealthCheck} 
            disabled={isRefreshing}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Check Health
          </Button>
        </div>
      </div>
      
      <StatusAlerts 
        failedOperations={failedOperations} 
        systemHealth={systemHealth} 
      />
      
      <OperationCards operationsStatus={operationsStatus} />
      
      <SystemHealthCards systemHealth={systemHealth} />
    </div>
  );
}
