
import { DateRange } from "react-day-picker";

export type ActionType = 
  | "create" 
  | "update" 
  | "delete" 
  | "login" 
  | "logout" 
  | "approve" 
  | "reject" 
  | "verify" 
  | "suspend" 
  | "reinstate"
  | "process_auctions"
  | "auction_closed"
  | "auto_proxy_bid"
  | "start_auction"
  | "auction_close_failed"
  | "auction_close_system_error"
  | "system_reset_failed"
  | "recovery_failed"
  | "manual_retry"
  | "auction_recovery"
  | "system_health_check"
  | "system_alert";

export interface LogEntry {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
  details?: any;
  user_id?: string;
  user?: {
    full_name?: string;
  };
}

export interface LogFiltersProps {
  actionFilter: ActionType | "all";
  searchTerm: string;
  dateRange: DateRange | undefined;
  onActionFilterChange: (value: ActionType | "all") => void;
  onSearchTermChange: (value: string) => void;
  onDateRangeChange: (range: DateRange | undefined) => void;
}
