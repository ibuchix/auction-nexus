import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DealerData, VerificationStatus } from "./types";
import { useAuth } from "@/hooks/useAuth";
import { approveDealer, rejectDealer, fetchDealers } from "./dealer-verification-operations";
import { exportDealerVerificationsToCSV } from "@/utils/exportDealerVerifications";

export const useDealerVerification = () => {
  const [selectedDealer, setSelectedDealer] = useState<DealerData | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [activeTab, setActiveTab] = useState<VerificationStatus | "all">("pending");
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(40);
  
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { 
    data: dealerData, 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ['dealersList', activeTab, currentPage, pageSize],
    queryFn: () => fetchDealers(activeTab, currentPage, pageSize),
    staleTime: 5 * 60 * 1000,
  });

  const dealers = dealerData?.dealers || [];
  const pagination = dealerData?.pagination;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Second query: fetch ALL dealers when searching
  const { data: allDealerData, isLoading: isSearchLoading } = useQuery({
    queryKey: ['dealersSearch', activeTab, debouncedSearch],
    queryFn: () => fetchDealers(activeTab, 1, 500),
    enabled: debouncedSearch.trim().length > 0,
    staleTime: 5 * 60 * 1000,
  });

  // Client-side filter on the full dataset when searching
  const searchFilteredDealers = useMemo(() => {
    if (!debouncedSearch.trim()) return null;
    const source = allDealerData?.dealers || [];
    const query = debouncedSearch.toLowerCase().trim();
    return source.filter(dealer =>
      dealer.email?.toLowerCase().includes(query) ||
      dealer.dealershipName?.toLowerCase().includes(query) ||
      dealer.supervisorName?.toLowerCase().includes(query)
    );
  }, [allDealerData, debouncedSearch]);

  // Use search results when searching, otherwise paginated results
  const isSearching = debouncedSearch.trim().length > 0;
  const displayDealers = isSearching ? (searchFilteredDealers || []) : dealers;
  const displayPagination = isSearching ? null : pagination;

  const invalidateDealersCache = async () => {
    // Invalidate queries for all tabs to ensure consistency
    await queryClient.invalidateQueries({ queryKey: ['dealersList'] });
  };

  const handleApproveDealer = async () => {
    if (!selectedDealer) {
      toast.error('No dealer selected');
      return;
    }
    
    if (!user?.id) {
      toast.error('User not authenticated. Please sign in again.');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      console.log('Approving dealer:', selectedDealer.id, 'by admin:', user.id);
      const result = await approveDealer(selectedDealer.id, user.id, adminNotes);
      
      if (!result) throw new Error('Verification failed');
      
      toast.success(`${selectedDealer.dealershipName} has been approved`);
      setIsReviewOpen(false);
      setSelectedDealer(null);
      setAdminNotes("");
      
      // Invalidate and refetch data
      await invalidateDealersCache();
      refetch();
    } catch (error) {
      console.error('Error approving dealer:', error);
      toast.error('Failed to approve dealer: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectDealer = async () => {
    if (!selectedDealer || !rejectionReason) {
      toast.error('Dealer selection or rejection reason missing');
      return;
    }
    
    if (!user?.id) {
      toast.error('User not authenticated. Please sign in again.');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      console.log('Rejecting dealer:', selectedDealer.id, 'by admin:', user.id);
      const result = await rejectDealer(
        selectedDealer.id, 
        user.id, 
        rejectionReason,
        adminNotes
      );
      
      if (!result) throw new Error('Rejection failed');
      
      toast.success(`${selectedDealer.dealershipName} has been rejected`);
      setIsReviewOpen(false);
      setSelectedDealer(null);
      setRejectionReason("");
      setAdminNotes("");
      
      // Invalidate and refetch data
      await invalidateDealersCache();
      refetch();
    } catch (error) {
      console.error('Error rejecting dealer:', error);
      toast.error('Failed to reject dealer: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleVerification = async (dealer: DealerData, newStatus: boolean) => {
    if (!user?.id) {
      toast.error('User not authenticated. Please sign in again.');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      console.log(`Toggle verification for dealer ${dealer.id}: ${newStatus ? 'approve' : 'reject'}`);
      
      if (newStatus) {
        const result = await approveDealer(
          dealer.id,
          user.id,
          "Quick verification via toggle switch"
        );
        
        if (!result) throw new Error('Verification failed');
        toast.success(`${dealer.dealershipName} has been approved`);
      } else {
        const result = await rejectDealer(
          dealer.id,
          user.id,
          "Verification revoked",
          "Quick rejection via toggle switch"
        );
        
        if (!result) throw new Error('Rejection failed');
        toast.success(`${dealer.dealershipName} verification has been revoked`);
      }
      
      // Invalidate and refetch data to update UI immediately
      await invalidateDealersCache();
      refetch();
    } catch (error) {
      console.error('Error toggling dealer verification:', error);
      toast.error('Failed to update dealer verification status: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReviewDealer = (dealer: DealerData) => {
    setSelectedDealer(dealer);
    setIsReviewOpen(true);
    setRejectionReason(dealer.verification_status === 'rejected' ? "Verification revoked" : "");
    setAdminNotes("");
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSearchQuery("");
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  // Reset to page 1 when tab changes
  useEffect(() => {
    setCurrentPage(1);
    setSearchQuery("");
  }, [activeTab]);

  const handleExportCSV = () => {
    if (displayDealers.length === 0) {
      toast.error("No dealers to export");
      return;
    }

    try {
      exportDealerVerificationsToCSV(displayDealers, activeTab);
      toast.success(`Successfully exported ${displayDealers.length} dealer${displayDealers.length !== 1 ? 's' : ''}`);
    } catch (error) {
      console.error('Error exporting dealers:', error);
      toast.error('Failed to export dealers');
    }
  };

  return {
    dealers: displayDealers,
    isLoading: isLoading || (isSearching && isSearchLoading),
    refetch,
    selectedDealer,
    setSelectedDealer,
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
    pagination: displayPagination,
    handlePageChange,
    handlePageSizeChange,
    handleApproveDealer,
    handleRejectDealer,
    handleToggleVerification,
    handleReviewDealer,
    handleExportCSV
  };
};
