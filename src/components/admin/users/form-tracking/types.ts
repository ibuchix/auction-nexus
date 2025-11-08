import { DateRange } from "react-day-picker";

export interface FormTrackingLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  created_at: string;
  details: {
    form_type?: string;
    event_type?: string;
    source?: string;
    page?: string;
    [key: string]: any;
  };
  user_id: string | null;
  user_full_name: string | null;
  user_email: string | null;
}

export interface FormTrackingFiltersProps {
  searchTerm: string;
  dateRange: DateRange | undefined;
  onSearchTermChange: (value: string) => void;
  onDateRangeChange: (range: DateRange | undefined) => void;
}
