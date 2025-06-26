
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminOperationResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Generic admin operation handler with proper authentication
export async function performAdminOperation<T>(
  action: string,
  params?: Record<string, any>
): Promise<T | null> {
  try {
    // Get the current user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('No valid session found:', sessionError);
      toast.error('Authentication required. Please log in again.');
      return null;
    }
    
    console.log('Making admin operation with user session:', {
      action,
      userId: session.user.id,
      hasAccessToken: !!session.access_token
    });
    
    const { data, error } = await supabase.functions.invoke('admin-api', {
      body: {
        action,
        params
      },
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (error) {
      console.error(`Admin operation failed (${action}):`, error);
      toast.error(`Admin operation failed: ${error.message || 'Unknown error'}`);
      return null;
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
    const result = await performAdminOperation<AdminOperationResponse<{userId: string}>>('verifyAccess');
    return result || { success: false, error: 'Failed to verify access' };
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
