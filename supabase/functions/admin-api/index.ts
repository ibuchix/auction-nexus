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
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    console.log('Environment check:', {
      hasUrl: !!supabaseUrl,
      hasServiceRoleKey: !!serviceRoleKey
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

    // Extract JWT token from Authorization header
    const token = authHeader.replace('Bearer ', '')
    
    // Create supabase client with service role key for admin operations
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Verify the user is authenticated by passing JWT directly
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
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

    // Check admin status using user_roles table
    const { data: isAdminData, error: adminError } = await supabase
      .rpc('has_role', { 
        _user_id: user.id, 
        _role: 'admin' 
      })

    if (adminError) {
      console.error('Admin check error:', adminError)
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Failed to verify admin status'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const isAdmin = isAdminData === true
    
    if (!isAdmin) {
      console.error('Admin check failed - user does not have admin role')
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
        console.log('Fetching all sellers with emails using RPC...')
        
        // Use RPC function for efficient single-query retrieval
        const { data: sellersWithEmails, error: sellersError } = await supabase
          .rpc('get_sellers_with_emails')

        if (sellersError) {
          console.error('Sellers RPC error:', sellersError)
          throw new Error(`Failed to fetch sellers: ${sellersError.message}`)
        }

        // Transform to match expected format
        const formattedSellers = (sellersWithEmails || []).map((seller: any) => ({
          id: seller.id,
          user_id: seller.user_id,
          role: 'seller',
          created_at: seller.created_at,
          name: seller.full_name,
          email: seller.email,
          mobile_number: null,
          address: seller.address,
          verification_status: seller.verification_status,
          is_verified: seller.is_verified,
          total_listings: seller.total_listings,
          active_listings: seller.active_listings
        }))

        console.log(`Successfully fetched ${formattedSellers.length} sellers with emails (1 query instead of 155)`)
        result = formattedSellers
        break

      case 'getAllDealers':
        console.log('Fetching dealers with pagination...', params)
        
        // Extract pagination params (with defaults)
        const page = params.page || 1
        const pageSize = params.pageSize || 40
        const status = params.status
        
        // Calculate offset for SQL query
        const from = (page - 1) * pageSize
        const to = from + pageSize - 1
        
        console.log(`Fetching dealers: page ${page}, size ${pageSize}, range ${from}-${to}`)
        
        // Build base query with count
        let dealersQuery = supabase
          .from('dealers')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
        
        // Apply status filter if provided
        if (status && status !== 'all') {
          console.log('Filtering dealers by status:', status)
          dealersQuery = dealersQuery.eq('verification_status', status)
        }
        
        // Apply pagination using range
        dealersQuery = dealersQuery.range(from, to)
        
        const { data: dealersData, error: dealersError, count } = await dealersQuery

        if (dealersError) {
          console.error('Dealers query error:', dealersError)
          throw new Error(`Dealers query failed: ${dealersError.message}`)
        }

        console.log(`Fetched ${dealersData?.length || 0} dealers, total count: ${count}`)

        // Fetch email and phone for ONLY the paginated dealers
        const dealersWithEmails = await Promise.all(
          (dealersData || []).map(async (dealer) => {
            try {
              const { data: userData, error: userError } = await supabase.auth.admin.getUserById(dealer.user_id)
              
              if (userError) {
                console.warn(`Could not fetch user data for dealer ${dealer.id}:`, userError)
              }
              
              return {
                ...dealer,
                email: userData?.user?.email || null,
                phone_number: userData?.user?.phone || null
              }
            } catch (err) {
              console.error(`Error fetching user for dealer ${dealer.id}:`, err)
              return {
                ...dealer,
                email: null,
                phone_number: null
              }
            }
          })
        )

        // Return paginated response with metadata
        result = {
          dealers: dealersWithEmails,
          pagination: {
            page: page,
            pageSize: pageSize,
            totalCount: count || 0,
            totalPages: Math.ceil((count || 0) / pageSize),
            hasNextPage: to < (count || 0) - 1,
            hasPreviousPage: page > 1
          }
        }
        
        console.log('Pagination metadata:', result.pagination)
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

      case 'updateCar':
        console.log('Updating car...')
        const { data: updateCarData, error: updateCarError } = await supabase
          .from('cars')
          .update({
            ...params.updateData,
            updated_at: new Date().toISOString()
          })
          .eq('id', params.carId)
          .select()
          .single()

        if (updateCarError) {
          console.error('Car update error:', updateCarError)
          throw new Error(`Car update failed: ${updateCarError.message}`)
        }

        result = updateCarData
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
