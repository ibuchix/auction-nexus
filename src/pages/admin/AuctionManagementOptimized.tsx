import { Clock, CheckCircle, XCircle, Package, Loader2, ChevronDown } from "lucide-react";
import { useOptimizedAuctionManagement } from "@/hooks/useOptimizedAuctionManagement";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuctionScheduleDialog } from "@/components/admin/auction-scheduling/AuctionScheduleDialog";
import { AuctionFilters } from "@/components/admin/auction-monitoring/AuctionFilters";
import { AuctionTabContent } from "@/components/admin/auction-management/AuctionTabContent";
import { InfiniteScrollTrigger } from "@/components/admin/auction-management/InfiniteScrollTrigger";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
    totalCount,
    hasMore,
    loadedItems,
    isLoadingMore,
    loadMore,
    loadMoreManual,
    loadAll,
    pageSize,
    setPageSize,
    autoLoadEnabled,
    setAutoLoadEnabled,
    selectedAuction,
    isScheduleDialogOpen,
    pauseAuction,
    cancelAuction,
    startAuction,
    handleScheduleClick,
    handleScheduleClose,
    handleScheduleSuccess,
    tabStates,
  } = useOptimizedAuctionManagement();

  if (isLoading && loadedItems === pageSize) {
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

        {/* Manual Controls */}
        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="page-size" className="text-sm whitespace-nowrap">
                Items per page:
              </Label>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => setPageSize(Number(value))}
              >
                <SelectTrigger id="page-size" className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="auto-load"
                checked={autoLoadEnabled}
                onCheckedChange={setAutoLoadEnabled}
              />
              <Label htmlFor="auto-load" className="text-sm cursor-pointer">
                Auto-load on scroll
              </Label>
            </div>

            <div className="flex-1" />

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Showing {loadedItems} of {totalCount}
              </span>
              {hasMore && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadAll}
                  disabled={isLoadingMore}
                  className="gap-2"
                >
                  {isLoadingMore ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  Load All
                </Button>
              )}
            </div>
          </div>
        </Card>
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
          />
          <InfiniteScrollTrigger
            onLoadMore={loadMore}
            hasMore={hasMore}
            isLoading={isLoadingMore}
            totalCount={totalCount}
            loadedCount={loadedItems}
          />
          
          {!autoLoadEnabled && hasMore && !isLoadingMore && (
            <div className="text-center py-6">
              <Button
                onClick={loadMoreManual}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <ChevronDown className="h-4 w-4" />
                Load More Auctions ({totalCount - loadedItems} remaining)
              </Button>
            </div>
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
          />
          <InfiniteScrollTrigger
            onLoadMore={loadMore}
            hasMore={hasMore}
            isLoading={isLoadingMore}
            totalCount={totalCount}
            loadedCount={loadedItems}
          />
          
          {!autoLoadEnabled && hasMore && !isLoadingMore && (
            <div className="text-center py-6">
              <Button
                onClick={loadMoreManual}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <ChevronDown className="h-4 w-4" />
                Load More Auctions ({totalCount - loadedItems} remaining)
              </Button>
            </div>
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
          />
          <InfiniteScrollTrigger
            onLoadMore={loadMore}
            hasMore={hasMore}
            isLoading={isLoadingMore}
            totalCount={totalCount}
            loadedCount={loadedItems}
          />
          
          {!autoLoadEnabled && hasMore && !isLoadingMore && (
            <div className="text-center py-6">
              <Button
                onClick={loadMoreManual}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <ChevronDown className="h-4 w-4" />
                Load More Auctions ({totalCount - loadedItems} remaining)
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="notConfigured" className="space-y-4">
          <AuctionTabContent
            title="Non-Auction Cars (Needs Configuration)"
            icon={<Package className="h-5 w-5 text-amber-600" />}
            auctions={listings}
            isLoading={isLoading}
            onPause={pauseAuction}
            onCancel={cancelAuction}
            onStart={startAuction}
            onScheduleClick={handleScheduleClick}
            showScheduleButton={true}
            onSuccess={refetch}
            autoLoadImages={false}
          />
          <InfiniteScrollTrigger
            onLoadMore={loadMore}
            hasMore={hasMore}
            isLoading={isLoadingMore}
            totalCount={totalCount}
            loadedCount={loadedItems}
          />
          
          {!autoLoadEnabled && hasMore && !isLoadingMore && (
            <div className="text-center py-6">
              <Button
                onClick={loadMoreManual}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <ChevronDown className="h-4 w-4" />
                Load More Auctions ({totalCount - loadedItems} remaining)
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Loading Overlay */}
      {isLoadingMore && (
        <div className="fixed bottom-4 right-4 bg-background border border-border rounded-lg shadow-lg p-4 flex items-center gap-3 z-50">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <div>
            <p className="text-sm font-medium">Loading more auctions...</p>
            <p className="text-xs text-muted-foreground">
              {loadedItems} of {totalCount} loaded
            </p>
          </div>
        </div>
      )}

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
