
import { adminSupabase } from "@/integrations/supabase/adminClient";
import { toast } from "sonner";
import { DealerData } from "./types";

/**
 * Handles the approval of a dealer's verification request
 */
export const approveDealer = async (
  dealerId: string, 
  adminId: string, 
  notes?: string
): Promise<boolean> => {
  try {
    const { data, error } = await adminSupabase.rpc(
      'verify_dealer',
      { p_dealer_id: dealerId, p_admin_id: adminId, p_notes: notes }
    );
    
    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Error approving dealer:', error);
    toast.error('Failed to approve dealer');
    return false;
  }
};

/**
 * Handles the rejection of a dealer's verification request
 */
export const rejectDealer = async (
  dealerId: string, 
  adminId: string, 
  rejectionReason: string, 
  notes?: string
): Promise<boolean> => {
  try {
    const { data, error } = await adminSupabase.rpc(
      'reject_dealer',
      { 
        p_dealer_id: dealerId, 
        p_admin_id: adminId,
        p_rejection_reason: rejectionReason,
        p_notes: notes 
      }
    );
    
    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Error rejecting dealer:', error);
    toast.error('Failed to reject dealer');
    return false;
  }
};

/**
 * Fetches the list of dealers with optional filtering by verification status
 */
export const fetchDealers = async (status?: string): Promise<DealerData[]> => {
  try {
    // Fetch all dealers directly from the dealers table
    let query = adminSupabase
      .from('dealers')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Apply filter if not showing all dealers
    if (status && status !== "all") {
      query = query.eq('verification_status', status);
    }
    
    const { data: dealersData, error: dealersError } = await query;

    if (dealersError) throw dealersError;
    
    // Type-safe dealers data with proper verification status type
    const typedDealers: DealerData[] = dealersData.map(dealer => ({
      ...dealer,
      verification_status: dealer.verification_status as any
    }));
    
    return typedDealers;
  } catch (error) {
    console.error('Error fetching dealers:', error);
    toast.error('Failed to load dealers');
    return [];
  }
};
