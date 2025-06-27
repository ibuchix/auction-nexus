
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminOperationResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Direct HTTP fetch implementation to bypass supabase.functions.invoke issues
export async function performAdminOperation<T>(
  action: string,
  params?: Record<string, any>
): Promise<T | null> {
  try {
    console.log('=== Admin Operation Direct Fetch START ===');
    console.log('Action:', action);
    console.log('Params:', params);
    
    // Use hardcoded values from the Supabase client configuration
    const supabaseUrl = "https://sdvakfhmoaoucmhbhwvy.supabase.co";
    const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkdmFrZmhtb2FvdWNtaGJod3Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3OTI1OTEsImV4cCI6MjA1MDM2ODU5MX0.wvvxbqF3Hg_fmQ_4aJCqISQvcFXhm-2BngjvO6EHL0M";
    
    console.log('Using Supabase URL:', supabaseUrl);
    console.log('Using Anon Key (first 20 chars):', anonKey.substring(0, 20) + '...');
    
    // Get current session for authentication
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Session available:', !!session);
    
    const requestBody = {
      action: action,
      params: params || {}
    };
    
    console.log('Request body:', requestBody);
    const bodyString = JSON.stringify(requestBody);
    console.log('Request body JSON:', bodyString);
    
    const response = await fetch(`${supabaseUrl}/functions/v1/admin-api`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': session?.access_token ? `Bearer ${session.access_token}` : '',
        'apikey': anonKey
      },
      body: bodyString
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Response data:', data);
    
    if (data.success === false) {
      console.error('Operation failed:', data.error);
      toast.error(`Operation failed: ${data.error || 'Unknown error'}`);
      return null;
    }
    
    // Handle response format
    if (data.success && data.data !== undefined) {
      console.log('Returning structured data:', data.data);
      return data.data as T;
    } else if (data.success) {
      // Legacy format - return the whole response
      console.log('Returning legacy format data:', data);
      return data as T;
    }
    
    return data as T;
    
  } catch (error) {
    console.error(`Admin operation failed (${action}):`, error);
    toast.error(`Admin operation failed: ${(error as Error).message || 'Unknown error'}`);
    return null;
  } finally {
    console.log('=== Admin Operation Direct Fetch END ===');
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
    
    if (result.success !== undefined) {
      return result;
    } else {
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

// Admin operations using direct HTTP calls
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
    console.log('=== Calling getActiveAuctions ===');
    return performAdminOperation('getActiveAuctions', {});
  },
  
  getAuctionListings: async (params: { 
    showAllCars: boolean, 
    status: string | null,
    includeFiles?: boolean 
  }) => {
    console.log('=== Calling getAuctionListings ===');
    console.log('Parameters being sent:', params);
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
    try {
      await performAdminOperation('checkSystemHealth');
      
      const { data: stuckAuctions } = await supabase
        .from('cars')
        .select('id')
        .eq('auction_status', 'active')
        .lt('auction_end_time', new Date().toISOString());
      
      if (stuckAuctions && stuckAuctions.length > 0) {
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
