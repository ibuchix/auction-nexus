import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-api-key',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    // Better error handling for missing environment variables
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      throw new Error('Server configuration error: Missing required environment variables');
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { 
        persistSession: false,
        autoRefreshToken: false 
      },
      global: { 
        headers: { 
          // Pass X-Client-Info for better debugging in Supabase logs
          'X-Client-Info': 'admin-api-edge-function',
        } 
      }
    });

    // Get API key from request headers
    const apiKey = req.headers.get('x-admin-api-key');
    
    // Verify API key matches service role key (not the full key, just the first 10 chars to avoid exposing it)
    if (!apiKey || apiKey !== supabaseServiceKey.substring(0, 10)) {
      console.error('Unauthorized: Invalid admin API key');
      throw new Error('Unauthorized: Invalid admin API key');
    }

    // Parse request body
    const { action, params } = await req.json();
    let result;

    console.log(`Admin API: Executing ${action}`);

    // Process the requested admin action
    switch (action) {
      case 'getAllUsers':
        result = await getAllUsers(supabaseAdmin);
        break;
      
      case 'getAllSellers':
        result = await getAllSellers(supabaseAdmin);
        break;
      
      case 'getAllDealers':
        result = await getAllDealers(supabaseAdmin);
        break;
      
      case 'getSellerCars':
        result = await getSellerCars(supabaseAdmin, params?.sellerId);
        break;
      
      case 'updateUserRole':
        result = await updateUserRole(supabaseAdmin, params?.userId, params?.role);
        break;
      
      case 'suspendUser':
        result = await suspendUser(supabaseAdmin, params?.userId, params?.suspended);
        break;
      
      case 'verifyDealer':
        result = await verifyDealer(supabaseAdmin, params?.dealerId, params?.adminId, params?.notes);
        break;
      
      case 'rejectDealer':
        result = await rejectDealer(
          supabaseAdmin, 
          params?.dealerId, 
          params?.adminId, 
          params?.rejectionReason, 
          params?.notes
        );
        break;
      
      case 'deleteSeller':
        result = await deleteSeller(supabaseAdmin, params?.sellerId);
        break;

      case 'getActiveAuctions':
        result = await getActiveAuctions(supabaseAdmin);
        break;
        
      case 'getAuctionListings':
        result = await getAuctionListings(supabaseAdmin, params);
        break;
        
      case 'pauseAuction':
        result = await updateAuctionStatus(supabaseAdmin, params?.auctionId, 'paused', params?.adminId || 'system');
        break;
        
      case 'startAuction':
        result = await updateAuctionStatus(supabaseAdmin, params?.auctionId, 'active', params?.adminId || 'system');
        break;
        
      case 'cancelAuction':
        result = await updateAuctionStatus(supabaseAdmin, params?.auctionId, 'cancelled', params?.adminId || 'system');
        break;
        
      case 'checkSystemHealth':
        result = await checkSystemHealth(supabaseAdmin);
        break;

      case 'recoverAuction':
        result = await recoverAuction(
          supabaseAdmin, 
          params?.auctionId, 
          params?.action, 
          params?.adminId || 'system'
        );
        break;
        
      case 'verifyAccess':
        result = await verifyAccess(supabaseAdmin);
        break;
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Log action for audit trail
    await logAdminAction(supabaseAdmin, params?.adminId || 'system', action, params);

    // Return success with data and CORS headers
    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(`Admin API Error:`, error);
    
    // Add more detailed error responses with appropriate status codes
    let statusCode = 400;
    let errorMessage = error.message;
    
    // Check for specific error types
    if (error.code === '42501') {
      errorMessage = 'Permission denied. The service role key does not have access to the required tables.';
      statusCode = 403;
    } else if (error.code === '42P01') {
      errorMessage = 'Table not found. Check if the table exists in your database.';
      statusCode = 404;
    } else if (error.message.includes('Unauthorized')) {
      statusCode = 401;
    }
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage,
      details: error.code ? { 
        code: error.code,
        hint: error.hint,
        details: error.details
      } : undefined
    }), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Admin operation implementations
async function getAllUsers(supabaseAdmin) {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('getAllUsers error:', error);
    throw error;
  }
}

