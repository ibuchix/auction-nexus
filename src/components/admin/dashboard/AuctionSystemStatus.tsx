
import { useSystemStatus } from "./system-status/useSystemStatus";
import { SystemStatus } from "./system-status/SystemStatus";
import { Card, CardContent } from "@/components/ui/card";

export function AuctionSystemStatus() {
  const {
    isLoading,
    isRefreshing,
    failedOperations,
    systemHealth,
    operationsStatus,
    refreshData,
    triggerHealthCheck
  } = useSystemStatus();

  return (
    <Card>
      <CardContent className="p-6">
        <SystemStatus
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          failedOperations={failedOperations}
          systemHealth={systemHealth}
          operationsStatus={operationsStatus}
          onRefresh={refreshData}
          onHealthCheck={triggerHealthCheck}
        />
      </CardContent>
    </Card>
  );
}
