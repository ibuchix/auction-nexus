
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { AuctionStatus } from "@/types/auction";

interface AuctionFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: AuctionStatus | "all";
  setStatusFilter: (value: AuctionStatus | "all") => void;
}

export function AuctionFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter
}: AuctionFiltersProps) {
  return (
    <div className="flex gap-4">
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search by title, make, model, or VIN..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <Select
        value={statusFilter}
        onValueChange={(value) => setStatusFilter(value as AuctionStatus | "all")}
      >
        <option value="all">All Status</option>
        <option value="ready">Ready</option>
        <option value="active">Active</option>
        <option value="ended">Ended</option>
        <option value="paused">Paused</option>
        <option value="cancelled">Cancelled</option>
      </Select>
    </div>
  );
}
