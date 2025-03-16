
import { useSystemStatus } from "./system-status/useSystemStatus";
import { SystemStatus } from "./system-status/SystemStatus";

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
    <SystemStatus
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      failedOperations={failedOperations}
      systemHealth={systemHealth}
      operationsStatus={operationsStatus}
      onRefresh={refreshData}
      onHealthCheck={triggerHealthCheck}
    />
  );
}
