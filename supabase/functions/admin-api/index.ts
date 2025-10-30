import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('=== Admin API Request START ===')
  console.log('Method:', req.method)
  console.log('URL:', req.url)
  console.log('Headers:', Object.fromEntries(req.headers.entries()))
  
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    
    console.log('Environment check:', {
      hasUrl: !!supabaseUrl,
      hasAnonKey: !!anonKey
    })
    
    // Get the authorization header from the request
    const authHeader = req.headers.get('authorization')
    console.log('Auth header present:', !!authHeader)
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Authorization header required for admin operations'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create supabase client with the user's session token
    const supabase = createClient(supabaseUrl, anonKey, {
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    })

    // Verify the user is authenticated and is an admin
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('User authentication failed:', userError)
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Authentication failed'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Authenticated user:', user.id)

    // Simplified admin check - direct user ID comparison
    const isAdmin = user.id === '3f07ea49-328e-4e21-878d-bef9f58af02e'
    
    if (!isAdmin) {
      console.error('Admin check failed - not admin user')
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Admin privileges required'
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Admin access verified for user:', user.id)

    // Enhanced request body parsing
    let requestData: any = {}
    
    try {
      const bodyText = await req.text()
      console.log('Raw body text:', bodyText)
      console.log('Raw body length:', bodyText?.length || 0)
      
      if (bodyText && bodyText.trim().length > 0) {
        requestData = JSON.parse(bodyText)
        console.log('Successfully parsed request body:', requestData)
      } else {
        console.log('Empty body received')
      }
    } catch (parseError) {
      console.error('Body parsing failed:', parseError.message)
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Invalid JSON in request body',
          details: parseError.message
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { action, params = {} } = requestData
    console.log('Processing action:', action)
    console.log('With params:', params)
    
    if (!action) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Action parameter is required',
          available_actions: ['verifyAccess', 'getAuctionListings', 'getActiveAuctions', 'getAllUsers', 'getAllSellers', 'getAllDealers']
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let result: any = null

    switch (action) {
      case 'verifyAccess':
        result = { 
          success: true, 
          message: 'Admin access verified',
          timestamp: new Date().toISOString(),
          userId: user.id
        }
        break

      case 'getAuctionListings':
        console.log('Fetching auction listings with params:', params)
        
        // First update auction status
        await supabase.rpc('update_auction_status')
        
        let query = supabase.from('cars').select('*')
        
        if (!params.showAllCars && params.status) {
          console.log('Filtering by status:', params.status)
          query = query.eq('auction_status', params.status)
        } else if (!params.showAllCars) {
          console.log('Filtering by approved/available status')
          query = query.in('status', ['approved', 'available'])
        }
        
        const { data: carsData, error: carsError } = await query.order('created_at', { ascending: false })
        
        if (carsError) {
          console.error('Cars query error:', carsError)
          throw new Error(`Cars query failed: ${carsError.message}`)
        }
        
        console.log(`Successfully fetched ${carsData?.length || 0} cars`)
        result = carsData
        break

      case 'getActiveAuctions':
        console.log('Fetching active auctions...')
        
        // First update auction status
        await supabase.rpc('update_auction_status')
        
        const { data: activeData, error: activeError } = await supabase
          .from('cars')
          .select('*')
          .eq('auction_status', 'active')
          .gt('auction_end_time', new Date().toISOString()) // Only include auctions that haven't ended
          .order('auction_end_time', { ascending: true })
        
        if (activeError) {
          console.error('Active auctions query error:', activeError)
          throw new Error(`Active auctions query failed: ${activeError.message}`)
        }
        
        console.log(`Successfully fetched ${activeData?.length || 0} active auctions`)
        result = activeData
        break

      case 'getAllUsers':
        console.log('Fetching all users...')
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('*')
          .order('updated_at', { ascending: false })

        if (usersError) {
          console.error('Users query error:', usersError)
          throw new Error(`Users query failed: ${usersError.message}`)
        }

        console.log(`Successfully fetched ${usersData?.length || 0} users`)
        result = usersData
        break

      case 'getAllSellers':
        console.log('Fetching all sellers...')
        
        // Fetch sellers and their cars separately
        const { data: sellersData, error: sellersError } = await supabase
          .from('sellers')
          .select('*')
          .order('created_at', { ascending: false })

        if (sellersError) {
          console.error('Sellers query error:', sellersError)
          throw new Error(`Sellers query failed: ${sellersError.message}`)
        }

        // Fetch all cars for sellers
        const { data: carsData, error: carsError } = await supabase
          .from('cars')
          .select('id, status, seller_id')

        if (carsError) {
          console.error('Cars query error:', carsError)
        }

        // Fetch emails from auth.users using admin client
        const sellersWithEmails = await Promise.all(
          (sellersData || []).map(async (seller: any) => {
            // Get user data from auth.users
            const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(
              seller.user_id
            )
            
            if (authError) {
              console.error(`Error fetching user ${seller.user_id}:`, authError)
            }
            
            // Calculate listing counts from cars data
            const sellerCars = (carsData || []).filter((car: any) => car.seller_id === seller.user_id)
            const total_listings = sellerCars.length
            const active_listings = sellerCars.filter((car: any) => car.status === 'available').length
            
            return {
              id: seller.id,
              user_id: seller.user_id,
              role: 'seller',
              created_at: seller.created_at,
              name: seller.full_name,
              email: authUser?.user?.email || null,
              mobile_number: null,
              address: seller.address,
              verification_status: seller.verification_status,
              is_verified: seller.is_verified,
              total_listings,
              active_listings
            }
          })
        )

        console.log(`Successfully fetched ${sellersWithEmails.length} sellers with emails`)
        result = sellersWithEmails
        break

      case 'getAllDealers':
        console.log('Fetching all dealers...')
        const { data: dealersData, error: dealersError } = await supabase
          .from('dealers')
          .select('*')
          .order('created_at', { ascending: false })

        if (dealersError) {
          console.error('Dealers query error:', dealersError)
          throw new Error(`Dealers query failed: ${dealersError.message}`)
        }

        console.log(`Successfully fetched ${dealersData?.length || 0} dealers`)
        result = dealersData
        break

      case 'updateUserRole':
        console.log('Updating user role...')
        const { data: roleData, error: roleError } = await supabase
          .from('profiles')
          .update({ role: params.role })
          .eq('id', params.userId)
          .select()
          .single()

        if (roleError) {
          console.error('Role update error:', roleError)
          throw new Error(`Role update failed: ${roleError.message}`)
        }

        result = roleData
        break

      case 'suspendUser':
        console.log('Suspending user...')
        const { data: suspendData, error: suspendError } = await supabase
          .from('profiles')
          .update({ suspended: params.suspended })
          .eq('id', params.userId)
          .select()
          .single()

        if (suspendError) {
          console.error('User suspension error:', suspendError)
          throw new Error(`User suspension failed: ${suspendError.message}`)
        }

        result = suspendData
        break

      case 'verifyDealer':
        console.log('Verifying dealer...')
        const { data: verifyData, error: verifyError } = await supabase
          .from('dealers')
          .update({
            verification_status: 'approved',
            is_verified: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', params.dealerId)
          .select()
          .single()

        if (verifyError) {
          console.error('Dealer verification error:', verifyError)
          throw new Error(`Dealer verification failed: ${verifyError.message}`)
        }

        result = verifyData
        break

      case 'rejectDealer':
        console.log('Rejecting dealer...')
        const { data: rejectData, error: rejectError } = await supabase
          .from('dealers')
          .update({
            verification_status: 'rejected',
            is_verified: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', params.dealerId)
          .select()
          .single()

        if (rejectError) {
          console.error('Dealer rejection error:', rejectError)
          throw new Error(`Dealer rejection failed: ${rejectError.message}`)
        }

        result = rejectData
        break

      case 'deleteSeller':
        console.log('Deleting seller...')
        // Delete cars first
        const { error: deleteCarError } = await supabase.from('cars').delete().eq('seller_id', params.sellerId)
        if (deleteCarError) {
          console.error('Error deleting seller cars:', deleteCarError)
        }
        
        // Delete seller
        const { data: deleteData, error: deleteError } = await supabase
          .from('sellers')
          .delete()
          .eq('user_id', params.sellerId)

        if (deleteError) {
          console.error('Seller deletion error:', deleteError)
          throw new Error(`Seller deletion failed: ${deleteError.message}`)
        }

        result = { success: true, message: 'Seller deleted successfully' }
        break

      case 'pauseAuction':
        console.log('Pausing auction...')
        const { data: pauseData, error: pauseError } = await supabase
          .from('cars')
          .update({ auction_status: 'paused' })
          .eq('id', params.auctionId)
          .select()
          .single()

        if (pauseError) {
          console.error('Auction pause error:', pauseError)
          throw new Error(`Auction pause failed: ${pauseError.message}`)
        }

        result = pauseData
        break

      case 'startAuction':
        console.log('Starting auction...')
        const { data: startData, error: startError } = await supabase
          .from('cars')
          .update({ auction_status: 'active' })
          .eq('id', params.auctionId)
          .select()
          .single()

        if (startError) {
          console.error('Auction start error:', startError)
          throw new Error(`Auction start failed: ${startError.message}`)
        }

        result = startData
        break

      case 'cancelAuction':
        console.log('Cancelling auction...')
        const { data: cancelData, error: cancelError } = await supabase
          .from('cars')
          .update({ auction_status: 'cancelled' })
          .eq('id', params.auctionId)
          .select()
          .single()

        if (cancelError) {
          console.error('Auction cancellation error:', cancelError)
          throw new Error(`Auction cancellation failed: ${cancelError.message}`)
        }

        result = cancelData
        break

      case 'checkSystemHealth':
        console.log('Checking system health...')
        // Test database connection
        const { data: healthData, error: healthError } = await supabase
          .from('cars')
          .select('count')
          .limit(1)
          .single()
        
        result = { 
          status: healthError ? 'unhealthy' : 'healthy', 
          timestamp: new Date().toISOString(),
          database: healthError ? 'error' : 'connected',
          error: healthError?.message
        }
        break

      case 'recoverAuction':
        console.log('Recovering auction...')
        result = { 
          success: true,
          message: 'Recovery initiated',
          auctionId: params.auctionId,
          action: params.action
        }
        break

      default:
        throw new Error(`Unknown action: ${action}`)
    }

    console.log('Action completed successfully:', action)
    console.log('Result type:', typeof result)
    console.log('Result is array:', Array.isArray(result))
    
    const response = {
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    }
    
    console.log('=== Sending Response ===')
    console.log('Response structure:', typeof response)
    
    return new Response(
      JSON.stringify(response),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('=== Admin API Error ===')
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    
    const errorResponse = {
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    }
    
    return new Response(
      JSON.stringify(errorResponse),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } finally {
    console.log('=== Admin API Request END ===')
  }
})
