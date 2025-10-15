
import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DealerData, VerificationStatus } from "./types";
import { useAuth } from "@/hooks/useAuth";
import { approveDealer, rejectDealer, fetchDealers } from "./dealer-verification-operations";

export const useDealerVerification = () => {
  const [selectedDealer, setSelectedDealer] = useState<DealerData | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [activeTab, setActiveTab] = useState<VerificationStatus | "all">("pending");
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { 
    data: dealers, 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ['dealersList', activeTab],
    queryFn: () => fetchDealers(activeTab),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const filteredDealers = useMemo(() => {
    if (!dealers) return [];
    if (!searchQuery.trim()) return dealers;
    
    const query = searchQuery.toLowerCase().trim();
    return dealers.filter(dealer => 
      dealer.email?.toLowerCase().includes(query)
    );
  }, [dealers, searchQuery]);

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

  return {
    dealers: filteredDealers,
    isLoading,
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
    handleApproveDealer,
    handleRejectDealer,
    handleToggleVerification,
    handleReviewDealer
  };
};
