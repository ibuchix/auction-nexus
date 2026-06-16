import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldCheck, Download } from "lucide-react";
import { useDealerVerification } from "@/components/admin/dealer-verification/useDealerVerification";
import { DealerVerificationTabs } from "@/components/admin/dealer-verification/DealerVerificationTabs";
import { DealerReviewDialog } from "@/components/admin/dealer-verification/DealerReviewDialog";
import { DealerPagination } from "@/components/admin/dealer-verification/DealerPagination";
import { SearchBar } from "@/components/dashboard/SearchBar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DealerVerification = () => {
  const {
    dealers,
    isLoading,
    refetch,
    selectedDealer,
    isReviewOpen,
    setIsReviewOpen,
    rejectionReason,
    setRejectionReason,
    adminNotes,
    setAdminNotes,
    activeTab,
    setActiveTab,
    isProcessing,
    searchQuery,
    setSearchQuery,
    currentPage,
    pageSize,
    pagination,
    handlePageChange,
    handlePageSizeChange,
    handleApproveDealer,
    handleRejectDealer,
    handleToggleVerification,
    handleReviewDealer,
    handleExportCSV,
    subscriptionFilter,
    setSubscriptionFilter,
  } = useDealerVerification();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-2xl font-bold">Dealer Verification</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2" 
            onClick={handleExportCSV}
            disabled={!dealers || dealers.length === 0}
          >
            <Download className="h-4 w-4" />
            Export CSV
            {dealers && dealers.length > 0 && (
              <Badge variant="secondary" className="ml-1">{dealers.length}</Badge>
            )}
          </Button>
          <Button variant="outline" className="flex items-center gap-2" onClick={() => refetch()}>
            <Loader2 className="h-4 w-4" />
            Refresh
          </Button>
          {activeTab === "pending" && pagination && (
            <Button className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Pending <Badge variant="secondary" className="ml-1">{pagination.totalCount}</Badge>
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <SearchBar 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>
        {dealers && searchQuery && (
          <p className="text-sm text-muted-foreground">
            Showing {dealers.length} result{dealers.length !== 1 ? 's' : ''} for "{searchQuery}"
          </p>
        )}
      </div>

      {pagination && (
        <DealerPagination
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      <DealerVerificationTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dealers={dealers}
        isProcessing={isProcessing}
        onToggleVerification={handleToggleVerification}
        onReviewDealer={handleReviewDealer}
      />

      {pagination && (
        <DealerPagination
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      <DealerReviewDialog 
        selectedDealer={selectedDealer}
        isReviewOpen={isReviewOpen}
        setIsReviewOpen={setIsReviewOpen}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        adminNotes={adminNotes}
        setAdminNotes={setAdminNotes}
        isProcessing={isProcessing}
        onApproveDealer={handleApproveDealer}
        onRejectDealer={handleRejectDealer}
        onToggleVerification={handleToggleVerification}
      />
    </div>
  );
};

export default DealerVerification;
