
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Label } from "@/components/ui/label";

interface DisputeFiltersProps {
  currentFilters: {
    status?: string;
    type?: string;
  };
  onApplyFilters: (filters: { status?: string; type?: string }) => void;
  onClose: () => void;
}

export function DisputeFilters({ currentFilters, onApplyFilters, onClose }: DisputeFiltersProps) {
  const [filters, setFilters] = useState(currentFilters);

  const handleReset = () => {
    setFilters({});
  };

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Filter Disputes</SheetTitle>
          <SheetDescription>
            Apply filters to narrow down dispute cases
          </SheetDescription>
        </SheetHeader>
        
        <div className="grid gap-6 py-6">
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={filters.status || ""}
              onValueChange={(value) => 
                setFilters((prev) => ({ ...prev, status: value || undefined }))
              }
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={filters.type || ""}
              onValueChange={(value) => 
                setFilters((prev) => ({ ...prev, type: value || undefined }))
              }
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="vehicle_condition">Vehicle Condition</SelectItem>
                  <SelectItem value="listing_accuracy">Listing Accuracy</SelectItem>
                  <SelectItem value="auction_process">Auction Process</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <SheetFooter className="sm:justify-between">
          <Button variant="outline" onClick={handleReset}>
            Reset Filters
          </Button>
          <Button onClick={() => onApplyFilters(filters)}>
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
