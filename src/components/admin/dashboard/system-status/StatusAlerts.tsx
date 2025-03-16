
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SystemHealth } from "./types";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface StatusAlertsProps {
  failedOperations: any[];
  systemHealth: SystemHealth[];
}

export function StatusAlerts({ failedOperations, systemHealth }: StatusAlertsProps) {
  // Get overall system health status
  const overallHealth = systemHealth.find(h => h.component_name === 'auction_system');
  const dbPerformance = systemHealth.find(h => h.component_name === 'database_performance');
  const hasHealthAlert = overallHealth && overallHealth.status !== 'healthy';

  return (
    <>
      {dbPerformance && (
        <Alert variant="default" className="bg-blue-50 border-blue-200 mb-4">
          <CheckCircle2 className="h-5 w-5 text-blue-500" />
          <AlertTitle>Database Optimization Active</AlertTitle>
          <AlertDescription>
            Performance optimizations are active. Last update: {new Date(dbPerformance.last_check_time).toLocaleString()}
          </AlertDescription>
        </Alert>
      )}
      
      {hasHealthAlert && (
        <Alert variant={overallHealth?.status === 'failing' ? 'destructive' : 'default'} className="mb-4">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>System {overallHealth?.status === 'failing' ? 'Alert' : 'Warning'}</AlertTitle>
          <AlertDescription>
            {overallHealth?.details?.message || 'System health is compromised. Check component status below.'}
          </AlertDescription>
        </Alert>
      )}
      
      {failedOperations.length > 0 && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>System Attention Required</AlertTitle>
          <AlertDescription>
            {failedOperations.length} failed operations detected in the last 24 hours. 
            Review the audit logs for details.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}
