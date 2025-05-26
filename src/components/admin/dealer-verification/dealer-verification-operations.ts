
import { toast } from "sonner";
import { DealerData } from "./types";
import { edgeFunctionAdminOperations } from "@/utils/edgeFunctionAdminOperations";

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
    
    // Use Edge Function API for dealer verification
    const result = await edgeFunctionAdminOperations.verifyDealer(dealerId, notes);
    
    if (!result) {
      throw new Error('Verification failed - no response from server');
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
    
    // Use Edge Function API for dealer rejection
    const result = await edgeFunctionAdminOperations.rejectDealer(dealerId, rejectionReason, notes);
    
    if (!result) {
      throw new Error('Rejection failed - no response from server');
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
 * Uses Edge Function API for admin access
 */
export const fetchDealers = async (status?: string): Promise<DealerData[]> => {
  try {
    console.log('Fetching dealers with status:', status);
    
    // Use Edge Function API to get all dealers
    const dealersData = await edgeFunctionAdminOperations.getAllDealers();

    if (!dealersData || !Array.isArray(dealersData)) {
      console.log('No dealers data returned or invalid format');
      return [];
    }
    
    console.log(`Fetched ${dealersData.length} dealers from Edge Function`);
    
    // Filter by status if specified
    let filteredDealers = dealersData;
    if (status && status !== "all") {
      filteredDealers = dealersData.filter((dealer: any) => dealer.verification_status === status);
    }
    
    // Convert to frontend format
    const typedDealers: DealerData[] = filteredDealers.map((dealer: any) => ({
      id: dealer.id,
      userId: dealer.user_id || dealer.userId,
      supervisorName: dealer.supervisor_name || dealer.supervisorName,
      dealershipName: dealer.dealership_name || dealer.dealershipName,
      taxId: dealer.tax_id || dealer.taxId,
      businessRegistryNumber: dealer.business_registry_number || dealer.businessRegistryNumber,
      address: dealer.address,
      licenseNumber: dealer.license_number || dealer.licenseNumber,
      verification_status: dealer.verification_status,
      isVerified: dealer.is_verified || dealer.isVerified,
      createdAt: dealer.created_at || dealer.createdAt,
      updatedAt: dealer.updated_at || dealer.updatedAt
    }));
    
    console.log(`Returning ${typedDealers.length} filtered dealers`);
    return typedDealers;
  } catch (error) {
    console.error('Error fetching dealers:', error);
    toast.error('Failed to load dealers: ' + (error instanceof Error ? error.message : 'Unknown error'));
    return [];
  }
};
