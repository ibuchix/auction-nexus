
import { useState } from "react";
import { CalendarClock, Car, Search } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Auction } from "@/types/auction";
import { Input } from "@/components/ui/input";

interface AvailableCarsTableProps {
  auctions: Auction[];
  isLoading: boolean;
  onSchedule: (auction: Auction) => void;
}

export function AvailableCarsTable({ 
  auctions, 
  isLoading,
  onSchedule
}: AvailableCarsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredAuctions = auctions.filter(auction => 
    auction.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    auction.make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    auction.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    auction.vin?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (auctions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Car className="h-8 w-8 mx-auto mb-2" />
        <p>No available cars found for scheduling</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search cars..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Make & Model</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>VIN</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAuctions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  No cars match your search criteria
                </TableCell>
              </TableRow>
            ) : (
              filteredAuctions.map((auction) => (
                <TableRow key={auction.id}>
                  <TableCell className="font-medium">
                    {auction.title || "Untitled Vehicle"}
                  </TableCell>
                  <TableCell>
                    {auction.make} {auction.model}
                  </TableCell>
                  <TableCell>{auction.year}</TableCell>
                  <TableCell>{auction.vin}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSchedule(auction)}
                      className="flex items-center gap-1"
                    >
                      <CalendarClock className="h-4 w-4" />
                      Schedule
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
