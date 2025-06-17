import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-api-key',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // Create admin client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const { action, params } = await req.json()
    console.log('Admin API called with action:', action, 'params:', params)

    // Verify admin API key
    const adminApiKey = req.headers.get('x-admin-api-key')
    const expectedKey = Deno.env.get('VITE_SUPABASE_SERVICE_ROLE_KEY')?.substring(0, 10)
    
    if (!adminApiKey || adminApiKey !== expectedKey) {
      console.error('Invalid admin API key')
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let result;

    switch (action) {
      case 'getAuctionListings':
        console.log('Fetching auction listings with params:', params)
        
        let query = supabase.from('cars').select('*')
        
        // Update the filtering logic to include both 'approved' and 'available' status cars
        if (!params?.showAllCars && params?.status) {
          console.log('Applying status filter:', params.status)
          query = query.eq('auction_status', params.status)
        } else if (!params?.showAllCars) {
          // When not showing all cars, include both approved and available cars
          console.log('Filtering for auction-ready cars (approved and available)')
          query = query.in('status', ['approved', 'available'])
        } else {
          console.log('Showing all cars regardless of status')
        }
        
        const { data: carsData, error: carsError } = await query.order('created_at', { ascending: false })
        
        if (carsError) {
          console.error('Error fetching cars:', carsError)
          throw carsError
        }
        
        console.log(`Successfully fetched ${carsData?.length || 0} cars`)
        
        // Log some details about the cars for debugging
        if (carsData && carsData.length > 0) {
          const fordMondeos = carsData.filter(car => 
            car.make?.toLowerCase().includes('ford') && 
            car.model?.toLowerCase().includes('mondeo')
          )
          console.log(`Found ${fordMondeos.length} Ford Mondeo cars:`, fordMondeos.map(car => ({
            id: car.id,
            title: car.title,
            status: car.status,
            auction_status: car.auction_status
          })))
        }
        
        result = carsData
        break

      case 'getActiveAuctions':
        console.log('Fetching active auctions')
        const { data: activeData, error: activeError } = await supabase
          .from('cars')
          .select('*')
          .in('auction_status', ['active', 'pending'])
          .eq('is_auction', true)
          .order('auction_end_time', { ascending: true })
        
        if (activeError) {
          console.error('Error fetching active auctions:', activeError)
          throw activeError
        }
        
        console.log(`Successfully fetched ${activeData?.length || 0} active auctions`)
        result = activeData
        break

      case 'getAllUsers':
        console.log('Fetching all users')
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('*')
          .order('updated_at', { ascending: false })

        if (usersError) {
          console.error('Error fetching users:', usersError)
          throw usersError
        }

        console.log(`Successfully fetched ${usersData?.length || 0} users`)
        result = usersData
        break

      case 'getAllSellers':
        console.log('Fetching all sellers')
        const { data: sellersData, error: sellersError } = await supabase
          .from('sellers')
          .select('*')
          .order('created_at', { ascending: false })

        if (sellersError) {
          console.error('Error fetching sellers:', sellersError)
          throw sellersError
        }

        console.log(`Successfully fetched ${sellersData?.length || 0} sellers`)
        result = sellersData
        break

      case 'getAllDealers':
        console.log('Fetching all dealers')
        const { data: dealersData, error: dealersError } = await supabase
          .from('dealers')
          .select('*')
          .order('created_at', { ascending: false })

        if (dealersError) {
          console.error('Error fetching dealers:', dealersError)
          throw dealersError
        }

        console.log(`Successfully fetched ${dealersData?.length || 0} dealers`)
        result = dealersData
        break

      case 'getSellerCars':
        console.log('Fetching seller cars')
        const { data: sellerCarsData, error: sellerCarsError } = await supabase
          .from('cars')
          .select('*')
          .eq('seller_id', params.sellerId)
          .order('created_at', { ascending: false })

        if (sellerCarsError) {
          console.error('Error fetching seller cars:', sellerCarsError)
          throw sellerCarsError
        }

        console.log(`Successfully fetched ${sellerCarsData?.length || 0} seller cars`)
        result = sellerCarsData
        break

      case 'updateUserRole':
        console.log('Updating user role')
        const { data: updateUserRoleData, error: updateUserRoleError } = await supabase
          .from('profiles')
          .update({ role: params.role })
          .eq('id', params.userId)
          .select()
          .single()

        if (updateUserRoleError) {
          console.error('Error updating user role:', updateUserRoleError)
          throw updateUserRoleError
        }

        console.log(`Successfully updated user role for user ${params.userId} to ${params.role}`)
        result = updateUserRoleData
        break

      case 'suspendUser':
        console.log('Suspending user')
        const { data: suspendUserData, error: suspendUserError } = await supabase
          .from('profiles')
          .update({ suspended: params.suspended })
          .eq('id', params.userId)
          .select()
          .single()

        if (suspendUserError) {
          console.error('Error suspending user:', suspendUserError)
          throw suspendUserError
        }

        console.log(`Successfully suspended user ${params.userId}`)
        result = suspendUserData
        break

      case 'verifyDealer':
        console.log('Verifying dealer')
        const { data: verifyDealerData, error: verifyDealerError } = await supabase
          .from('dealers')
          .update({
            verification_status: 'approved',
            is_verified: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', params.dealerId)
          .select()
          .single()

        if (verifyDealerError) {
          console.error('Error verifying dealer:', verifyDealerError)
          throw verifyDealerError
        }

        console.log(`Successfully verified dealer ${params.dealerId}`)
        result = verifyDealerData
        break

      case 'rejectDealer':
        console.log('Rejecting dealer')
        const { data: rejectDealerData, error: rejectDealerError } = await supabase
          .from('dealers')
          .update({
            verification_status: 'rejected',
            is_verified: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', params.dealerId)
          .select()
          .single()

        if (rejectDealerError) {
          console.error('Error rejecting dealer:', rejectDealerError)
          throw rejectDealerError
        }

        console.log(`Successfully rejected dealer ${params.dealerId}`)
        result = rejectDealerData
        break

      case 'deleteSeller':
        console.log('Deleting seller')
        // First delete any cars associated with this seller
        const { error: deleteCarsError } = await supabase
          .from('cars')
          .delete()
          .eq('seller_id', params.sellerId)

        if (deleteCarsError) {
          console.error('Error deleting cars associated with seller:', deleteCarsError)
          throw deleteCarsError
        }

        // Then delete the seller profile
        const { data: deleteSellerData, error: deleteSellerError } = await supabase
          .from('sellers')
          .delete()
          .eq('user_id', params.sellerId)

        if (deleteSellerError) {
          console.error('Error deleting seller:', deleteSellerError)
          throw deleteSellerError
        }

        console.log(`Successfully deleted seller ${params.sellerId}`)
        result = deleteSellerData
        break

      case 'pauseAuction':
        console.log('Pausing auction')
        const { data: pauseAuctionData, error: pauseAuctionError } = await supabase
          .from('cars')
          .update({ auction_status: 'paused' })
          .eq('id', params.auctionId)
          .select()
          .single()

        if (pauseAuctionError) {
          console.error('Error pausing auction:', pauseAuctionError)
          throw pauseAuctionError
        }

        console.log(`Successfully paused auction ${params.auctionId}`)
        result = pauseAuctionData
        break

      case 'startAuction':
        console.log('Starting auction')
        const { data: startAuctionData, error: startAuctionError } = await supabase
          .from('cars')
          .update({ auction_status: 'active' })
          .eq('id', params.auctionId)
          .select()
          .single()

        if (startAuctionError) {
          console.error('Error starting auction:', startAuctionError)
          throw startAuctionError
        }

        console.log(`Successfully started auction ${params.auctionId}`)
        result = startAuctionData
        break

      case 'cancelAuction':
        console.log('Cancelling auction')
        const { data: cancelAuctionData, error: cancelAuctionError } = await supabase
          .from('cars')
          .update({ auction_status: 'cancelled' })
          .eq('id', params.auctionId)
          .select()
          .single()

        if (cancelAuctionError) {
          console.error('Error cancelling auction:', cancelAuctionError)
          throw cancelAuctionError
        }

        console.log(`Successfully cancelled auction ${params.auctionId}`)
        result = cancelAuctionData
        break

      case 'checkSystemHealth':
        console.log('Checking system health')
        // Add any system health checks here
        result = { status: 'ok', timestamp: new Date().toISOString() }
        break

      case 'recoverAuction':
        console.log('Recovering auction')
        // Add any auction recovery logic here
        result = { status: 'recovery initiated', auctionId: params.auctionId, action: params.action }
        break

      case 'verifyAccess':
        console.log('Verifying admin access')
        result = { userId: 'admin', timestamp: new Date().toISOString() }
        break
        
      default:
        console.error('Unknown action:', action)
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Admin API error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
