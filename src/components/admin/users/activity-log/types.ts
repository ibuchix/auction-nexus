import { DateRange } from "react-day-picker";

export type ActionType = "create" | "update" | "delete" | "login" | "logout" | "approve" | "reject" | "verify" | "suspend" | "reinstate";

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
