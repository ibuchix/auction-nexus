
import { adminSupabase } from '@/integrations/supabase/adminClient';
import { supabase } from '@/integrations/supabase/client';
import { objectToCamelCase, objectToSnakeCase } from './caseConverter';
import { toast } from 'sonner';
import { AuctionScheduleStatus, Auction } from '@/types/auction';

// Check if current user is the admin
export const verifyCurrentUserIsAdmin = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('No authenticated user found');
      return false;
    }

    // Simple admin check - direct user ID comparison
    const isAdmin = user.id === '3f07ea49-328e-4e21-878d-bef9f58af02e';
    console.log('Admin check result:', isAdmin);
    return isAdmin;
  } catch (error) {
    console.error('Admin access check failed:', error);
    return false;
  }
};

// Generic admin operation handler with error handling and case conversion
export async function performAdminOperation<T>(
  operationName: string,
  operation: () => Promise<{ data: any; error: any }>,
  requireAuth: boolean = true
): Promise<T | null> {
  try {
    console.log(`Starting admin operation: ${operationName}`);
    
    // Verify admin access for operations that require it
    if (requireAuth) {
      const isAdmin = await verifyCurrentUserIsAdmin();
      if (!isAdmin) {
        console.error(`Admin operation failed (${operationName}): Not authorized`);
        toast.error('Admin access required');
        return null;
      }
    }
    
    const { data, error } = await operation();

    if (operationName === 'getAuctionListings' && Array.isArray(data)) {
      const filipRaw = data.find((c: any) => c.id === '889213dc-9fec-41b9-b8f0-f815292eb86c');
      const lolRaw = data.find((c: any) => c.id === '59519d65-9f5f-43c1-97e7-1520b21c9ec3');
      console.log('🔍 [3/6] Raw data in wrapper:', {
        filipCar: filipRaw ? '✅ FOUND' : '❌ MISSING',
        lolCar: lolRaw ? '✅ FOUND' : '❌ MISSING',
        totalCars: data.length
      });
    }
    
    if (error) {
      console.error(`Admin operation failed (${operationName}):`, error);
      toast.error(`Operation failed: ${error.message || 'Unknown error'}`);
      return null;
    }
    
    console.log(`Admin operation successful (${operationName}):`, data);
    
    // Convert snake_case to camelCase for frontend use
    // Handle arrays specially to preserve array structure
    if (Array.isArray(data)) {
      const converted = data.map(item => item && typeof item === 'object' ? objectToCamelCase(item) : item) as T;
      if (operationName === 'getAuctionListings' && Array.isArray(converted)) {
        const filipConverted = converted.find((c: any) => c.id === '889213dc-9fec-41b9-b8f0-f815292eb86c');
        const lolConverted = converted.find((c: any) => c.id === '59519d65-9f5f-43c1-97e7-1520b21c9ec3');
        console.log('🔍 [4/6] After camelCase:', {
          filipCar: filipConverted ? '✅ FOUND' : '❌ MISSING',
          lolCar: lolConverted ? '✅ FOUND' : '❌ MISSING',
          totalCars: converted.length
        });
      }
      return converted;
    } else {
      return data ? objectToCamelCase(data) as T : null;
    }
  } catch (error) {
    console.error(`Admin operation failed (${operationName}):`, error);
    toast.error(`Operation failed: ${(error as Error).message || 'Unknown error'}`);
    return null;
  }
}

// Simplified admin access check using direct user ID
export const checkAdminAccess = async () => {
  try {
    const { data: { user } } = await adminSupabase.auth.getUser();
    
    if (!user) {
      console.log('No authenticated user found');
      return false;
    }

    // Simple admin check - direct user ID comparison
    const isAdmin = user.id === '3f07ea49-328e-4e21-878d-bef9f58af02e';
    console.log('Admin check result:', isAdmin);
    return isAdmin;
  } catch (error) {
    console.error('Admin access check failed:', error);
    return false;
  }
};

