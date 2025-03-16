
import { DateRangeSelector } from "./DateRangeSelector";
import { DateRange } from "@/hooks/useAnalyticsData";

interface AnalyticsHeaderProps {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  onRefresh: () => void;
}

export function AnalyticsHeader({ dateRange, setDateRange, onRefresh }: AnalyticsHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Track auction performance and trends
        </p>
      </div>
      <DateRangeSelector 
        dateRange={dateRange} 
        setDateRange={setDateRange} 
        onRefresh={onRefresh} 
      />
    </div>
  );
}
