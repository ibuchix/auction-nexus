
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

// Direct admin operations using Supabase with admin privileges
export const adminOperations = {
  // Fetch all dealers using the admin function
  getAllDealers: async (status?: string) => {
    return performAdminOperation('getAllDealers', async () => {
      const { data, error } = await supabase.rpc('admin_get_all_dealers');
      
      if (!error && data && status && status !== 'all') {
        // Filter by status if specified
        const filtered = data.filter((dealer: any) => dealer.verification_status === status);
        return { data: filtered, error: null };
      }
      
      return { data, error };
    });
  },
  
  // Verify dealer using direct database access
  verifyDealer: async (dealerId: string, adminId: string, notes?: string) => {
    return performAdminOperation('verifyDealer', async () => {
      // Update dealer directly
      const { data, error } = await supabase
        .from('dealers')
        .update({
          verification_status: 'approved',
          is_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', dealerId)
        .select()
        .single();
      
      if (!error && data) {
        // Log the action
        await supabase
          .from('audit_logs')
          .insert({
            user_id: adminId,
            action: 'approve',
            entity_type: 'dealer',
            entity_id: dealerId,
            details: { notes }
          });
      }
      
      return { data, error };
    });
  },
  
  // Reject dealer using direct database access
  rejectDealer: async (dealerId: string, adminId: string, rejectionReason: string, notes?: string) => {
    return performAdminOperation('rejectDealer', async () => {
      // Update dealer directly
      const { data, error } = await supabase
        .from('dealers')
        .update({
          verification_status: 'rejected',
          is_verified: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', dealerId)
        .select()
        .single();
      
      if (!error && data) {
        // Log the action
        await supabase
          .from('audit_logs')
          .insert({
            user_id: adminId,
            action: 'reject',
            entity_type: 'dealer',
            entity_id: dealerId,
            details: { rejection_reason: rejectionReason, notes }
          });
      }
      
      return { data, error };
    });
  },
  
  // Fetch all users with admin access
  getAllUsers: async () => {
    return performAdminOperation('getAllUsers', async () => {
      return await supabase.from('profiles').select('*').order('updated_at', { ascending: false });
    });
  },
  
  // Fetch all sellers with admin access
  getAllSellers: async () => {
    return performAdminOperation('getAllSellers', async () => {
      return await supabase.from('sellers').select('*').order('created_at', { ascending: false });
    });
  },
  
  // Update user role with admin access
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
  
  // Suspend user with admin access
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
  
  // Get active auctions with admin access
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
  
  // Get auction listings with admin access
  getAuctionListings: async (showAllCars: boolean = true, status?: string) => {
    return performAdminOperation('getAuctionListings', async () => {
      let query = supabase.from('cars').select('*');
      
      if (!showAllCars && status) {
        query = query.eq('auction_status', status);
      }
      
      return await query.order('created_at', { ascending: false });
    });
  },
  
  // Delete seller with admin access
  deleteSeller: async (sellerId: string) => {
    return performAdminOperation('deleteSeller', async () => {
      // First delete any cars associated with this seller
      await supabase.from('cars').delete().eq('seller_id', sellerId);
      
      // Then delete the seller profile
      return await supabase.from('sellers').delete().eq('user_id', sellerId);
    });
  }
};
