import { Clock, CheckCircle, XCircle, Package, Loader2 } from "lucide-react";
import { useOptimizedAuctionManagement } from "@/hooks/useOptimizedAuctionManagement";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuctionScheduleDialog } from "@/components/admin/auction-scheduling/AuctionScheduleDialog";
import { AuctionTabContent } from "@/components/admin/auction-management/AuctionTabContent";
import { AuctionPagination } from "@/components/admin/auction-management/AuctionPagination";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const AuctionManagementOptimized = () => {
  const {
    currentTab,
    setCurrentTab,
    listings,
    isLoading,
    error,
    refetch,
    searchTerm,
    setSearchTerm,
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    hasNextPage,
    hasPreviousPage,
    onNextPage,
    onPreviousPage,
    onGoToPage,
    selectedAuction,
    isScheduleDialogOpen,
    pauseAuction,
    cancelAuction,
    startAuction,
    handleScheduleClick,
    handleScheduleClose,
    handleScheduleSuccess,
    tabStates,
    exportCurrentTab,
    isExporting,
  } = useOptimizedAuctionManagement();

  if (isLoading && currentPage === 1) {
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

      <div className="space-y-4">
        {/* Search */}
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by title, make, model, or VIN..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as any)} className="space-y-4">
        <TabsList>
          <TabsTrigger value="ready" className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Ready for Auction
            {tabStates.ready.totalCount > 0 && (
              <Badge variant="secondary" className="ml-1">{tabStates.ready.totalCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            Active Auctions
            {tabStates.active.totalCount > 0 && (
              <Badge variant="secondary" className="ml-1">{tabStates.active.totalCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="ended" className="flex items-center gap-1">
            <XCircle className="h-4 w-4" />
            Ended Auctions
            {tabStates.ended.totalCount > 0 && (
              <Badge variant="secondary" className="ml-1">{tabStates.ended.totalCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="notConfigured" className="flex items-center gap-1">
            <Package className="h-4 w-4" />
            Not Configured
            {tabStates.notConfigured.totalCount > 0 && (
              <Badge variant="secondary" className="ml-1">{tabStates.notConfigured.totalCount}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ready" className="space-y-4">
          <AuctionTabContent
            title="Listings Ready to Start Auction"
            icon={<Clock className="h-5 w-5 text-blue-600" />}
            auctions={listings}
            isLoading={isLoading}
            allowEdit={true}
            onPause={pauseAuction}
            onCancel={cancelAuction}
            onStart={startAuction}
            onScheduleClick={handleScheduleClick}
            showScheduleButton={true}
            onSuccess={refetch}
            autoLoadImages={false}
            showImageCount={true}
            onExport={exportCurrentTab}
            isExporting={isExporting}
            totalCount={tabStates.ready.totalCount}
          />
          {!isLoading && totalCount > 0 && (
            <AuctionPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              hasNextPage={hasNextPage}
              hasPreviousPage={hasPreviousPage}
              onNextPage={onNextPage}
              onPreviousPage={onPreviousPage}
              onGoToPage={onGoToPage}
            />
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <AuctionTabContent
            title="Active Auctions"
            icon={<CheckCircle className="h-5 w-5 text-green-600" />}
            auctions={listings}
            isLoading={isLoading}
            onPause={pauseAuction}
            onCancel={cancelAuction}
            onStart={startAuction}
            onSuccess={refetch}
            autoLoadImages={false}
            onExport={exportCurrentTab}
            isExporting={isExporting}
            totalCount={tabStates.active.totalCount}
          />
          {!isLoading && totalCount > 0 && (
            <AuctionPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              hasNextPage={hasNextPage}
              hasPreviousPage={hasPreviousPage}
              onNextPage={onNextPage}
              onPreviousPage={onPreviousPage}
              onGoToPage={onGoToPage}
            />
          )}
        </TabsContent>

        <TabsContent value="ended" className="space-y-4">
          <AuctionTabContent
            title="Ended Auctions (Paused, Ended, Cancelled)"
            icon={<XCircle className="h-5 w-5 text-gray-600" />}
            auctions={listings}
            isLoading={isLoading}
            onPause={pauseAuction}
            onCancel={cancelAuction}
            onStart={startAuction}
            onSuccess={refetch}
            autoLoadImages={false}
            onExport={exportCurrentTab}
            isExporting={isExporting}
            totalCount={tabStates.ended.totalCount}
          />
          {!isLoading && totalCount > 0 && (
            <AuctionPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              hasNextPage={hasNextPage}
              hasPreviousPage={hasPreviousPage}
              onNextPage={onNextPage}
              onPreviousPage={onPreviousPage}
              onGoToPage={onGoToPage}
            />
          )}
        </TabsContent>

        <TabsContent value="notConfigured" className="space-y-4">
          <AuctionTabContent
            title="Non-Auction Cars (Needs Configuration)"
            icon={<Package className="h-5 w-5 text-amber-600" />}
            auctions={listings}
            isLoading={isLoading}
            allowEdit={true}
            onPause={pauseAuction}
            onCancel={cancelAuction}
            onStart={startAuction}
            onScheduleClick={handleScheduleClick}
            showScheduleButton={true}
            onSuccess={refetch}
            autoLoadImages={false}
            onExport={exportCurrentTab}
            isExporting={isExporting}
            totalCount={tabStates.notConfigured.totalCount}
          />
          {!isLoading && totalCount > 0 && (
            <AuctionPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              hasNextPage={hasNextPage}
              hasPreviousPage={hasPreviousPage}
              onNextPage={onNextPage}
              onPreviousPage={onPreviousPage}
              onGoToPage={onGoToPage}
            />
          )}
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

export default AuctionManagementOptimized;
