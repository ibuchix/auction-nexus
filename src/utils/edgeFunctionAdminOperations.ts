
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminOperationResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Generic admin operation handler with improved error handling
export async function performAdminOperation<T>(
  action: string,
  params?: Record<string, any>
): Promise<T | null> {
  try {
    console.log('=== Admin Operation Client Debug ===');
    console.log('Action:', action);
    console.log('Params:', params);
    
    // Get the current user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('No valid session found:', sessionError);
      toast.error('Authentication required. Please log in again.');
      return null;
    }
    
    console.log('Session found for user:', session.user.id);
    console.log('Token length:', session.access_token.length);
    
    // Prepare the request body - ensure it's always valid JSON
    const requestBody = {
      action,
      ...(params && { params })
    };
    
    console.log('Request body to send:', requestBody);
    console.log('Request body JSON:', JSON.stringify(requestBody));
    
    // Make the request with explicit configuration
    const { data, error } = await supabase.functions.invoke('admin-api', {
      body: requestBody, // Don't JSON.stringify - Supabase does this automatically
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('=== Admin Operation Response ===');
    console.log('Response data:', data);
    console.log('Response error:', error);
    
    if (error) {
      console.error(`Admin operation failed (${action}):`, error);
      
      // Handle different types of errors
      if (error.message && error.message.includes('FunctionsHttpError')) {
        toast.error(`Server error: Unable to process ${action} request`);
      } else {
        toast.error(`Admin operation failed: ${error.message || 'Unknown error'}`);
      }
      return null;
    }
    
    // Handle successful response - check if it's wrapped in our response format
    if (data && typeof data === 'object') {
      if (data.success !== undefined) {
        // New response format with success wrapper
        if (data.success) {
          return data.data as T;
        } else {
          console.error('Operation returned success=false:', data.error);
          toast.error(`Operation failed: ${data.error || 'Unknown error'}`);
          return null;
        }
      } else {
        // Legacy direct data response
        return data as T;
      }
    }
    
    return data as T;
    
  } catch (error) {
    console.error(`Admin operation failed (${action}):`, error);
    toast.error(`Admin operation failed: ${(error as Error).message || 'Unknown error'}`);
    return null;
  }
}

// Check if the admin API access is working
export async function verifyAdminAccess(): Promise<AdminOperationResponse<{userId: string}>> {
  try {
    console.log('=== Verifying Admin Access ===');
    const result = await performAdminOperation<any>('verifyAccess');
    
    if (!result) {
      return { success: false, error: 'Failed to verify access - no response' };
    }
    
    console.log('Admin access verification result:', result);
    
    // Handle both old and new response formats
    if (result.success !== undefined) {
      return result;
    } else {
      // Legacy format - assume success if we got data
      return {
        success: true,
        data: result
      };
    }
  } catch (error) {
    console.error('Admin access verification failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Admin operations using Edge Function with proper authentication
export const edgeFunctionAdminOperations = {
  // User management
  getAllUsers: async () => {
    return performAdminOperation('getAllUsers');
  },
  
  getAllSellers: async () => {
    return performAdminOperation('getAllSellers');
  },
  
  getAllDealers: async () => {
    return performAdminOperation('getAllDealers');
  },
  
  getSellerCars: async () => {
    return performAdminOperation('getSellerCars');
  },
  
  updateUserRole: async (userId: string, role: 'admin' | 'dealer' | 'seller') => {
    return performAdminOperation('updateUserRole', { userId, role });
  },

  suspendUser: async (userId: string, suspended: boolean) => {
    return performAdminOperation('suspendUser', { userId, suspended });
  },
  
  // Dealer verification
  verifyDealer: async (dealerId: string, notes?: string) => {
    return performAdminOperation('verifyDealer', { dealerId, notes });
  },
  
  rejectDealer: async (dealerId: string, rejectionReason: string, notes?: string) => {
    return performAdminOperation('rejectDealer', { dealerId, rejectionReason, notes });
  },
  
  // Seller management
  deleteSeller: async (sellerId: string) => {
    return performAdminOperation('deleteSeller', { sellerId });
  },
  
  // Auction management
  getActiveAuctions: async () => {
    return performAdminOperation('getActiveAuctions');
  },
  
  // Updated to make status an optional parameter and include file uploads
  getAuctionListings: async (params: { 
    showAllCars: boolean, 
    status: string | null,
    includeFiles?: boolean 
  }) => {
    return performAdminOperation('getAuctionListings', params);
  },
  
  pauseAuction: async (auctionId: string) => {
    return performAdminOperation('pauseAuction', { auctionId });
  },
  
  startAuction: async (auctionId: string) => {
    return performAdminOperation('startAuction', { auctionId });
  },
  
  cancelAuction: async (auctionId: string) => {
    return performAdminOperation('cancelAuction', { auctionId });
  },
  
  // System health
  checkSystemHealth: async () => {
    return performAdminOperation('checkSystemHealth');
  },
  
  // Recovery operations
  recoverAuction: async (
    auctionId: string, 
    action: 'reset' | 'force_complete' | 'force_start' | 'reset_bids'
  ) => {
    return performAdminOperation('recoverAuction', { auctionId, action });
  },
  
  resetSystemState: async () => {
    // This is a higher-level function that performs multiple recovery operations
    try {
      // First check system health
      await performAdminOperation('checkSystemHealth');
      
      // Get all active auctions that should have ended
      const { data: stuckAuctions } = await supabase
        .from('cars')
        .select('id')
        .eq('auction_status', 'active')
        .lt('auction_end_time', new Date().toISOString());
      
      if (stuckAuctions && stuckAuctions.length > 0) {
        // Force complete each stuck auction
        for (const auction of stuckAuctions) {
          await performAdminOperation('recoverAuction', { 
            auctionId: auction.id, 
            action: 'force_complete'
          });
        }
      }
      
      toast.success(`System reset completed successfully`);
      return { success: true };
    } catch (error) {
      console.error('Error resetting system state:', error);
      toast.error(`Failed to reset system: ${(error as Error).message}`);
      return { success: false, error };
    }
  }
};
