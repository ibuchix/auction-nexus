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
    console.log(`Starting admin operation: ${operationName}`);
    const { data, error } = await operation();
    
    if (error) {
      console.error(`Admin operation failed (${operationName}):`, error);
      toast.error(`Operation failed: ${error.message || 'Unknown error'}`);
      return null;
    }
    
    console.log(`Admin operation successful (${operationName}):`, data);
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
  // Fetch all dealers using direct admin access with email information - simplified query
  getAllDealers: async (status?: string) => {
    try {
      console.log('Starting getAllDealers operation with status:', status);
      
      // Simple query without problematic foreign key joins
      let query = adminSupabase
        .from('dealers')
        .select('*')
        .order('created_at', { ascending: false });

      // Only apply status filter if status is provided and is not 'all'
      if (status && status !== 'all') {
        console.log('Applying status filter:', status);
        query = query.eq('verification_status', status);
      } else {
        console.log('No status filter applied - fetching all dealers');
      }

      const { data: dealersData, error } = await query;
      
      if (error) {
        console.error('Error fetching dealers:', error);
        toast.error(`Failed to load dealers: ${error.message}`);
        return null;
      }

      console.log(`Fetched ${dealersData?.length || 0} dealers from database`);

      // If we have dealers, fetch their email addresses from auth.users
      if (dealersData && dealersData.length > 0) {
        const userIds = dealersData.map(dealer => dealer.user_id);
        
        // Fetch emails using admin client's auth admin methods
        const emailPromises = userIds.map(async (userId) => {
          try {
            const { data: user, error: userError } = await adminSupabase.auth.admin.getUserById(userId);
            return { userId, email: user?.user?.email || null };
          } catch (error) {
            console.warn(`Failed to fetch email for user ${userId}:`, error);
            return { userId, email: null };
          }
        });

        const emailResults = await Promise.all(emailPromises);
        const emailMap = emailResults.reduce((acc, result) => {
          acc[result.userId] = result.email;
          return acc;
        }, {} as Record<string, string | null>);

        // Add email to each dealer - return raw data without case conversion
        const dealersWithEmails = dealersData.map(dealer => ({
          ...dealer,
          email: emailMap[dealer.user_id]
        }));

        console.log(`Successfully added emails to ${dealersWithEmails.length} dealers`);
        return dealersWithEmails;
      }

      console.log('No dealers found or empty result');
      return dealersData || [];
    } catch (error) {
      console.error('Fatal error in getAllDealers:', error);
      toast.error(`Failed to load dealers: ${(error as Error).message || 'Unknown error'}`);
      return null;
    }
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
  
  // Get available cars for auction scheduling with admin access
  getAvailableCarsForScheduling: async () => {
    return performAdminOperation('getAvailableCarsForScheduling', async () => {
      return await adminSupabase
        .from('cars')
        .select(`
          *,
          seller:profiles (*)
        `)
        .eq('status', 'approved')
        .is('auction_status', null);
    });
  },
  
  // Get active auctions with admin access - direct table access
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
  
  // Get auction listings with admin access - direct table access
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

  // Create auction schedule with admin access - simplified
  createAuctionSchedule: async (
    carId: string, 
    startTime: string, 
    endTime: string, 
    notes?: string, 
    isManuallyControlled?: boolean,
    createdBy?: string
  ) => {
    console.log('Creating auction schedule with params:', {
      carId, startTime, endTime, notes, isManuallyControlled, createdBy
    });
    
    return performAdminOperation('createAuctionSchedule', async () => {
      // Create schedule data without any validation
      const scheduleData = {
        car_id: carId,
        start_time: startTime,
        end_time: endTime,
        notes: notes || null,
        is_manually_controlled: isManuallyControlled || false,
        created_by: createdBy || null,
        status: 'scheduled' as AuctionScheduleStatus,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Inserting schedule data:', scheduleData);

      // Insert directly into auction_schedules table
      const { data, error } = await adminSupabase
        .from('auction_schedules')
        .insert(scheduleData)
        .select()
        .single();
      
      if (error) {
        console.error('Schedule insertion failed:', error);
        throw error;
      }

      console.log('Schedule created successfully:', data);
      return { data, error: null };
    });
  },

  // Get all auction schedules with admin access
  getAllAuctionSchedules: async () => {
    console.log('Fetching all auction schedules');
    
    return performAdminOperation('getAllAuctionSchedules', async () => {
      const { data, error } = await adminSupabase
        .from('auction_schedules')
        .select(`
          *,
          car:cars(id, title, make, model, year, vin, status, auction_status)
        `)
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Failed to fetch auction schedules:', error);
        throw error;
      }

      console.log(`Successfully fetched ${data?.length || 0} auction schedules`);
      return { data, error: null };
    });
  },

  // Update auction schedule status with admin access
  updateAuctionScheduleStatus: async (scheduleId: string, status: AuctionScheduleStatus, adminId?: string) => {
    console.log('Updating schedule status:', { scheduleId, status, adminId });
    
    return performAdminOperation('updateAuctionScheduleStatus', async () => {
      const { data, error } = await adminSupabase
        .from('auction_schedules')
        .update({
          status: status,
          last_status_change: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', scheduleId)
        .select()
        .single();

      if (error) {
        console.error('Schedule status update failed:', error);
        throw error;
      }

      console.log('Schedule status updated successfully:', data);
      return { data, error: null };
    });
  },

  // Delete auction schedule with admin access
  deleteAuctionSchedule: async (scheduleId: string) => {
    console.log('Deleting auction schedule:', scheduleId);
    
    return performAdminOperation('deleteAuctionSchedule', async () => {
      const { data, error } = await adminSupabase
        .from('auction_schedules')
        .delete()
        .eq('id', scheduleId);

      if (error) {
        console.error('Schedule deletion failed:', error);
        throw error;
      }

      console.log('Schedule deleted successfully');
      return { data, error: null };
    });
  }
};
