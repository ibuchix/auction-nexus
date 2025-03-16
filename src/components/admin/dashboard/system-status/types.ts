
import { ActionType } from "@/components/admin/users/activity-log/types";

export interface SystemHealth {
  component_name: string;
  status: 'healthy' | 'degraded' | 'failing' | 'unknown';
  last_check_time: string;
  details: any;
}

export interface OperationStatus {
  lastRun: string;
  status: 'success' | 'warning' | 'error' | 'unknown';
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
