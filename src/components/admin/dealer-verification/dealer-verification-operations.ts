
import { toast } from "sonner";
import { DealerData } from "./types";
import { supabase } from "@/integrations/supabase/client";
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

    console.log('Approving dealer via edge function:', { dealerId, adminId, notes });
    
    // Use edge function with service role access to bypass RLS
    const result = await edgeFunctionAdminOperations.verifyDealer(dealerId, notes);
    
    if (!result) {
      throw new Error('Failed to approve dealer - no response from server');
    }
    
    console.log('Dealer approved successfully:', result);
    toast.success('Dealer approved successfully');
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
    
    console.log('Rejecting dealer via edge function:', { dealerId, adminId, rejectionReason, notes });
    
    // Use edge function with service role access to bypass RLS
    const result = await edgeFunctionAdminOperations.rejectDealer(dealerId, rejectionReason, notes);
    
    if (!result) {
      throw new Error('Failed to reject dealer - no response from server');
    }
    
    console.log('Dealer rejected successfully:', result);
    toast.success('Dealer rejected successfully');
    return true;
  } catch (error) {
    console.error('Error rejecting dealer:', error);
    toast.error('Failed to reject dealer: ' + (error instanceof Error ? error.message : 'Unknown error'));
    return false;
  }
};

export interface PaginationMetadata {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

const defaultPagination: PaginationMetadata = {
  page: 1,
  pageSize: 40,
  totalCount: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false
};

/**
 * Fetches the list of dealers with optional filtering by verification status
 * Uses direct admin client access with server-side pagination
 */
export const fetchDealers = async (
  status?: string,
  page: number = 1,
  pageSize: number = 40
): Promise<{ dealers: DealerData[], pagination: PaginationMetadata }> => {
  try {
    console.log('Fetching dealers with pagination:', { status, page, pageSize });
    
    // Use edge function which includes email fetching with service role
    const result = await edgeFunctionAdminOperations.getAllDealers(status, page, pageSize) as any;
    
    if (!result) {
      console.log('No dealers data returned');
      return { dealers: [], pagination: defaultPagination };
    }
    
    // Convert to frontend format
    const typedDealers: DealerData[] = (result.dealers || []).map((dealer: any) => ({
      id: dealer.id,
      userId: dealer.user_id,
      supervisorName: dealer.supervisor_name,
      dealershipName: dealer.dealership_name,
      taxId: dealer.tax_id,
      businessRegistryNumber: dealer.business_registry_number,
      address: dealer.address,
      licenseNumber: dealer.license_number,
      verification_status: dealer.verification_status,
      isVerified: dealer.is_verified,
      createdAt: dealer.created_at,
      updatedAt: dealer.updated_at,
      email: dealer.email,
      phoneNumber: dealer.phone_number,
      subscriptionStatus: dealer.subscription_status ?? null,
      subscriptionCurrentPeriodEnd: dealer.subscription_current_period_end ?? null,
      subscriptionCancelAtPeriodEnd: dealer.subscription_cancel_at_period_end ?? false,
    }));
    
    return {
      dealers: typedDealers,
      pagination: result.pagination || defaultPagination
    };
  } catch (error) {
    console.error('Error fetching dealers:', error);
    toast.error('Failed to load dealers');
    return { dealers: [], pagination: defaultPagination };
  }
};
