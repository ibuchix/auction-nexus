import { useState } from "react";
import { CalendarClock, Search, Plus, Car } from "lucide-react";
import { AuctionSchedulesTable } from "@/components/admin/auction-scheduling/AuctionSchedulesTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { adminSupabase } from "@/integrations/supabase/adminClient";
import { Auction, AuctionSchedule } from "@/types/auction";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { AvailableCarsTable } from "@/components/admin/auction-scheduling/AvailableCarsTable";
import { AuctionScheduleDialog } from "@/components/admin/auction-scheduling/AuctionScheduleDialog";

const AuctionScheduling = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: availableAuctions, isLoading, error, refetch } = useQuery({
    queryKey: ['availableAuctions'],
    queryFn: async () => {
      const { data, error } = await adminSupabase
        .from('cars')
        .select(`
          *,
          seller:profiles (*)
        `)
        .eq('status', 'approved')
        .is('auction_status', null);
      
      if (error) {
        console.error('Error fetching available cars:', error);
        toast({
          title: "Error",
          description: "Failed to load available cars for scheduling",
          variant: "destructive",
        });
        throw error;
      }
      
      return data as Auction[];
    }
  });

  const handleRefresh = () => {
    refetch();
  };

  const handleScheduleAuction = (auction: Auction) => {
    setSelectedAuction(auction);
    setIsScheduleDialogOpen(true);
  };

  const handleCloseScheduleDialog = () => {
    setIsScheduleDialogOpen(false);
    setSelectedAuction(null);
  };

  const handleScheduleSuccess = () => {
    handleRefresh();
  };

  return (
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
              <AuctionSchedulesTable onRefresh={handleRefresh} />
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
  );
};

export default AuctionScheduling;
