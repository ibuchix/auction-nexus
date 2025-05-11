import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get API key from request headers
    const apiKey = req.headers.get('x-admin-api-key');
    
    // Verify API key matches service role key (not the full key, just the first 10 chars to avoid exposing it)
    if (!apiKey || apiKey !== supabaseServiceKey.substring(0, 10)) {
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

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(`Admin API Error:`, error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Admin operation implementations
async function getAllUsers(supabaseAdmin) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('updated_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

async function getAllSellers(supabaseAdmin) {
  // Get all profiles with seller role
  const { data: profilesData, error: profilesError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('role', 'seller');
    
  if (profilesError) throw profilesError;
  
  // Enrich seller data with car information
  const enrichedSellers = await Promise.all(
    (profilesData || []).map(async (profile) => {
      // Get latest car for this seller for contact info
      const { data: carsData, error: carsError } = await supabaseAdmin
        .from('cars')
        .select('mobile_number, title, created_at, address')
        .eq('seller_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (carsError) {
        console.error('Error fetching car data:', carsError);
      }
      
      return {
        id: profile.id,
        role: profile.role,
        created_at: profile.updated_at,
        name: carsData?.[0]?.title?.split(' ')?.[0] || profile.full_name || 'Unknown Seller',
        mobile_number: carsData?.[0]?.mobile_number || 'N/A',
        address: carsData?.[0]?.address || 'N/A',
      };
    })
  );
  
  return enrichedSellers;
}

async function getSellerCars(supabaseAdmin, sellerId) {
  if (!sellerId) {
    // If no seller ID provided, get all cars
    const { data, error } = await supabaseAdmin
      .from('cars')
      .select('*, profiles!cars_seller_id_fkey(full_name, role)');
    
    if (error) throw error;
    return data;
  } else {
    // Get cars for specific seller
    const { data, error } = await supabaseAdmin
      .from('cars')
      .select('*, profiles!cars_seller_id_fkey(full_name, role)')
      .eq('seller_id', sellerId);
    
    if (error) throw error;
    return data;
  }
}

async function updateUserRole(supabaseAdmin, userId, role) {
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
}

async function suspendUser(supabaseAdmin, userId, suspended) {
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
}

async function verifyDealer(supabaseAdmin, dealerId, adminId, notes) {
  if (!dealerId || !adminId) {
    throw new Error('Missing required parameters');
  }
  
  // Update dealer verification status
  const { error: updateError } = await supabaseAdmin
    .from('dealers')
    .update({ 
      verification_status: 'approved',
      is_verified: true
    })
    .eq('id', dealerId);
  
  if (updateError) throw updateError;
  
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
  
  // If there's no existing verification record, we can ignore that error
  
  return { success: true, dealer_id: dealerId };
}

async function rejectDealer(supabaseAdmin, dealerId, adminId, rejectionReason, notes) {
  if (!dealerId || !adminId || !rejectionReason) {
    throw new Error('Missing required parameters');
  }
  
  // Update dealer verification status
  const { error: updateError } = await supabaseAdmin
    .from('dealers')
    .update({ 
      verification_status: 'rejected',
      is_verified: false
    })
    .eq('id', dealerId);
  
  if (updateError) throw updateError;
  
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
  
  // If there's no existing verification record, we can ignore that error
  
  return { success: true, dealer_id: dealerId };
}

async function deleteSeller(supabaseAdmin, sellerId) {
  if (!sellerId) {
    throw new Error('Missing seller ID');
  }
  
  // First delete any cars associated with this seller
  const { error: carsError } = await supabaseAdmin
    .from('cars')
    .delete()
    .eq('seller_id', sellerId);
  
  if (carsError) throw carsError;
  
  // Then delete the seller profile
  const { error: sellerError } = await supabaseAdmin
    .from('profiles')
    .delete()
    .eq('id', sellerId);
  
  if (sellerError) throw sellerError;
  
  return { success: true };
}

async function getActiveAuctions(supabaseAdmin) {
  const { data, error } = await supabaseAdmin
    .from('cars')
    .select(`
      *,
      bids (*),
      auction_metrics (*),
      seller:profiles (*)
    `)
    .eq('is_auction', true)
    .in('auction_status', ['active', 'pending'])
    .order('auction_end_time', { ascending: true });

  if (error) throw error;
  return data;
}

async function getAuctionListings(supabaseAdmin, params = {}) {
  const { showAllCars = true, status = null } = params;
  
  let query = supabaseAdmin
    .from('cars')
    .select(`
      *,
      bids (*),
      seller:profiles (*),
      auction_metrics (*)
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
  
  if (error) throw error;
  return data;
}

async function updateAuctionStatus(supabaseAdmin, auctionId, status, adminId) {
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
}

async function checkSystemHealth(supabaseAdmin) {
  const { data, error } = await supabaseAdmin.rpc('check_auction_system_health');
  
  if (error) throw error;
  
  return data;
}

async function recoverAuction(supabaseAdmin, auctionId, action, adminId) {
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
}

async function verifyAccess(supabaseAdmin) {
  // Simple test query to verify access
  const { data: test, error: testError } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .limit(1);
  
  // Attempt to check more sensitive tables
  const { data: cars, error: carsError } = await supabaseAdmin
    .from('cars')
    .select('id')
    .limit(1);
  
  // Query system_health table
  const { data: health, error: healthError } = await supabaseAdmin
    .from('system_health')
    .select('component_name, status')
    .limit(3);
  
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
    },
    testResults: {
      profiles: test,
      cars,
      health
    }
  };
}

// Helper function to log admin actions
async function logAdminAction(supabaseAdmin, userId, action, details) {
  try {
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
