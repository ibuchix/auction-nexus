
export type SystemComponentHealth = 'healthy' | 'degraded' | 'failing' | 'unknown';

export interface SystemHealth {
  id: string;
  component_name: string;
  status: SystemComponentHealth;
  last_check_time: string;
  details?: {
    message?: string;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

export interface OperationStatus {
  lastRun: string;
  status: 'success' | 'error' | 'warning' | 'unknown';
  details?: string;
}

export interface SystemStatusProps {
  isLoading: boolean;
  isRefreshing: boolean;
  failedOperations: any[];
  systemHealth: SystemHealth[];
  operationsStatus: Record<string, OperationStatus>;
  onRefresh: () => void;
  onHealthCheck: () => void;
}
