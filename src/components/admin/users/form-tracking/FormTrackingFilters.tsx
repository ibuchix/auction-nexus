import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DateRangePicker } from "@/components/admin/audit-logs/DateRangePicker";
import { FormTrackingFiltersProps } from "./types";

export function FormTrackingFilters({
  searchTerm,
  dateRange,
  onSearchTermChange,
  onDateRangeChange
}: FormTrackingFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by user, email, form type..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="pl-9"
        />
      </div>
      
      <DateRangePicker
        date={dateRange}
        onDateChange={onDateRangeChange}
      />
    </div>
  );
}