// Direct admin operations using Supabase admin client
export const adminOperations = {
  // Test admin access
  testAccess: checkAdminAccess,
  
  // Fetch all dealers using direct admin access with email information
  getAllDealers: async (status?: string) => {
    try {
      console.log('Starting getAllDealers operation with status:', status);
      
      // Use admin client with service role to bypass RLS
      let query = adminSupabase
        .from('dealers')
        .select('*')
        .order('created_at', { ascending: false });

      if (status && status !== 'all') {
        console.log('Applying status filter:', status);
        query = query.eq('verification_status', status);
      }

      const { data: dealersData, error } = await query;
      
      if (error) {
        console.error('Error fetching dealers:', error);
        toast.error(`Failed to load dealers: ${error.message}`);
        return null;
      }

      console.log(`Fetched ${dealersData?.length || 0} dealers from database`);

      // Fetch emails using admin client's auth admin methods
      if (dealersData && dealersData.length > 0) {
        const userIds = dealersData.map(dealer => dealer.user_id);
        
        const userDataPromises = userIds.map(async (userId) => {
          try {
            const { data: user, error: userError } = await adminSupabase.auth.admin.getUserById(userId);
            const phoneNumber = user?.user?.user_metadata?.phone_number || 
                               user?.user?.phone || 
                               null;
            return { 
              userId, 
              email: user?.user?.email || null,
              phoneNumber 
            };
          } catch (error) {
            console.warn(`Failed to fetch user data for user ${userId}:`, error);
            return { userId, email: null, phoneNumber: null };
          }
        });

        const userDataResults = await Promise.all(userDataPromises);
        const userDataMap = userDataResults.reduce((acc, result) => {
          acc[result.userId] = { 
            email: result.email, 
            phoneNumber: result.phoneNumber 
          };
          return acc;
        }, {} as Record<string, { email: string | null; phoneNumber: string | null }>);

        const dealersWithUserData = dealersData.map(dealer => ({
          ...dealer,
          email: userDataMap[dealer.user_id]?.email,
          phoneNumber: userDataMap[dealer.user_id]?.phoneNumber
        }));

        console.log(`Successfully added emails to ${dealersWithUserData.length} dealers`);
        return dealersWithUserData;
      }

      return dealersData || [];
    } catch (error) {
      console.error('Fatal error in getAllDealers:', error);
      toast.error(`Failed to load dealers: ${(error as Error).message || 'Unknown error'}`);
      return null;
    }
  },
  
  // Verify dealer using authenticated admin client
  verifyDealer: async (dealerId: string, adminId: string, notes?: string) => {
    return performAdminOperation('verifyDealer', async () => {
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
      
      return { data, error };
    });
  },
  
  // Reject dealer using authenticated admin client
  rejectDealer: async (dealerId: string, adminId: string, rejectionReason: string, notes?: string) => {
    return performAdminOperation('rejectDealer', async () => {
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
      
      return { data, error };
    });
  },
  
  // Fetch all users with admin access using authenticated client
  getAllUsers: async () => {
    return performAdminOperation('getAllUsers', async () => {
      return await supabase.from('profiles').select('*').order('updated_at', { ascending: false });
    });
  },
  
  // Fetch all sellers with admin access using authenticated client
  getAllSellers: async () => {
    return performAdminOperation('getAllSellers', async () => {
      return await supabase.from('sellers').select('*').order('created_at', { ascending: false });
    });
  },
  
  // Update user role with admin access using authenticated client
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
  
  // Suspend user with admin access using authenticated client
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
  
  // Get available cars for auction scheduling with admin access using authenticated client
  getAvailableCarsForScheduling: async (): Promise<Auction[]> => {
    console.log('Fetching cars available for scheduling');
    
    // Check admin access first
    const isAdmin = await verifyCurrentUserIsAdmin();
    if (!isAdmin) {
      console.error('Admin access required for scheduling operations');
      return [];
    }
    
    try {
      // Get all cars that don't have active schedules using authenticated client
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .not('auction_status', 'in', '("sold","ended","cancelled")')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching available cars:', error);
        throw new Error(error.message);
      }
      
      // Filter out cars that already have schedules
      const { data: scheduledCars } = await supabase
        .from('auction_schedules')
        .select('car_id')
        .eq('status', 'scheduled');
      
      const scheduledCarIds = new Set(scheduledCars?.map(s => s.car_id) || []);
      const availableCars = data?.filter(car => !scheduledCarIds.has(car.id)) || [];
      
      console.log(`Found ${availableCars.length} cars available for scheduling out of ${data?.length || 0} total cars`);
      return availableCars as Auction[];
    } catch (error) {
      console.error('Error in getAvailableCarsForScheduling:', error);
      return [];
    }
  },
  
  // Get active auctions with admin access using authenticated client
  getActiveAuctions: async () => {
    return performAdminOperation('getActiveAuctions', async () => {
      return await supabase
        .from('cars')
        .select('*')
        .in('auction_status', ['active', 'pending'])
        .gt('auction_end_time', new Date().toISOString())
        .order('auction_end_time', { ascending: true });
    });
  },
  
  // Get auction listings with admin access using authenticated client
  getAuctionListings: async (showAllCars: boolean = true, status?: string) => {
    return performAdminOperation('getAuctionListings', async () => {
      // Step 1: Get all cars using the original working direct query
      const { data: cars, error: carsError } = await supabase
        .from('cars')
        .select('*')
        .order('created_at', { ascending: false }); // Newest first

      if (carsError) {
        console.error('[Admin Operations] Error fetching cars:', carsError);
        throw carsError;
      }

      // Step 2: Get seller emails separately
      const { data: sellerEmails, error: emailError } = await supabase
        .rpc('get_cars_with_seller_info');

      if (emailError) {
        console.warn('[Admin Operations] Could not fetch seller emails:', emailError);
        // Non-fatal: continue without emails
      }

      // Step 3: Merge seller emails into car data
      const emailMap = new Map(
        sellerEmails?.map(e => [e.seller_id, e.seller_email]) || []
      );

      const carsWithEmail = cars?.map(car => ({
        ...car,
        sellerEmail: emailMap.get(car.seller_id) || null
      })) || [];

      // Apply filters (same as before)
      let filteredData = carsWithEmail;

      if (!showAllCars) {
        filteredData = filteredData.filter(car => car.is_auction === true);
      }

      if (status) {
        filteredData = filteredData.filter(car => car.auction_status === status);
      }

      return { data: filteredData, error: null };
    });
  },
  
  // Delete seller with admin access using authenticated client
  deleteSeller: async (sellerId: string) => {
    return performAdminOperation('deleteSeller', async () => {
      // First delete any cars associated with this seller
      await supabase.from('cars').delete().eq('seller_id', sellerId);
      
      // Then delete the seller profile
      return await supabase.from('sellers').delete().eq('user_id', sellerId);
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

      // Insert directly into auction_schedules table using authenticated client
      const { data, error } = await supabase
        .from('auction_schedules')
        .insert(scheduleData)
        .select()
        .single();
      
      if (error) {
        console.error('Schedule insertion failed:', error);
        throw error;
      }

      return { data, error: null };
    });
  },

  // Get all auction schedules with admin access
  getAllAuctionSchedules: async () => {
    return performAdminOperation('getAllAuctionSchedules', async () => {
      const { data, error } = await supabase
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
      const { data, error } = await supabase
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
      const { data, error } = await supabase
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
