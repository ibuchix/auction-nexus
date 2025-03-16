
import React from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

export interface DateRangeSelectorProps {
  dateRange: DateRange;
  onChange: (range: DateRange) => void;
  presets: { label: string; range: { from: Date; to: Date } }[];
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ 
  dateRange, 
  onChange, 
  presets 
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-6">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full sm:w-auto justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={onChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <Button
            key={preset.label}
            variant="outline"
            size="sm"
            onClick={() => onChange(preset.range)}
          >
            {preset.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
