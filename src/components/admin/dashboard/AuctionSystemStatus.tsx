
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, CircleAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface OperationStatus {
  lastRun: string;
  status: 'success' | 'warning' | 'error' | 'unknown';
  details?: string;
}

export function AuctionSystemStatus() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [failedOperations, setFailedOperations] = useState<any[]>([]);
  const [operationsStatus, setOperationsStatus] = useState<Record<string, OperationStatus>>({
    closeAuctions: { lastRun: 'Unknown', status: 'unknown' },
    proxyBids: { lastRun: 'Unknown', status: 'unknown' },
    startAuctions: { lastRun: 'Unknown', status: 'unknown' }
  });

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        setIsLoading(true);
        
        // Fetch recent logs for auction operations
        const { data: logs, error } = await supabase
          .from('audit_logs')
          .select('*')
          .in('action', ['auto_proxy_bid', 'process_auctions', 'start_auction'])
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
            const hasError = log.details && typeof log.details === 'object' && log.details.success === false;
            
            statuses[category] = {
              lastRun: log.created_at,
              status: hasError ? 'error' : 'success',
              details: hasError ? (log.details.error || 'Unknown error') : undefined
            };
          }
        });
        
        setOperationsStatus(statuses);
      } catch (error) {
        console.error('Error fetching audit logs:', error);
        toast({
          title: "Failed to load system status",
          description: "Could not retrieve the latest system operation data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuditLogs();
    
    // Refresh data every 2 minutes
    const interval = setInterval(fetchAuditLogs, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [toast]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">System Status</h2>
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

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">System Status</h2>
      
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
    </div>
  );
}
