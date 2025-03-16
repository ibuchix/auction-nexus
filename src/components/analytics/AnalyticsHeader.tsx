
import { DateRangeSelector } from "./DateRangeSelector";
import { DateRange } from "@/hooks/useAnalyticsData";

interface AnalyticsHeaderProps {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  onRefresh: () => void;
}

export function AnalyticsHeader({ dateRange, setDateRange, onRefresh }: AnalyticsHeaderProps) {
  return (
    <div className="flex-1">
      <div className="animate-slide-up">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Track auction performance and trends
        </p>
      </div>
      <div className="mt-4">
        <DateRangeSelector 
          dateRange={dateRange} 
          setDateRange={setDateRange} 
          onRefresh={onRefresh} 
        />
      </div>
    </div>
  );
}
