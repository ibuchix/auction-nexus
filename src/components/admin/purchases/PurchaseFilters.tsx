
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RefreshCw, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface PurchaseFiltersProps {
  dateRange: { from: Date; to: Date };
  setDateRange: (range: { from: Date; to: Date }) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  dealerFilter: string;
  setDealerFilter: (dealer: string) => void;
  onRefresh: () => void;
}

export const PurchaseFilters = ({
  dateRange,
  setDateRange,
  statusFilter,
  setStatusFilter,
  dealerFilter,
  setDealerFilter,
  onRefresh,
}: PurchaseFiltersProps) => {
  return (
    <div className="flex gap-4">
      <Input
        placeholder="Filter by dealer name..."
        value={dealerFilter}
        onChange={(e) => setDealerFilter(e.target.value)}
        className="w-64"
      />
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="refunded">Refunded</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
        </SelectContent>
      </Select>
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
};
