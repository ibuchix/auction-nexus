
import { Clock, CheckCircle, PauseCircle, XCircle, Package } from "lucide-react";
import { useAuctionManagement } from "@/hooks/useAuctionManagement";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuctionScheduleDialog } from "@/components/admin/auction-scheduling/AuctionScheduleDialog";
import { AuctionFilters } from "@/components/admin/auction-management/AuctionFilters";
import { AuctionTabContent } from "@/components/admin/auction-management/AuctionTabContent";
import { RecentProxyBidActivity } from "@/components/admin/dashboard/RecentProxyBidActivity";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const AuctionManagement = () => {
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    showAllCars,
    setShowAllCars,
    isLoading,
    error,
    readyAuctions,
    activeAuctions,
    otherAuctions,
    notConfiguredListings,
    selectedAuction,
    isScheduleDialogOpen,
    pauseAuction,
    cancelAuction,
    startAuction,
    handleScheduleClick,
    handleScheduleClose,
    handleScheduleSuccess,
  } = useAuctionManagement();

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-500">
          Failed to load auction listings. Please refresh the page or contact support.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        Auction Management
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white p-4 rounded-lg border mb-6">
            <div className="flex items-center justify-between mb-4">
              <AuctionFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
              />
              <div className="flex items-center gap-2">
                <Switch 
                  id="show-all-cars" 
                  checked={showAllCars} 
                  onCheckedChange={setShowAllCars}
                />
                <Label htmlFor="show-all-cars">Show All Cars</Label>
              </div>
            </div>
          </div>

          <Tabs defaultValue="ready" className="space-y-4">
            <TabsList>
              <TabsTrigger value="ready" className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Ready for Auction
                {readyAuctions && readyAuctions.length > 0 && (
                  <Badge variant="secondary" className="ml-1">{readyAuctions.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="active" className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Active Auctions
                {activeAuctions && activeAuctions.length > 0 && (
                  <Badge variant="secondary" className="ml-1">{activeAuctions.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="other" className="flex items-center gap-1">
                <PauseCircle className="h-4 w-4" />
                Other Auctions
                {otherAuctions && otherAuctions.length > 0 && (
                  <Badge variant="secondary" className="ml-1">{otherAuctions.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="notConfigured" className="flex items-center gap-1">
                <Package className="h-4 w-4" />
                Not Configured
                {notConfiguredListings && notConfiguredListings.length > 0 && (
                  <Badge variant="secondary" className="ml-1">{notConfiguredListings.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ready" className="space-y-4">
              <AuctionTabContent
                title="Listings Ready to Start Auction"
                icon={<Clock className="h-5 w-5 text-blue-600" />}
                auctions={readyAuctions}
                isLoading={isLoading}
                onPause={pauseAuction}
                onCancel={cancelAuction}
                onStart={startAuction}
                onScheduleClick={handleScheduleClick}
                showScheduleButton={true}
              />
            </TabsContent>

            <TabsContent value="active" className="space-y-4">
              <AuctionTabContent
                title="Active Auctions"
                icon={<CheckCircle className="h-5 w-5 text-green-600" />}
                auctions={activeAuctions}
                isLoading={isLoading}
                onPause={pauseAuction}
                onCancel={cancelAuction}
                onStart={startAuction}
              />
            </TabsContent>

            <TabsContent value="other" className="space-y-4">
              <AuctionTabContent
                title="Other Auctions (Paused, Ended, Cancelled)"
                icon={<XCircle className="h-5 w-5 text-gray-600" />}
                auctions={otherAuctions}
                isLoading={isLoading}
                onPause={pauseAuction}
                onCancel={cancelAuction}
                onStart={startAuction}
              />
            </TabsContent>

            <TabsContent value="notConfigured" className="space-y-4">
              <AuctionTabContent
                title="Non-Auction Cars (Needs Configuration)"
                icon={<Package className="h-5 w-5 text-amber-600" />}
                auctions={notConfiguredListings}
                isLoading={isLoading}
                onPause={pauseAuction}
                onCancel={cancelAuction}
                onStart={startAuction}
                onScheduleClick={handleScheduleClick}
                showScheduleButton={true}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <RecentProxyBidActivity />
        </div>
      </div>

      {selectedAuction && (
        <AuctionScheduleDialog
          auction={selectedAuction}
          isOpen={isScheduleDialogOpen}
          onClose={handleScheduleClose}
          onScheduled={handleScheduleSuccess}
        />
      )}
    </div>
  );
};

export default AuctionManagement;
