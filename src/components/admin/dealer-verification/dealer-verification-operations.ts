
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DealerData } from "./types";
import { objectToCamelCase } from "@/utils/caseConverter";

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
    
    // Update dealer record directly
    const { data, error } = await supabase
      .from('dealers')
      .update({ 
        verification_status: 'approved',
        is_verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', dealerId)
      .select();
    
    if (error) {
      console.error('Error in approveDealer:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.error('No data returned from dealer update');
      throw new Error('Verification failed - no response from server');
    }
    
    // Log the action
    await supabase
      .from('audit_logs')
      .insert({
        user_id: adminId,
        action: 'approve',
        entity_type: 'dealer',
        entity_id: dealerId,
        details: {
          notes: notes || null,
          verification_status: 'approved'
        }
      });
    
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
    
    // Update dealer record directly
    const { data, error } = await supabase
      .from('dealers')
      .update({ 
        verification_status: 'rejected',
        is_verified: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', dealerId)
      .select();
    
    if (error) {
      console.error('Error in rejectDealer:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.error('No data returned from dealer update');
      throw new Error('Rejection failed - no response from server');
    }
    
    // Log the action
    await supabase
      .from('audit_logs')
      .insert({
        user_id: adminId,
        action: 'reject',
        entity_type: 'dealer',
        entity_id: dealerId,
        details: {
          rejection_reason: rejectionReason,
          notes: notes || null,
          verification_status: 'rejected'
        }
      });
    
    return true;
  } catch (error) {
    console.error('Error rejecting dealer:', error);
    toast.error('Failed to reject dealer: ' + (error instanceof Error ? error.message : 'Unknown error'));
    return false;
  }
};

/**
 * Fetches the list of dealers with optional filtering by verification status
 * Uses the new admin function for complete access
 */
export const fetchDealers = async (status?: string): Promise<DealerData[]> => {
  try {
    console.log('Fetching dealers with status:', status);
    
    // Use the admin function to get all dealers with complete information
    const { data: dealersData, error: dealersError } = await supabase
      .rpc('admin_get_all_dealers');

    if (dealersError) {
      console.error('Error fetching dealers:', dealersError);
      throw dealersError;
    }
    
    if (!dealersData) {
      console.log('No dealers data returned');
      return [];
    }
    
    console.log(`Fetched ${dealersData.length} dealers from admin function`);
    
    // Filter by status if specified
    let filteredDealers = dealersData;
    if (status && status !== "all") {
      filteredDealers = dealersData.filter((dealer: any) => dealer.verification_status === status);
    }
    
    // Convert snake_case to camelCase and ensure proper typing
    const typedDealers: DealerData[] = filteredDealers.map((dealer: any) => ({
      id: dealer.id,
      userId: dealer.user_id,
      supervisorName: dealer.supervisor_name,
      dealershipName: dealer.dealership_name,
      taxId: dealer.tax_id,
      businessRegistryNumber: dealer.business_registry_number,
      address: dealer.address,
      licenseNumber: dealer.license_number,
      verification_status: dealer.verification_status as any,
      isVerified: dealer.is_verified,
      createdAt: dealer.created_at,
      updatedAt: dealer.updated_at
    }));
    
    console.log(`Returning ${typedDealers.length} filtered dealers`);
    return typedDealers;
  } catch (error) {
    console.error('Error fetching dealers:', error);
    toast.error('Failed to load dealers: ' + (error instanceof Error ? error.message : 'Unknown error'));
    return [];
  }
};
