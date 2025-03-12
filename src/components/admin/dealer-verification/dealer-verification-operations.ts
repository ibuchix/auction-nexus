
import { adminSupabase } from "@/integrations/supabase/adminClient";
import { toast } from "sonner";
import { DealerData } from "./types";

// Helper to validate UUID format
const isValidUUID = (uuid: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Handles the approval of a dealer's verification request
 */
export const approveDealer = async (
  dealerId: string, 
  adminId: string, 
  notes?: string
): Promise<boolean> => {
  try {
    // Validate UUIDs before making the request
    if (!isValidUUID(dealerId)) {
      console.error('Invalid dealer ID format', { dealerId });
      toast.error('Invalid dealer ID format');
      return false;
    }
    
    if (!isValidUUID(adminId)) {
      console.error('Invalid admin ID format', { adminId });
      toast.error('Invalid admin ID format');
      return false;
    }

    console.log('Approving dealer with params:', { dealerId, adminId, notes });
    
    const { data, error } = await adminSupabase.rpc(
      'verify_dealer',
      { p_dealer_id: dealerId, p_admin_id: adminId, p_notes: notes || null }
    );
    
    if (error) {
      console.error('RPC error in approveDealer:', error);
      throw error;
    }
    
    if (!data) {
      console.error('No data returned from verify_dealer RPC');
      throw new Error('Verification failed - no response from server');
    }
    
    // Also directly update the dealer record to ensure UI consistency
    const { error: updateError } = await adminSupabase
      .from('dealers')
      .update({ 
        verification_status: 'approved',
        is_verified: true
      })
      .eq('id', dealerId);
    
    if (updateError) {
      console.error('Error updating dealer record:', updateError);
      // Don't throw here, as the RPC might have succeeded
    }
    
    return true;
  } catch (error) {
    console.error('Error approving dealer:', error);
    toast.error('Failed to approve dealer: ' + (error instanceof Error ? error.message : 'Unknown error'));
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
    // Validate UUIDs before making the request
    if (!isValidUUID(dealerId)) {
      console.error('Invalid dealer ID format', { dealerId });
      toast.error('Invalid dealer ID format');
      return false;
    }
    
    if (!isValidUUID(adminId)) {
      console.error('Invalid admin ID format', { adminId });
      toast.error('Invalid admin ID format');
      return false;
    }
    
    if (!rejectionReason) {
      toast.error('Rejection reason is required');
      return false;
    }
    
    console.log('Rejecting dealer with params:', { dealerId, adminId, rejectionReason, notes });
    
    const { data, error } = await adminSupabase.rpc(
      'reject_dealer',
      { 
        p_dealer_id: dealerId, 
        p_admin_id: adminId,
        p_rejection_reason: rejectionReason,
        p_notes: notes || null
      }
    );
    
    if (error) {
      console.error('RPC error in rejectDealer:', error);
      throw error;
    }
    
    if (!data) {
      console.error('No data returned from reject_dealer RPC');
      throw new Error('Rejection failed - no response from server');
    }
    
    // Also directly update the dealer record to ensure UI consistency
    const { error: updateError } = await adminSupabase
      .from('dealers')
      .update({ 
        verification_status: 'rejected',
        is_verified: false
      })
      .eq('id', dealerId);
    
    if (updateError) {
      console.error('Error updating dealer record:', updateError);
      // Don't throw here, as the RPC might have succeeded
    }
    
    return true;
  } catch (error) {
    console.error('Error rejecting dealer:', error);
    toast.error('Failed to reject dealer: ' + (error instanceof Error ? error.message : 'Unknown error'));
    return false;
  }
};

/**
 * Fetches the list of dealers with optional filtering by verification status
 */
export const fetchDealers = async (status?: string): Promise<DealerData[]> => {
  try {
    console.log('Fetching dealers with status:', status);
    
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

    if (dealersError) {
      console.error('Error fetching dealers:', dealersError);
      throw dealersError;
    }
    
    console.log(`Fetched ${dealersData.length} dealers`);
    
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
