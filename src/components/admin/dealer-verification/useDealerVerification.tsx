
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { DealerData, VerificationStatus } from "./types";
import { useAdmin } from "@/context/AdminContext";
import { approveDealer, rejectDealer, fetchDealers } from "./dealer-verification-operations";

export const useDealerVerification = () => {
  const [selectedDealer, setSelectedDealer] = useState<DealerData | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [activeTab, setActiveTab] = useState<VerificationStatus | "all">("pending");
  const [isProcessing, setIsProcessing] = useState(false);
  const { userId, operations } = useAdmin();

  // Fetch dealers data using React Query
  const { 
    data: dealers, 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ['dealersList', activeTab],
    queryFn: () => fetchDealers(activeTab)
  });

  const handleApproveDealer = async () => {
    if (!selectedDealer || !userId) {
      toast.error('Admin ID not available');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Use the admin operations utility with admin ID from context
      const result = await approveDealer(selectedDealer.id, userId, adminNotes);
      
      if (!result) throw new Error('Verification failed');
      
      toast.success(`${selectedDealer.dealership_name} has been approved`);
      setIsReviewOpen(false);
      setSelectedDealer(null);
      setAdminNotes("");
      refetch();
    } catch (error) {
      console.error('Error approving dealer:', error);
      toast.error('Failed to approve dealer');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectDealer = async () => {
    if (!selectedDealer || !rejectionReason || !userId) {
      toast.error('Admin ID not available or rejection reason missing');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Use the admin operations utility with admin ID from context
      const result = await rejectDealer(
        selectedDealer.id, 
        userId, 
        rejectionReason,
        adminNotes
      );
      
      if (!result) throw new Error('Rejection failed');
      
      toast.success(`${selectedDealer.dealership_name} has been rejected`);
      setIsReviewOpen(false);
      setSelectedDealer(null);
      setRejectionReason("");
      setAdminNotes("");
      refetch();
    } catch (error) {
      console.error('Error rejecting dealer:', error);
      toast.error('Failed to reject dealer');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleVerification = async (dealer: DealerData, newStatus: boolean) => {
    if (!userId) {
      toast.error('Admin ID not available');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      if (newStatus) {
        // Approve using admin operations with admin ID from context
        const result = await approveDealer(
          dealer.id,
          userId,
          "Quick verification via toggle switch"
        );
        
        if (!result) throw new Error('Verification failed');
        toast.success(`${dealer.dealership_name} has been approved`);
      } else {
        // Reject using admin operations with admin ID from context
        const result = await rejectDealer(
          dealer.id,
          userId,
          "Verification revoked",
          "Quick rejection via toggle switch"
        );
        
        if (!result) throw new Error('Rejection failed');
        toast.success(`${dealer.dealership_name} verification has been revoked`);
      }
      
      refetch();
    } catch (error) {
      console.error('Error toggling dealer verification:', error);
      toast.error('Failed to update dealer verification status');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReviewDealer = (dealer: DealerData) => {
    setSelectedDealer(dealer);
    setIsReviewOpen(true);
    // Initialize rejection reason if dealer was previously rejected
    setRejectionReason(dealer.verification_status === 'rejected' ? "Verification revoked" : "");
    setAdminNotes("");
  };

  return {
    dealers,
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
    handleApproveDealer,
    handleRejectDealer,
    handleToggleVerification,
    handleReviewDealer
  };
};
