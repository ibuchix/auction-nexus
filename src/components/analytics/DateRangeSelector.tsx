
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, RefreshCw } from "lucide-react";
import { DateRange } from "@/hooks/useAnalyticsData";
import { format } from "date-fns";

interface DateRangeSelectorProps {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  onRefresh: () => void;
}

export function DateRangeSelector({ dateRange, setDateRange, onRefresh }: DateRangeSelectorProps) {
  return (
    <div className="flex gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(dateRange.from, "PP")} - {format(dateRange.to, "PP")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange.from}
            selected={{
              from: dateRange.from,
              to: dateRange.to,
            }}
            onSelect={(range) => {
              if (range?.from && range?.to) {
                setDateRange({ from: range.from, to: range.to });
              }
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
      <Button onClick={onRefresh} size="icon">
        <RefreshCw className="h-4 w-4" />
      </Button>
    </div>
  );
}
