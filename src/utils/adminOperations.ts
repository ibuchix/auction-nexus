
import { supabase } from '@/integrations/supabase/client';
import { objectToCamelCase, objectToSnakeCase } from './caseConverter';
import { toast } from 'sonner';

// Generic admin operation handler with error handling and case conversion
export async function performAdminOperation<T>(
  operationName: string,
  operation: () => Promise<{ data: any; error: any }>
): Promise<T | null> {
  try {
    const { data, error } = await operation();
    
    if (error) {
      console.error(`Admin operation failed (${operationName}):`, error);
      toast.error(`Operation failed: ${error.message || 'Unknown error'}`);
      return null;
    }
    
    // Convert snake_case to camelCase for frontend use
    return data ? objectToCamelCase(data) as T : null;
  } catch (error) {
    console.error(`Admin operation failed (${operationName}):`, error);
    toast.error(`Operation failed: ${(error as Error).message || 'Unknown error'}`);
    return null;
  }
}

// Simplified admin operations using direct Supabase calls
export const adminOperations = {
  // Fetch all dealers
  getAllDealers: async (status?: string) => {
    return performAdminOperation('getAllDealers', async () => {
      let query = supabase.from('dealers').select('*').order('created_at', { ascending: false });
      
      if (status && status !== 'all') {
        query = query.eq('verification_status', status);
      }
      
      return await query;
    });
  },
  
  // Verify dealer
  verifyDealer: async (dealerId: string, adminId: string, notes?: string) => {
    return performAdminOperation('verifyDealer', async () => {
      return await supabase.rpc('verify_dealer', {
        p_dealer_id: dealerId,
        p_admin_id: adminId,
        p_notes: notes
      });
    });
  },
  
  // Reject dealer
  rejectDealer: async (dealerId: string, adminId: string, rejectionReason: string, notes?: string) => {
    return performAdminOperation('rejectDealer', async () => {
      return await supabase.rpc('reject_dealer', {
        p_dealer_id: dealerId,
        p_admin_id: adminId,
        p_rejection_reason: rejectionReason,
        p_notes: notes
      });
    });
  },
  
  // Fetch all users
  getAllUsers: async () => {
    return performAdminOperation('getAllUsers', async () => {
      return await supabase.from('profiles').select('*');
    });
  },
  
  // Fetch all sellers
  getAllSellers: async () => {
    return performAdminOperation('getAllSellers', async () => {
      return await supabase.from('sellers').select('*');
    });
  },
  
  // Update user role
  updateUserRole: async (userId: string, role: 'admin' | 'dealer' | 'seller') => {
    return performAdminOperation('updateUserRole', async () => {
      return await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId)
        .select()
        .single();
    });
  },
  
  // Suspend user
  suspendUser: async (userId: string, suspended: boolean) => {
    return performAdminOperation('suspendUser', async () => {
      return await supabase
        .from('profiles')
        .update({ suspended })
        .eq('id', userId)
        .select()
        .single();
    });
  },
  
  // Get active auctions
  getActiveAuctions: async () => {
    return performAdminOperation('getActiveAuctions', async () => {
      return await supabase
        .from('cars')
        .select('*')
        .in('auction_status', ['active', 'pending'])
        .eq('is_auction', true)
        .order('auction_end_time', { ascending: true });
    });
  },
  
  // Get auction listings
  getAuctionListings: async (showAllCars: boolean = true, status?: string) => {
    return performAdminOperation('getAuctionListings', async () => {
      let query = supabase.from('cars').select('*');
      
      if (!showAllCars && status) {
        query = query.eq('auction_status', status);
      }
      
      return await query.order('created_at', { ascending: false });
    });
  },
  
  // Delete seller
  deleteSeller: async (sellerId: string) => {
    return performAdminOperation('deleteSeller', async () => {
      // First delete any cars associated with this seller
      await supabase.from('cars').delete().eq('seller_id', sellerId);
      
      // Then delete the seller profile
      return await supabase.from('profiles').delete().eq('id', sellerId);
    });
  }
};
