
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { adminSupabase } from "@/integrations/supabase/adminClient";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, CircleAlert, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SystemHealth {
  component_name: string;
  status: 'healthy' | 'degraded' | 'failing' | 'unknown';
  last_check_time: string;
  details: any;
}

interface OperationStatus {
  lastRun: string;
  status: 'success' | 'warning' | 'error' | 'unknown';
  details?: string;
}

export function AuctionSystemStatus() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [failedOperations, setFailedOperations] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth[]>([]);
  const [operationsStatus, setOperationsStatus] = useState<Record<string, OperationStatus>>({
    closeAuctions: { lastRun: 'Unknown', status: 'unknown' },
    proxyBids: { lastRun: 'Unknown', status: 'unknown' },
    startAuctions: { lastRun: 'Unknown', status: 'unknown' }
  });

  useEffect(() => {
    fetchSystemData();
    
    // Refresh data every 2 minutes
    const interval = setInterval(fetchSystemData, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchSystemData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch recent logs for auction operations
      const { data: logs, error } = await supabase
        .from('audit_logs')
        .select('*')
        .in('action', ['auto_proxy_bid', 'process_auctions', 'start_auction'] as any[])
        .order('created_at', { ascending: false })
        .limit(30);
      
      if (error) throw error;
      
      // Look for failed operations
      const failed = logs?.filter(log => 
        log.details && 
        typeof log.details === 'object' && 
        log.details.success === false
      ) || [];
      
      setFailedOperations(failed);
      
      // Process logs to determine system status
      const statuses: Record<string, OperationStatus> = {
        closeAuctions: { lastRun: 'Unknown', status: 'unknown' },
        proxyBids: { lastRun: 'Unknown', status: 'unknown' },
        startAuctions: { lastRun: 'Unknown', status: 'unknown' }
      };
      
      logs?.forEach(log => {
        let category: string | null = null;
        
        if (log.action === 'process_auctions') category = 'closeAuctions';
        else if (log.action === 'auto_proxy_bid') category = 'proxyBids';
        else if (log.action === 'start_auction') category = 'startAuctions';
        
        if (category && (statuses[category].lastRun === 'Unknown' || new Date(log.created_at) > new Date(statuses[category].lastRun))) {
          const details = log.details as Record<string, any> | null;
          const hasError = details && typeof details === 'object' && details.success === false;
          
          statuses[category] = {
            lastRun: log.created_at,
            status: hasError ? 'error' : 'success',
            details: hasError ? (details?.error || 'Unknown error') : undefined
          };
        }
      });
      
      setOperationsStatus(statuses);
      
      // Fetch system health data
      const { data: healthData, error: healthError } = await supabase
        .from('system_health')
        .select('*');
        
      if (healthError) throw healthError;
      
      setSystemHealth(healthData || []);
    } catch (error) {
      console.error('Error fetching system data:', error);
      toast.error("Failed to load system status. Could not retrieve the latest system operation data.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const triggerHealthCheck = async () => {
    try {
      setIsRefreshing(true);
      toast.loading("Running system health check...");
      
      // Call the health check function 
      const { data, error } = await adminSupabase.rpc('check_auction_system_health');
      
      if (error) throw error;
      
      toast.success("System health check completed");
      fetchSystemData();
    } catch (error) {
      console.error('Error running health check:', error);
      toast.error("Failed to run system health check");
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">System Status</h2>
          <Button variant="outline" size="sm" disabled>
            <RefreshCw className="mr-2 h-4 w-4" />
            Check Health
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-36" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Get overall system health status
  const overallHealth = systemHealth.find(h => h.component_name === 'auction_system');
  const hasHealthAlert = overallHealth && overallHealth.status !== 'healthy';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">System Status</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={triggerHealthCheck} 
          disabled={isRefreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Check Health
        </Button>
      </div>
      
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Operation Status Cards */}
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
      
      {/* System Health Component Cards */}
      <h3 className="text-lg font-medium mt-6">System Health Components</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {systemHealth
          .filter(h => h.component_name !== 'auction_system') // Skip overall status as we show it in the alert
          .map(component => (
            <Card key={component.component_name} className={`border-l-4 ${
              component.status === 'healthy' ? 'border-l-green-500' : 
              component.status === 'failing' ? 'border-l-red-500' :
              component.status === 'degraded' ? 'border-l-amber-500' : 'border-l-gray-300'
            }`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  {component.status === 'healthy' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                  {component.status === 'failing' && <AlertCircle className="h-5 w-5 text-red-500" />}
                  {component.status === 'degraded' && <CircleAlert className="h-5 w-5 text-amber-500" />}
                  {component.status === 'unknown' && <CircleAlert className="h-5 w-5 text-gray-400" />}
                  {component.component_name.charAt(0).toUpperCase() + component.component_name.slice(1).replace(/_/g, ' ')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Last checked: {new Date(component.last_check_time).toLocaleString()}
                </p>
                {component.details?.message && (
                  <p className={`text-sm mt-1 ${
                    component.status === 'healthy' ? 'text-green-600' : 
                    component.status === 'failing' ? 'text-red-500' : 
                    'text-amber-500'
                  }`}>
                    {component.details.message}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        }
      </div>
    </div>
  );
}