async function getAllSellers(supabaseAdmin) {
  try {
    console.log('Fetching comprehensive seller data...');
    
    // Get sellers with joined profile and user data
    const { data: sellersData, error: sellersError } = await supabaseAdmin
      .from('profiles')
      .select(`
        id,
        role,
        full_name,
        updated_at,
        sellers!inner (
          user_id,
          verification_status,
          is_verified,
          created_at
        )
      `)
      .eq('role', 'seller');
      
    if (sellersError) {
      console.error('Error fetching sellers:', sellersError);
      throw sellersError;
    }
    
    console.log(`Found ${sellersData?.length || 0} sellers`);
    
    // Get additional data for each seller (cars, contact info)
    const enrichedSellers = await Promise.all(
      (sellersData || []).map(async (profile) => {
        try {
          // Get user email from auth.users
          const { data: authData } = await supabaseAdmin.auth.admin.getUserById(profile.id);
          
          // Get car data for contact info and listings count
          const { data: carsData, error: carsError } = await supabaseAdmin
            .from('cars')
            .select('mobile_number, address, status, auction_status, is_auction, seller_name')
            .eq('seller_id', profile.id);
            
          if (carsError) {
            console.error('Error fetching car data for seller:', profile.id, carsError);
          }
          
          // Calculate listing counts
          const totalListings = carsData?.length || 0;
          const activeListings = carsData?.filter(car => 
            car.status === 'available' || 
            (car.auction_status === 'active' && car.is_auction)
          ).length || 0;
          
          // Get latest contact info from most recent car
          const latestCar = carsData?.[0];
          
          return {
            id: profile.id,
            role: profile.role,
            created_at: profile.sellers.created_at,
            name: profile.full_name || latestCar?.seller_name || latestCar?.mobile_number || 'Unknown Seller',
            email: authData?.user?.email || null,
            mobile_number: latestCar?.mobile_number || null,
            address: latestCar?.address || null,
            verification_status: profile.sellers.verification_status,
            is_verified: profile.sellers.is_verified,
            total_listings: totalListings,
            active_listings: activeListings
          };
        } catch (err) {
          console.error('Error processing seller data:', profile.id, err);
          return {
            id: profile.id,
            role: profile.role,
            created_at: profile.sellers.created_at,
            name: profile.full_name || 'Unknown Seller',
            email: null,
            mobile_number: null,
            address: null,
            verification_status: profile.sellers.verification_status,
            is_verified: profile.sellers.is_verified,
            total_listings: 0,
            active_listings: 0,
            error: err.message
          };
        }
      })
    );
    
    console.log(`Enriched ${enrichedSellers.length} sellers with additional data`);
    return enrichedSellers;
  } catch (error) {
    console.error('getAllSellers error:', error);
    throw error;
  }
}

async function getAllDealers(supabaseAdmin) {
  try {
    console.log('Fetching all dealers with verification data...');
    
    // Get dealers with profile information
    const { data: dealersData, error: dealersError } = await supabaseAdmin
      .from('dealers')
      .select(`
        *,
        profiles!dealers_user_id_fkey (
          id,
          full_name,
          role,
          created_at,
          updated_at
        )
      `)
      .order('created_at', { ascending: false });
      
    if (dealersError) {
      console.error('Error fetching dealers:', dealersError);
      throw dealersError;
    }
    
    console.log(`Found ${dealersData?.length || 0} dealers`);
    
    // Format dealer data for frontend
    const formattedDealers = dealersData.map(dealer => ({
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
      profileInfo: dealer.profiles
    }));
    
    console.log(`Returning ${formattedDealers.length} formatted dealers`);
    return formattedDealers;
  } catch (error) {
    console.error('getAllDealers error:', error);
    throw error;
  }
}

