
import { useState } from "react";
import { CalendarClock, Search, Plus, Car } from "lucide-react";
import { AuctionSchedulesTable } from "@/components/admin/auction-scheduling/AuctionSchedulesTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { adminOperations } from "@/utils/adminOperations";
import { Auction, AuctionSchedule } from "@/types/auction";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { AvailableCarsTable } from "@/components/admin/auction-scheduling/AvailableCarsTable";
import { AuctionScheduleDialog } from "@/components/admin/auction-scheduling/AuctionScheduleDialog";
import { ErrorBoundary } from "@/components/ui/error-boundary";

const AuctionScheduling = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();

  const { data: availableAuctions, isLoading, error, refetch } = useQuery({
    queryKey: ['availableAuctions', refreshKey],
    queryFn: async () => {
      console.log('Fetching available cars for scheduling via admin operations');
      
      try {
        const data = await adminOperations.getAvailableCarsForScheduling();
        
        if (!data) {
          console.error('No data returned from getAvailableCarsForScheduling');
          return [];
        }
        
        const auctionData = Array.isArray(data) ? data : [data];
        console.log(`Successfully fetched ${auctionData.length} available cars`);
        return auctionData as Auction[];
      } catch (error) {
        console.error('Error fetching available cars:', error);
        return [];
      }
    },
    retry: 1,
    refetchOnWindowFocus: false
  });

  const handleRefresh = () => {
    console.log('Refreshing auction scheduling data');
    setRefreshKey(prev => prev + 1);
    refetch();
  };

  const handleScheduleAuction = (auction: Auction) => {
    console.log('Opening schedule dialog for auction:', auction.id);
    setSelectedAuction(auction);
    setIsScheduleDialogOpen(true);
  };

  const handleCloseScheduleDialog = () => {
    console.log('Closing schedule dialog');
    setIsScheduleDialogOpen(false);
    setSelectedAuction(null);
  };

  const handleScheduleSuccess = () => {
    console.log('Schedule created successfully, refreshing data');
    handleRefresh();
  };

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Auction Scheduling
          </h1>
          <div className="flex gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search schedules..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value)}
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="running">Running</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </div>
        </div>

      <Tabs defaultValue="schedules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="schedules" className="flex items-center gap-1">
            <CalendarClock className="h-4 w-4" />
            Auction Schedules
          </TabsTrigger>
          <TabsTrigger value="available-cars" className="flex items-center gap-1">
            <Car className="h-4 w-4" />
            Available Cars
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-blue-600" />
                All Auction Schedules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AuctionSchedulesTable 
                onRefresh={handleRefresh}
                key={refreshKey}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="available-cars" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Car className="h-5 w-5 text-green-600" />
                Available Cars for Scheduling
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AvailableCarsTable 
                auctions={availableAuctions || []} 
                isLoading={isLoading} 
                onSchedule={handleScheduleAuction}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedAuction && (
        <AuctionScheduleDialog
          auction={selectedAuction}
          isOpen={isScheduleDialogOpen}
          onClose={handleCloseScheduleDialog}
          onScheduled={handleScheduleSuccess}
        />
      )}
      </div>
    </ErrorBoundary>
  );
};

export default AuctionScheduling;
