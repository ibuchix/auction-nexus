import { DateRange } from "react-day-picker";

export interface DateRangeSelectorProps {
  dateRange: DateRange;
  onChange: (range: DateRange) => void;
  presets: { label: string; range: { from: Date; to: Date } }[];
}
