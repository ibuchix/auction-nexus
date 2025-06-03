
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define types
type VerificationStatus = "pending" | "approved" | "rejected";

interface CarListing {
  id: string;
  make: string;
  model: string;
  year: number;
  reserve_price: number;
  created_at: string;
  status: string;
  seller_id: string;
  title: string;
  images?: string[];
}

interface ListingVerificationData {
  id: string;
  car_id: string;
  verification_status: VerificationStatus;
  submitted_at: string;
  reviewed_at: string | null;
  notes: string | null;
  rejection_reason: string | null;
  admin_id: string | null;
  car: CarListing;
}

export function useListingVerification() {
  const [selectedListing, setSelectedListing] = useState<ListingVerificationData | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [activeTab, setActiveTab] = useState<VerificationStatus>("pending");
  const [isProcessing, setIsProcessing] = useState(false);

  const { 
    data: verifications = [], 
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["listing-verifications", activeTab],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('listing_verifications')
          .select(`
            id,
            car_id,
            verification_status,
            submitted_at,
            reviewed_at,
            notes,
            rejection_reason,
            admin_id,
            car:cars!listing_verifications_car_id_fkey (
              id,
              make,
              model,
              year,
              reserve_price,
              created_at,
              status,
              seller_id,
              title,
              images
            )
          `)
          .eq('verification_status', activeTab);

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        
        // Filter out any records where car data failed to load
        const validData = (data || []).filter(item => 
          item.car && 
          typeof item.car === 'object' && 
          !('error' in item.car) &&
          item.car.id
        ) as ListingVerificationData[];
        
        return validData;
      } catch (error) {
        console.error('Error fetching listing verifications:', error);
        toast.error('Failed to load listing verifications');
        return [];
      }
    }
  });

  const openReviewDialog = (listing: ListingVerificationData) => {
    setSelectedListing(listing);
    setAdminNotes(listing.notes || "");
    setRejectionReason(listing.rejection_reason || "");
    setIsReviewOpen(true);
  };

  const getUserId = async (): Promise<string> => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      throw new Error("User not authenticated");
    }
    return data.user.id;
  };

  const handleApprove = async () => {
    if (!selectedListing) return;
    
    setIsProcessing(true);
    try {
      const adminId = await getUserId();
      
      const { error } = await supabase.rpc(
        'approve_listing',
        {
          p_listing_id: selectedListing.car_id,
          p_admin_id: adminId,
          p_notes: adminNotes
        }
      );
      
      if (error) throw error;
      
      toast.success("Listing approved successfully");
      setIsReviewOpen(false);
      refetch();
    } catch (error) {
      console.error('Error approving listing:', error);
      toast.error('Failed to approve listing');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleReject = async () => {
    if (!selectedListing || !rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    
    setIsProcessing(true);
    try {
      const adminId = await getUserId();
      
      const { error } = await supabase.rpc(
        'reject_listing',
        {
          p_listing_id: selectedListing.car_id,
          p_admin_id: adminId,
          p_rejection_reason: rejectionReason,
          p_notes: adminNotes
        }
      );
      
      if (error) throw error;
      
      toast.success("Listing rejected");
      setIsReviewOpen(false);
      refetch();
    } catch (error) {
      console.error('Error rejecting listing:', error);
      toast.error('Failed to reject listing');
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    verifications,
    isLoading,
    refetch,
    selectedListing,
    isReviewOpen,
    setIsReviewOpen,
    rejectionReason,
    setRejectionReason,
    adminNotes,
    setAdminNotes,
    activeTab,
    setActiveTab,
    isProcessing,
    openReviewDialog,
    handleApprove,
    handleReject
  };
}

export type { VerificationStatus, ListingVerificationData, CarListing };