async function getSellerCars(supabaseAdmin, sellerId) {
  try {
    if (!sellerId) {
      // If no seller ID provided, get all cars with enhanced details including seller info
      const { data, error } = await supabaseAdmin
        .from('cars')
        .select(`
          *, 
          profiles!cars_seller_id_fkey(full_name, role),
          car_file_uploads(*),
          sellers!cars_seller_id_fkey(verification_status, is_verified)
        `);
      
      if (error) throw error;
      return data;
    } else {
      // Get cars for specific seller with enhanced details
      const { data, error } = await supabaseAdmin
        .from('cars')
        .select(`
          *, 
          profiles!cars_seller_id_fkey(full_name, role),
          car_file_uploads(*),
          sellers!cars_seller_id_fkey(verification_status, is_verified)
        `)
        .eq('seller_id', sellerId);
      
      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('getSellerCars error:', error);
    throw error;
  }
}

async function updateUserRole(supabaseAdmin, userId, role) {
  try {
    if (!userId || !role || !['admin', 'dealer', 'seller'].includes(role)) {
      throw new Error('Invalid userId or role');
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('updateUserRole error:', error);
    throw error;
  }
}

async function suspendUser(supabaseAdmin, userId, suspended) {
  try {
    if (!userId || suspended === undefined) {
      throw new Error('Invalid userId or suspended status');
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ suspended })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('suspendUser error:', error);
    throw error;
  }
}

async function verifyDealer(supabaseAdmin, dealerId, adminId, notes) {
  try {
    if (!dealerId || !adminId) {
      throw new Error('Missing required parameters');
    }
    
    console.log('Verifying dealer:', dealerId, 'by admin:', adminId);
    
    // Update dealer verification status
    const { data: dealerData, error: updateError } = await supabaseAdmin
      .from('dealers')
      .update({ 
        verification_status: 'approved',
        is_verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', dealerId)
      .select();
    
    if (updateError) {
      console.error('Error updating dealer:', updateError);
      throw updateError;
    }
    
    console.log('Dealer verification updated:', dealerData);
    
    // Update dealer verification record if it exists
    const { data: verificationData, error: verificationError } = await supabaseAdmin
      .from('dealer_verifications')
      .update({ 
        verification_status: 'approved',
        admin_id: adminId,
        reviewed_at: new Date().toISOString(),
        notes
      })
      .eq('dealer_id', dealerId)
      .select();
    
    // Log the action
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        user_id: adminId,
        action: 'approve',
        entity_type: 'dealer',
        entity_id: dealerId,
        details: { notes, verification_data: verificationData }
      });
    
    return { success: true, dealer_id: dealerId, data: dealerData };
  } catch (error) {
    console.error('verifyDealer error:', error);
    throw error;
  }
}

async function rejectDealer(supabaseAdmin, dealerId, adminId, rejectionReason, notes) {
  try {
    if (!dealerId || !adminId || !rejectionReason) {
      throw new Error('Missing required parameters');
    }
    
    console.log('Rejecting dealer:', dealerId, 'by admin:', adminId, 'reason:', rejectionReason);
    
    // Update dealer verification status
    const { data: dealerData, error: updateError } = await supabaseAdmin
      .from('dealers')
      .update({ 
        verification_status: 'rejected',
        is_verified: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', dealerId)
      .select();
    
    if (updateError) {
      console.error('Error updating dealer:', updateError);
      throw updateError;
    }
    
    console.log('Dealer rejection updated:', dealerData);
    
    // Update dealer verification record if it exists
    const { data: verificationData, error: verificationError } = await supabaseAdmin
      .from('dealer_verifications')
      .update({ 
        verification_status: 'rejected',
        admin_id: adminId,
        reviewed_at: new Date().toISOString(),
        notes,
        rejection_reason: rejectionReason
      })
      .eq('dealer_id', dealerId)
      .select();
    
    // Log the action
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        user_id: adminId,
        action: 'reject',
        entity_type: 'dealer',
        entity_id: dealerId,
        details: { rejection_reason: rejectionReason, notes, verification_data: verificationData }
      });
    
    return { success: true, dealer_id: dealerId, data: dealerData };
  } catch (error) {
    console.error('rejectDealer error:', error);
    throw error;
  }
}

async function deleteSeller(supabaseAdmin, sellerId) {
  try {
    if (!sellerId) {
      throw new Error('Missing seller ID');
    }
    
    console.log('Deleting seller:', sellerId);
    
    // First delete any cars associated with this seller
    const { error: carsError } = await supabaseAdmin
      .from('cars')
      .delete()
      .eq('seller_id', sellerId);
    
    if (carsError) {
      console.error('Error deleting cars:', carsError);
      throw carsError;
    }
    
    // Delete seller record
    const { error: sellerError } = await supabaseAdmin
      .from('sellers')
      .delete()
      .eq('user_id', sellerId);
    
    if (sellerError) {
      console.error('Error deleting seller:', sellerError);
      throw sellerError;
    }
    
    // Delete the seller profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', sellerId);
    
    if (profileError) {
      console.error('Error deleting profile:', profileError);
      throw profileError;
    }
    
    console.log('Successfully deleted seller:', sellerId);
    return { success: true };
  } catch (error) {
    console.error('deleteSeller error:', error);
    throw error;
  }
}

async function getActiveAuctions(supabaseAdmin) {
  try {
    // Use RPC call as an alternative approach to bypass RLS if normal select fails
    try {
      const { data, error } = await supabaseAdmin
        .from('cars')
        .select(`
          *,
          bids (*),
          auction_metrics (*),
          seller:profiles (*),
          car_file_uploads (*)
        `)
        .eq('is_auction', true)
        .in('auction_status', ['active', 'pending'])
        .order('auction_end_time', { ascending: true });

      if (error) throw error;
      return data;
    } catch (initialError) {
      console.error('Initial getActiveAuctions approach failed:', initialError);
      
      // Alternative fallback using raw SQL if needed
      const { data, error } = await supabaseAdmin.rpc('admin_get_active_auctions');
      
      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('getActiveAuctions error:', error);
    throw error;
  }
}

async function getAuctionListings(supabaseAdmin, params = {}) {
  try {
    const { showAllCars = true, status = null, includeFiles = true } = params;
    
    console.log('Getting auction listings with params:', params);
    
    // Use RPC call as an alternative approach to bypass RLS if normal select fails
    try {
      let query = supabaseAdmin
        .from('cars')
        .select(`
          *,
          bids (*),
          seller:profiles (*),
          auction_metrics (*),
          ${includeFiles ? 'car_file_uploads (*),' : ''}
          sellers!cars_seller_id_fkey (
            verification_status,
            is_verified,
            created_at
          )
        `);
      
      // Only filter by approved status if we're not showing all cars
      if (!showAllCars) {
        query = query.eq('status', 'approved');
      }
      
      // Apply status filter if provided
      if (status && status !== 'all') {
        query = query.eq('auction_status', status);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Query error:', error);
        throw error;
      }
      
      console.log(`Query successful, got ${data?.length || 0} results`);
      return data;
    } catch (initialError) {
      console.error('Initial getAuctionListings approach failed:', initialError);
      
      // Try a more direct query that might bypass RLS issues
      // Note: This is a fallback if the first approach doesn't work
      const { data: directData, error: directError } = await supabaseAdmin.rpc(
        'admin_get_auction_listings',
        { p_show_all: showAllCars, p_status: status }
      );
      
      if (directError) throw directError;
      return directData;
    }
  } catch (error) {
    console.error('getAuctionListings error:', error);
    throw error;
  }
}

async function updateAuctionStatus(supabaseAdmin, auctionId, status, adminId) {
  try {
    if (!auctionId || !status || !adminId) {
      throw new Error('Missing required parameters');
    }
    
    const validStatuses = ['active', 'paused', 'cancelled', 'ended', 'sold'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid auction status: ${status}`);
    }
    
    // Update the auction status
    const { data, error } = await supabaseAdmin
      .from('cars')
      .update({ 
        auction_status: status,
        updated_at: new Date().toISOString(),
        // If cancelled, also update the car status to available
        ...(status === 'cancelled' ? { status: 'available' } : {})
      })
      .eq('id', auctionId)
      .select();
    
    if (error) throw error;

    return data;
  } catch (error) {
    console.error('updateAuctionStatus error:', error);
    throw error;
  }
}

async function checkSystemHealth(supabaseAdmin) {
  try {
    // Try a simple RPC call first as it might be more resilient
    try {
      const { data, error } = await supabaseAdmin.rpc('check_auction_system_health');
      if (error) throw error;
      return data;
    } catch (rpcError) {
      console.error('Failed to run system health RPC, falling back:', rpcError);
      
      // Fallback to direct queries
      const { data: health, error } = await supabaseAdmin
        .from('system_health')
        .select('component_name, status, details')
        .order('component_name');
      
      if (error) throw error;
      return health;
    }
  } catch (error) {
    console.error('checkSystemHealth error:', error);
    throw error;
  }
}

async function recoverAuction(supabaseAdmin, auctionId, action, adminId) {
  try {
    if (!auctionId || !action || !adminId) {
      throw new Error('Missing required parameters');
    }
    
    switch (action) {
      case 'reset':
        // Reset auction to ready state
        const { error: resetError } = await supabaseAdmin
          .from('cars')
          .update({
            auction_status: 'ready',
            status: 'approved',
            updated_at: new Date().toISOString()
          })
          .eq('id', auctionId);
        
        if (resetError) throw resetError;
        break;
        
      case 'force_complete':
        // Force complete the auction
        const { error: completeError } = await supabaseAdmin
          .from('cars')
          .update({
            auction_status: 'ended',
            status: 'available',
            updated_at: new Date().toISOString()
          })
          .eq('id', auctionId)
          .eq('auction_status', 'active');
        
        if (completeError) throw completeError;
        break;
        
      case 'force_start':
        // Force start the auction
        const { error: startError } = await supabaseAdmin
          .from('cars')
          .update({
            auction_status: 'active',
            is_auction: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', auctionId)
          .in('auction_status', ['ready', 'paused', null]);
        
        if (startError) throw startError;
        break;
        
      case 'reset_bids':
        // Reset all bids for this auction
        const { error: bidsError } = await supabaseAdmin
          .from('bids')
          .delete()
          .eq('car_id', auctionId);
        
        if (bidsError) throw bidsError;
        
        // Also reset current_bid on the car
        const { error: carError } = await supabaseAdmin
          .from('cars')
          .update({
            current_bid: 0,
            updated_at: new Date().toISOString()
          })
          .eq('id', auctionId);
        
        if (carError) throw carError;
        break;
        
      default:
        throw new Error(`Unknown recovery action: ${action}`);
    }
    
    return { success: true, auctionId, action };
  } catch (error) {
    console.error('recoverAuction error:', error);
    throw error;
  }
}

async function verifyAccess(supabaseAdmin) {
  try {
    console.log('Testing database access with admin client...');
    
    // Simple test query to verify access
    const { data: test, error: testError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('Failed to access profiles table:', testError);
    } else {
      console.log('Successfully accessed profiles table');
    }
    
    // Attempt to check more sensitive tables
    const { data: cars, error: carsError } = await supabaseAdmin
      .from('cars')
      .select('id')
      .limit(1);
    
    if (carsError) {
      console.error('Failed to access cars table:', carsError);
    } else {
      console.log('Successfully accessed cars table');
    }
    
    // Query system_health table
    const { data: health, error: healthError } = await supabaseAdmin
      .from('system_health')
      .select('component_name, status')
      .limit(3);
    
    if (healthError) {
      console.error('Failed to access system_health table:', healthError);
    } else {
      console.log('Successfully accessed system_health table');
    }
    
    // Try an RPC call as another access test
    let rpcResults = null;
    try {
      const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('check_auction_system_health');
      if (rpcError) {
        console.error('Failed RPC call:', rpcError);
      } else {
        console.log('Successfully called RPC function');
        rpcResults = rpcData;
      }
    } catch (rpcErr) {
      console.error('Exception in RPC call:', rpcErr);
    }
    
    // Return comprehensive access report
    return {
      success: !testError && !carsError,
      userId: null,
      accessDetails: {
        profilesAccessible: !testError,
        profilesError: testError?.message,
        carsAccessible: !carsError,
        carsError: carsError?.message,
        healthAccessible: !healthError,
        healthError: healthError?.message,
        rpcAccessible: rpcResults !== null
      },
      testResults: {
        profiles: test,
        cars,
        health,
        rpc: rpcResults
      }
    };
  } catch (err) {
    console.error('Exception in verifyAccess:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error',
      details: err
    };
  }
}

// Helper function to log admin actions
async function logAdminAction(supabaseAdmin, userId, action, details) {
  try {
    console.log(`Logging admin action: ${action} by ${userId}`);
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        user_id: userId,
        action: action,
        entity_type: 'admin_api',
        entity_id: '00000000-0000-0000-0000-000000000000',
        details
      });
  } catch (error) {
    console.error('Error logging admin action:', error);
    // Don't throw here, just log the error
  }
}
