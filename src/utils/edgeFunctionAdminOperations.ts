
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminOperationResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Generic admin operation handler with improved error handling and debugging
export async function performAdminOperation<T>(
  action: string,
  params?: Record<string, any>
): Promise<T | null> {
  try {
    console.log('=== Admin Operation Client Debug START ===');
    console.log('Action:', action);
    console.log('Params:', params);
    
    // Test connection first with a simple test action
    if (action !== 'test') {
      console.log('Testing connection first...');
      try {
        const testResult = await supabase.functions.invoke('admin-api', {
          body: JSON.stringify({ action: 'test' }),
          headers: { 'Content-Type': 'application/json' }
        });
        console.log('Test connection result:', testResult);
      } catch (testError) {
        console.log('Test connection failed:', testError);
      }
    }
    
    // Prepare the request body with explicit action and params
    const requestBody = {
      action: action,
      params: params || {}
    };
    
    console.log('=== Request Body Construction ===');
    console.log('Request body object:', requestBody);
    const bodyString = JSON.stringify(requestBody);
    console.log('Request body JSON string:', bodyString);
    console.log('Request body size:', bodyString.length);
    
    // Method 1: Try with supabase.functions.invoke
    console.log('=== Making Edge Function Request (Method 1: invoke) ===');
    let data, error;
    
    try {
      const response = await supabase.functions.invoke('admin-api', {
        body: bodyString,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      data = response.data;
      error = response.error;
      
      console.log('Invoke method - Response data:', data);
      console.log('Invoke method - Response error:', error);
      
    } catch (invokeError) {
      console.log('Invoke method failed, trying direct fetch...');
      console.error('Invoke error:', invokeError);
      
      // Method 2: Fallback to direct fetch
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        if (!supabaseUrl) {
          throw new Error('VITE_SUPABASE_URL not found');
        }
        
        const { data: { session } } = await supabase.auth.getSession();
        
        const fetchResponse = await fetch(`${supabaseUrl}/functions/v1/admin-api`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': session?.access_token ? `Bearer ${session.access_token}` : '',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || ''
          },
          body: bodyString
        });
        
        console.log('Direct fetch - Response status:', fetchResponse.status);
        console.log('Direct fetch - Response ok:', fetchResponse.ok);
        
        if (!fetchResponse.ok) {
          const errorText = await fetchResponse.text();
          console.log('Direct fetch - Error response:', errorText);
          throw new Error(`HTTP ${fetchResponse.status}: ${errorText}`);
        }
        
        data = await fetchResponse.json();
        error = null;
        
        console.log('Direct fetch - Success data:', data);
        
      } catch (fetchError) {
        console.error('Direct fetch also failed:', fetchError);
        error = fetchError;
        data = null;
      }
    }
    
    console.log('=== Final Admin Operation Response ===');
    console.log('Response data:', data);
    console.log('Response error:', error);
    
    if (error) {
      console.error(`Admin operation failed (${action}):`, error);
      
      // Handle different types of errors
      if (error.message && error.message.includes('FunctionsHttpError')) {
        toast.error(`Server error: Unable to process ${action} request`);
      } else if (error.message && error.message.includes('HTTP 400')) {
        toast.error(`Bad request for ${action}. Check the parameters.`);
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
          console.log('=== Successful Response Data ===');
          console.log('Data content:', data.data);
          console.log('Data type:', typeof data.data);
          console.log('Is array:', Array.isArray(data.data));
          
          return data.data as T;
        } else {
          console.error('Operation returned success=false:', data.error);
          toast.error(`Operation failed: ${data.error || 'Unknown error'}`);
          return null;
        }
      } else {
        // Legacy direct data response
        console.log('=== Legacy Response Format ===');
        console.log('Direct data:', data);
        return data as T;
      }
    }
    
    return data as T;
    
  } catch (error) {
    console.error(`Admin operation failed (${action}):`, error);
    toast.error(`Admin operation failed: ${(error as Error).message || 'Unknown error'}`);
    return null;
  } finally {
    console.log('=== Admin Operation Client Debug END ===');
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
    console.log('=== Calling getActiveAuctions ===');
    return performAdminOperation('getActiveAuctions', {});
  },
  
  // Updated to make status an optional parameter and include file uploads
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
