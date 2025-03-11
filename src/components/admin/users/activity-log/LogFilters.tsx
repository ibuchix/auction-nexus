
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/admin/audit-logs/DateRangePicker";
import { LogFiltersProps } from "./types";

export function LogFilters({
  actionFilter,
  searchTerm,
  dateRange,
  onActionFilterChange,
  onSearchTermChange,
  onDateRangeChange
}: LogFiltersProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search user activity..."
            className="pl-8 w-[250px]"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
          />
        </div>
        
        <Select 
          value={actionFilter} 
          onValueChange={(value) => onActionFilterChange(value as any)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="create">Create</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
            <SelectItem value="login">Login</SelectItem>
            <SelectItem value="logout">Logout</SelectItem>
            <SelectItem value="approve">Approve</SelectItem>
            <SelectItem value="reject">Reject</SelectItem>
            <SelectItem value="verify">Verify</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <DateRangePicker 
        date={dateRange} 
        onDateChange={onDateRangeChange}
      />
    </div>
  );
}
