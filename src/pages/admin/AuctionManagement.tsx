
import { Clock, CheckCircle, XCircle, Package, Loader2 } from "lucide-react";
import { useAuctionManagement } from "@/hooks/useAuctionManagement";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuctionScheduleDialog } from "@/components/admin/auction-scheduling/AuctionScheduleDialog";
import { AuctionFilters } from "@/components/admin/auction-management/AuctionFilters";
import { AuctionTabContent } from "@/components/admin/auction-management/AuctionTabContent";
import { AuctionPagination } from "@/components/admin/auction-management/AuctionPagination";
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
    endedAuctions,
    notConfiguredListings,
    selectedAuction,
    isScheduleDialogOpen,
    pauseAuction,
    cancelAuction,
    startAuction,
    handleScheduleClick,
    handleScheduleClose,
    handleScheduleSuccess,
    // Pagination props
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    hasNextPage,
    hasPreviousPage,
    goToNextPage,
    goToPreviousPage,
    goToPage,
  } = useAuctionManagement();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading auction listings...</p>
        </div>
      </div>
    );
  }

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
          <TabsTrigger value="ended" className="flex items-center gap-1">
            <XCircle className="h-4 w-4" />
            Ended Auctions
            {endedAuctions && endedAuctions.length > 0 && (
              <Badge variant="secondary" className="ml-1">{endedAuctions.length}</Badge>
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
            allowEdit={true}
            onPause={pauseAuction}
            onCancel={cancelAuction}
            onStart={startAuction}
            onScheduleClick={handleScheduleClick}
            showScheduleButton={true}
          />
          <AuctionPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            onNextPage={goToNextPage}
            onPreviousPage={goToPreviousPage}
            onGoToPage={goToPage}
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
          <AuctionPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            onNextPage={goToNextPage}
            onPreviousPage={goToPreviousPage}
            onGoToPage={goToPage}
          />
        </TabsContent>

        <TabsContent value="ended" className="space-y-4">
          <AuctionTabContent
            title="Ended Auctions (Paused, Ended, Cancelled)"
            icon={<XCircle className="h-5 w-5 text-gray-600" />}
            auctions={endedAuctions}
            isLoading={isLoading}
            onPause={pauseAuction}
            onCancel={cancelAuction}
            onStart={startAuction}
          />
          <AuctionPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            onNextPage={goToNextPage}
            onPreviousPage={goToPreviousPage}
            onGoToPage={goToPage}
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
          <AuctionPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            onNextPage={goToNextPage}
            onPreviousPage={goToPreviousPage}
            onGoToPage={goToPage}
          />
        </TabsContent>
      </Tabs>

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
