
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ChangeEvent } from "react";
import debounce from "lodash/debounce";

interface AuctionFiltersProps {
  statusFilter: string;
  sortBy: string;
  onStatusChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onSearch: (value: string) => void;
}

export function AuctionFilters({
  statusFilter,
  sortBy,
  onStatusChange,
  onSortChange,
  onSearch
}: AuctionFiltersProps) {
  // Create a debounced search handler
  const debouncedSearch = debounce((value: string) => {
    onSearch(value);
  }, 300);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search auctions..."
            className="pl-10"
            onChange={handleSearchChange}
          />
        </div>
      </div>
      <div className="flex gap-4">
        <Select
          value={statusFilter}
          onValueChange={onStatusChange}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="ended">Ended</option>
        </Select>
        <Select
          value={sortBy}
          onValueChange={onSortChange}
        >
          <option value="end_time">End Time</option>
          <option value="bids">Number of Bids</option>
          <option value="value">Current Value</option>
        </Select>
      </div>
    </div>
  );
}
