
import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { Download, RefreshCw, Calendar as CalendarIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { toast } from "sonner";

type AuctionClosure = {
  car_id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  auction_end_time: string;
  sale_status: 'sold' | 'unsold';
  final_price: number | null;
  total_bids: number;
  unique_bidders: number;
};

const AuctionSummaries = () => {
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date()
  });

  const [selectedTab, setSelectedTab] = useState<'sold' | 'unsold'>('sold');

  const { data: closures, isLoading, refetch } = useQuery({
    queryKey: ['auctionClosures', dateRange, selectedTab],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('auction_closure_details')
        .select('*')
        .gte('auction_end_time', dateRange.from.toISOString())
        .lte('auction_end_time', dateRange.to.toISOString())
        .eq('sale_status', selectedTab);

      if (error) throw error;
      return data as AuctionClosure[];
    }
  });

  const handleExport = async () => {
    try {
      const { data: exportData, error: exportError } = await supabase
        .from('auction_closure_details')
        .select('*')
        .gte('auction_end_time', dateRange.from.toISOString())
        .lte('auction_end_time', dateRange.to.toISOString())
        .eq('sale_status', selectedTab);

      if (exportError) throw exportError;

      const csvContent = [
        // CSV Headers
        ['Title', 'Make', 'Model', 'Year', 'End Time', 'Status', 'Final Price', 'Total Bids', 'Unique Bidders'].join(','),
        // CSV Data
        ...exportData.map(row => [
          row.title,
          row.make,
          row.model,
          row.year,
          format(new Date(row.auction_end_time), "PP"),
          row.sale_status,
          row.final_price || '0',
          row.total_bids,
          row.unique_bidders
        ].join(','))
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `auction-summary-${selectedTab}-${format(dateRange.from, "yyyy-MM-dd")}-to-${format(dateRange.to, "yyyy-MM-dd")}.csv`;
      link.click();

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Log export in history
      await supabase
        .from('export_history')
        .insert({
          exported_by: user.id,
          export_type: 'auction_summary',
          date_range_start: dateRange.from.toISOString(),
          date_range_end: dateRange.to.toISOString(),
          filters: { status: selectedTab },
          record_count: exportData.length
        });

      toast.success("Export completed successfully");
    } catch (error) {
      toast.error("Failed to export data");
      console.error("Export error:", error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Auction Summaries</h1>
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
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => refetch()} size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="sold" onValueChange={(v) => setSelectedTab(v as 'sold' | 'unsold')}>
          <TabsList>
            <TabsTrigger value="sold">Sold Vehicles</TabsTrigger>
            <TabsTrigger value="unsold">Unsold Vehicles</TabsTrigger>
          </TabsList>

          <TabsContent value="sold" className="mt-6">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Final Price</TableHead>
                    <TableHead>Total Bids</TableHead>
                    <TableHead>Unique Bidders</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {closures?.map((closure) => (
                    <TableRow key={closure.car_id}>
                      <TableCell>
                        {closure.year} {closure.make} {closure.model}
                        <br />
                        <span className="text-sm text-gray-500">{closure.title}</span>
                      </TableCell>
                      <TableCell>{format(new Date(closure.auction_end_time), "PP")}</TableCell>
                      <TableCell>${closure.final_price?.toLocaleString() || '0'}</TableCell>
                      <TableCell>{closure.total_bids}</TableCell>
                      <TableCell>{closure.unique_bidders}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="unsold" className="mt-6">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Reserve Price</TableHead>
                    <TableHead>Total Bids</TableHead>
                    <TableHead>Unique Bidders</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {closures?.map((closure) => (
                    <TableRow key={closure.car_id}>
                      <TableCell>
                        {closure.year} {closure.make} {closure.model}
                        <br />
                        <span className="text-sm text-gray-500">{closure.title}</span>
                      </TableCell>
                      <TableCell>{format(new Date(closure.auction_end_time), "PP")}</TableCell>
                      <TableCell>{closure.total_bids}</TableCell>
                      <TableCell>{closure.unique_bidders}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AuctionSummaries;
