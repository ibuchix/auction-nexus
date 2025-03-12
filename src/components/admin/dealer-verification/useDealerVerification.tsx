
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminSupabase } from "@/integrations/supabase/adminClient";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DealerData, VerificationStatus } from "./types";

export const useDealerVerification = () => {
  const [selectedDealer, setSelectedDealer] = useState<DealerData | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [activeTab, setActiveTab] = useState<VerificationStatus | "all">("pending");
  const [isProcessing, setIsProcessing] = useState(false);

  const { 
    data: dealers, 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ['dealersList', activeTab],
    queryFn: async () => {
      try {
        // Fetch all dealers directly from the dealers table
        let query = adminSupabase
          .from('dealers')
          .select('*')
          .order('created_at', { ascending: false });
        
        // Apply filter if not showing all dealers
        if (activeTab !== "all") {
          query = query.eq('verification_status', activeTab);
        }
        
        const { data: dealersData, error: dealersError } = await query;

        if (dealersError) throw dealersError;
        
        // Type-safe dealers data with proper verification status type
        const typedDealers: DealerData[] = dealersData.map(dealer => ({
          ...dealer,
          verification_status: dealer.verification_status as VerificationStatus
        }));
        
        return typedDealers;
      } catch (error) {
        console.error('Error fetching dealers:', error);
        toast.error('Failed to load dealers');
        return [];
      }
    }
  });

  const handleApproveDealer = async () => {
    if (!selectedDealer) return;
    
    setIsProcessing(true);
    
    try {
      // Get the admin's ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated as admin');
      
      // Call the RPC function to verify the dealer
      const { data, error } = await adminSupabase.rpc(
        'verify_dealer',
        { 
          p_dealer_id: selectedDealer.id,
          p_admin_id: user.id,
          p_notes: adminNotes
        }
      );
      
      if (error) throw error;
      
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
    if (!selectedDealer || !rejectionReason) return;
    
    setIsProcessing(true);
    
    try {
      // Get the admin's ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated as admin');
      
      // Call the RPC function to reject the dealer
      const { data, error } = await adminSupabase.rpc(
        'reject_dealer',
        { 
          p_dealer_id: selectedDealer.id,
          p_admin_id: user.id,
          p_rejection_reason: rejectionReason,
          p_notes: adminNotes
        }
      );
      
      if (error) throw error;
      
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
    setIsProcessing(true);
    
    try {
      // Get the admin's ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated as admin');
      
      if (newStatus) {
        // Approve
        const { data, error } = await adminSupabase.rpc(
          'verify_dealer',
          { 
            p_dealer_id: dealer.id,
            p_admin_id: user.id,
            p_notes: "Quick verification via toggle switch"
          }
        );
        
        if (error) throw error;
        toast.success(`${dealer.dealership_name} has been approved`);
      } else {
        // Reject
        const { data, error } = await adminSupabase.rpc(
          'reject_dealer',
          { 
            p_dealer_id: dealer.id,
            p_admin_id: user.id,
            p_rejection_reason: "Verification revoked",
            p_notes: "Quick rejection via toggle switch"
          }
        );
        
        if (error) throw error;
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
