import { adminSupabase } from '@/integrations/supabase/adminClient';
import { objectToCamelCase, objectToSnakeCase } from './caseConverter';
import { toast } from 'sonner';
import { AuctionScheduleStatus } from '@/types/auction';

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

// Direct admin operations using Supabase admin client
export const adminOperations = {
  // Fetch all dealers using direct admin access
  getAllDealers: async (status?: string) => {
    return performAdminOperation('getAllDealers', async () => {
      let query = adminSupabase
        .from('dealers')
        .select('*')
        .order('created_at', { ascending: false });

      if (status && status !== 'all') {
        query = query.eq('verification_status', status);
      }

      return await query;
    });
  },
  
  // Verify dealer using direct database access
  verifyDealer: async (dealerId: string, adminId: string, notes?: string) => {
    return performAdminOperation('verifyDealer', async () => {
      const { data, error } = await adminSupabase
        .from('dealers')
        .update({
          verification_status: 'approved',
          is_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', dealerId)
        .select()
        .single();
      
      return { data, error };
    });
  },
  
  // Reject dealer using direct database access
  rejectDealer: async (dealerId: string, adminId: string, rejectionReason: string, notes?: string) => {
    return performAdminOperation('rejectDealer', async () => {
      const { data, error } = await adminSupabase
        .from('dealers')
        .update({
          verification_status: 'rejected',
          is_verified: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', dealerId)
        .select()
        .single();
      
      return { data, error };
    });
  },
  
  // Fetch all users with admin access
  getAllUsers: async () => {
    return performAdminOperation('getAllUsers', async () => {
      return await adminSupabase.from('profiles').select('*').order('updated_at', { ascending: false });
    });
  },
  
  // Fetch all sellers with admin access
  getAllSellers: async () => {
    return performAdminOperation('getAllSellers', async () => {
      return await adminSupabase.from('sellers').select('*').order('created_at', { ascending: false });
    });
  },
  
  // Update user role with admin access
  updateUserRole: async (userId: string, role: 'admin' | 'dealer' | 'seller') => {
    return performAdminOperation('updateUserRole', async () => {
      return await adminSupabase
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
      return await adminSupabase
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
      return await adminSupabase
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
      let query = adminSupabase.from('cars').select('*');
      
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
      await adminSupabase.from('cars').delete().eq('seller_id', sellerId);
      
      // Then delete the seller profile
      return await adminSupabase.from('sellers').delete().eq('user_id', sellerId);
    });
  },

  // Create auction schedule with proper validation
  createAuctionSchedule: async (
    carId: string, 
    startTime: string, 
    endTime: string, 
    notes?: string, 
    isManuallyControlled?: boolean,
    createdBy?: string
  ) => {
    return performAdminOperation('createAuctionSchedule', async () => {
      const { data, error } = await adminSupabase
        .from('auction_schedules')
        .insert({
          car_id: carId,
          start_time: startTime,
          end_time: endTime,
          notes: notes,
          is_manually_controlled: isManuallyControlled || false,
          created_by: createdBy,
          status: 'scheduled',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select(`
          *,
          car:cars(*)
        `)
        .single();
      
      return { data, error };
    });
  },

  // Get all auction schedules with car details
  getAllAuctionSchedules: async () => {
    return performAdminOperation('getAllAuctionSchedules', async () => {
      return await adminSupabase
        .from('auction_schedules')
        .select(`
          *,
          car:cars(*)
        `)
        .order('start_time', { ascending: true });
    });
  },

  // Update auction schedule status
  updateAuctionScheduleStatus: async (scheduleId: string, status: AuctionScheduleStatus, adminId?: string) => {
    return performAdminOperation('updateAuctionScheduleStatus', async () => {
      return await adminSupabase
        .from('auction_schedules')
        .update({
          status: status,
          last_status_change: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', scheduleId)
        .select()
        .single();
    });
  },

  // Delete auction schedule
  deleteAuctionSchedule: async (scheduleId: string) => {
    return performAdminOperation('deleteAuctionSchedule', async () => {
      return await adminSupabase
        .from('auction_schedules')
        .delete()
        .eq('id', scheduleId);
    });
  }
};
