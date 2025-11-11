
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, useCallback } from "react";
import { SystemHealth, OperationStatus } from "./types";
import { toast } from "sonner";

// Define cache TTL in milliseconds (2 minutes)
const CACHE_TTL = 2 * 60 * 1000;

export function useSystemStatus() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [failedOperations, setFailedOperations] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth[]>([]);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  const [operationsStatus, setOperationsStatus] = useState<Record<string, OperationStatus>>({
    closeAuctions: { lastRun: 'Unknown', status: 'unknown' },
    proxyBids: { lastRun: 'Unknown', status: 'unknown' },
    startAuctions: { lastRun: 'Unknown', status: 'unknown' }
  });

  // Memoize the fetchSystemData function to prevent unnecessary re-renders
  const fetchSystemData = useCallback(async (forceRefresh = false) => {
    // Skip fetching if data is fresh unless forced
    const now = Date.now();
    if (!forceRefresh && now - lastRefreshTime < CACHE_TTL) {
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

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
      const failed = logs?.filter(log => {
        // Check if details exists and is an object
        if (log.details && typeof log.details === 'object') {
          // Handle both object notation and array notation
          if (Array.isArray(log.details)) {
            return false; // Arrays don't have a success property in our case
          } else {
            return log.details.success === false;
          }
        }
        return false;
      }) || [];
      
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
          const hasError = details && 
                           typeof details === 'object' && 
                           !Array.isArray(details) && 
                           details.success === false;
          
          statuses[category] = {
            lastRun: log.created_at,
            status: hasError ? 'error' : 'success',
            details: hasError ? (details?.error || 'Unknown error') : undefined
          };
        }
      });
      
      setOperationsStatus(statuses);
      
      // Use a join to get system health and database performance metrics
      const { data: healthData, error: healthError } = await supabase
        .from('system_health')
        .select('*');
        
      if (healthError) throw healthError;
      
      // Transform the data to match the SystemHealth type
      const transformedHealthData: SystemHealth[] = healthData?.map(item => ({
        id: item.id,
        component_name: (item as any).component_name || item.metric_name,
        status: item.status as SystemHealth['status'],
        last_check_time: (item as any).last_check_time || item.created_at,
        details: typeof item.details === 'string' 
          ? { message: item.details } 
          : item.details as SystemHealth['details'],
        created_at: item.created_at,
        updated_at: (item as any).updated_at || item.created_at
      })) || [];
      
      setSystemHealth(transformedHealthData);
      setLastRefreshTime(now);
    } catch (error) {
      console.error('Error fetching system data:', error);
      toast.error("Failed to load system status. Could not retrieve the latest system operation data.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [lastRefreshTime]);

  useEffect(() => {
    fetchSystemData();
    
    // Set up an interval to refresh the cache when it expires
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastRefreshTime >= CACHE_TTL) {
        fetchSystemData();
      }
    }, CACHE_TTL / 2); // Check half as often as the TTL
    
    return () => clearInterval(interval);
  }, [fetchSystemData, lastRefreshTime]);

  const triggerHealthCheck = async () => {
    try {
      setIsRefreshing(true);
      toast.loading("Running system health check...");
      
      // Call the health check function 
      const { data, error } = await supabase.rpc('check_auction_system_health');
      
      if (error) throw error;
      
      toast.success("System health check completed");
      fetchSystemData(true); // Force refresh
    } catch (error) {
      console.error('Error running health check:', error);
      toast.error("Failed to run system health check");
      setIsRefreshing(false);
    }
  };

  const refreshData = () => {
    setIsRefreshing(true);
    fetchSystemData(true); // Force refresh
  };

  return {
    isLoading,
    isRefreshing,
    failedOperations,
    systemHealth,
    operationsStatus,
    refreshData,
    triggerHealthCheck
  };
}
