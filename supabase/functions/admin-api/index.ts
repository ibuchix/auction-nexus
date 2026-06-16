import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
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
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    console.log('Environment check:', {
      hasUrl: !!supabaseUrl,
      hasAnonKey: !!supabaseAnonKey,
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

    // Extract JWT token from "Bearer <token>" format
    const token = authHeader.replace('Bearer ', '').trim()
    
    if (!token) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Invalid authorization token format'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create a Supabase client with anon key to verify the JWT
    const userSupabase = createClient(supabaseUrl, supabaseAnonKey)

    // Verify the user is authenticated by passing the JWT directly
    const { data: { user }, error: userError } = await userSupabase.auth.getUser(token)
    
    // Create supabase client with service role key for admin operations
    const supabase = createClient(supabaseUrl, serviceRoleKey)
    
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

      case 'getAllSellers': {
        console.log('Fetching all sellers with emails using paginated RPC...')
        
        // PostgREST enforces a max-rows limit of 1000 per request.
        // We must paginate through results to get all sellers.
        let allSellersData: any[] = [];
        let sellerOffset = 0;
        const sellerBatchSize = 1000;
        let hasMoreSellers = true;

        while (hasMoreSellers) {
          const { data: batch, error: batchError } = await supabase
            .rpc('get_sellers_with_emails')
            .range(sellerOffset, sellerOffset + sellerBatchSize - 1)
            .order('created_at', { ascending: false });

          if (batchError) {
            console.error('Sellers RPC batch error:', batchError);
            throw new Error(`Failed to fetch sellers: ${batchError.message}`);
          }

          if (batch && batch.length > 0) {
            allSellersData = allSellersData.concat(batch);
            console.log(`Fetched seller batch: offset=${sellerOffset}, rows=${batch.length}, total so far=${allSellersData.length}`);
            sellerOffset += sellerBatchSize;
            hasMoreSellers = batch.length === sellerBatchSize;
          } else {
            hasMoreSellers = false;
          }
        }

        // Transform to match expected format
        const formattedSellers = allSellersData.map((seller: any) => ({
          id: seller.id,
          user_id: seller.user_id,
          role: 'seller',
          created_at: seller.created_at,
          name: seller.full_name,
          email: seller.email,
          mobile_number: seller.phone_number || null,
          address: seller.address,
          verification_status: seller.verification_status,
          is_verified: seller.is_verified,
          total_listings: seller.total_listings,
          active_listings: seller.active_listings
        }));

        console.log(`Successfully fetched ALL ${formattedSellers.length} sellers via pagination`);
        result = formattedSellers;
        break;
      }

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

        // Handle range out of bounds gracefully (PGRST103)
        if (dealersError) {
          // If the error is "Requested range not satisfiable", it means we're trying to access
          // a page beyond what exists. This is normal in pagination - just return empty results.
          if (dealersError.code === 'PGRST103') {
            console.log('Requested range out of bounds, returning empty results')
            result = {
              dealers: [],
              pagination: {
                page: page,
                pageSize: pageSize,
                totalCount: 0,
                totalPages: 0,
                hasNextPage: false,
                hasPreviousPage: page > 1
              }
            }
            break
          }
          
          console.error('Dealers query error:', dealersError)
          throw new Error(`Dealers query failed: ${dealersError.message}`)
        }

        console.log(`Fetched ${dealersData?.length || 0} dealers, total count: ${count}`)

        // Batch-fetch subscription info for these dealers
        const dealerIds = (dealersData || []).map((d: any) => d.id)
        const subscriptionsByDealerId: Record<string, any> = {}
        if (dealerIds.length > 0) {
          const { data: subsData, error: subsError } = await supabase
            .from('dealer_subscriptions')
            .select('dealer_id, status, current_period_end, cancel_at_period_end')
            .in('dealer_id', dealerIds)
          if (subsError) {
            console.warn('Failed to fetch dealer_subscriptions:', subsError)
          } else {
            for (const sub of subsData || []) {
              const existing = subscriptionsByDealerId[sub.dealer_id]
              const isActive = sub.status === 'active' || sub.status === 'trialing'
              const existingActive = existing && (existing.status === 'active' || existing.status === 'trialing')
              if (!existing || (isActive && !existingActive)) {
                subscriptionsByDealerId[sub.dealer_id] = sub
              }
            }
          }
        }

        // Fetch email and phone for ONLY the paginated dealers
        const dealersWithEmails = await Promise.all(
          (dealersData || []).map(async (dealer) => {
            const sub = subscriptionsByDealerId[dealer.id] || null
            try {
              const { data: userData, error: userError } = await supabase.auth.admin.getUserById(dealer.user_id)
              
              if (userError) {
                console.warn(`Could not fetch user data for dealer ${dealer.id}:`, userError)
              }
              
              return {
                ...dealer,
                email: userData?.user?.email || null,
                phone_number: userData?.user?.phone || null,
                subscription_status: sub?.status || null,
                subscription_current_period_end: sub?.current_period_end || null,
                subscription_cancel_at_period_end: sub?.cancel_at_period_end || false,
              }
            } catch (err) {
              console.error(`Error fetching user for dealer ${dealer.id}:`, err)
              return {
                ...dealer,
                email: null,
                phone_number: null,
                subscription_status: sub?.status || null,
                subscription_current_period_end: sub?.current_period_end || null,
                subscription_cancel_at_period_end: sub?.cancel_at_period_end || false,
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

      case 'deleteSeller': {
        console.log('Deleting seller with ID:', params.sellerId)
        
        // Step 1: Resolve user_id from sellers table (params.sellerId is sellers.id, NOT user_id)
        const { data: sellerRecord, error: sellerLookupError } = await supabase
          .from('sellers')
          .select('user_id')
          .eq('id', params.sellerId)
          .single()

        if (sellerLookupError || !sellerRecord) {
          console.error('Seller lookup error:', sellerLookupError)
          throw new Error(`Seller not found: ${sellerLookupError?.message || 'No record'}`)
        }

        const sellerUserId = sellerRecord.user_id
        console.log('Resolved seller user_id:', sellerUserId)

        // Step 2: Get all car IDs belonging to this seller
        const { data: sellerCars } = await supabase
          .from('cars')
          .select('id')
          .eq('seller_id', sellerUserId)

        const carIds = sellerCars?.map((c: { id: string }) => c.id) || []
        console.log(`Found ${carIds.length} cars to clean up`)

        // Step 3: Delete related data in dependency order
        const deletionSummary: Record<string, number> = {}

        // Delete file uploads by seller
        const { count: fileCount } = await supabase
          .from('car_file_uploads')
          .delete({ count: 'exact' })
          .eq('seller_id', sellerUserId)
        deletionSummary.car_file_uploads = fileCount || 0

        // Delete cars history by seller
        const { count: historyCount } = await supabase
          .from('cars_history')
          .delete({ count: 'exact' })
          .eq('seller_id', sellerUserId)
        deletionSummary.cars_history = historyCount || 0

        // Delete notifications for this user
        const { count: notifCount } = await supabase
          .from('notifications')
          .delete({ count: 'exact' })
          .eq('user_id', sellerUserId)
        deletionSummary.notifications = notifCount || 0

        // Delete car-dependent records if there are cars
        if (carIds.length > 0) {
          // NEW: Delete disputes and their comments for seller's cars
          const { data: carDisputes } = await supabase
            .from('disputes')
            .select('id')
            .in('car_id', carIds)
          const disputeIds = (carDisputes || []).map((d: { id: string }) => d.id)

          if (disputeIds.length > 0) {
            const { count: commentCount } = await supabase
              .from('dispute_comments')
              .delete({ count: 'exact' })
              .in('dispute_id', disputeIds)
            deletionSummary.dispute_comments_by_car = commentCount || 0
          }

          const { count: disputeCount } = await supabase
            .from('disputes')
            .delete({ count: 'exact' })
            .in('car_id', carIds)
          deletionSummary.disputes_by_car = disputeCount || 0

          // NEW: Delete reviews referencing seller's cars
          const { count: sellerReviewCount } = await supabase
            .from('seller_reviews')
            .delete({ count: 'exact' })
            .in('car_id', carIds)
          deletionSummary.seller_reviews = sellerReviewCount || 0

          const { count: dealerReviewCount } = await supabase
            .from('dealer_reviews')
            .delete({ count: 'exact' })
            .in('car_id', carIds)
          deletionSummary.dealer_reviews = dealerReviewCount || 0

          const { count: bidCount } = await supabase
            .from('bids')
            .delete({ count: 'exact' })
            .in('car_id', carIds)
          deletionSummary.bids = bidCount || 0

          const { count: scheduleCount } = await supabase
            .from('auction_schedules')
            .delete({ count: 'exact' })
            .in('car_id', carIds)
          deletionSummary.auction_schedules = scheduleCount || 0

          const { count: resultCount } = await supabase
            .from('auction_results')
            .delete({ count: 'exact' })
            .in('car_id', carIds)
          deletionSummary.auction_results = resultCount || 0

          const { count: metricsCount } = await supabase
            .from('auction_metrics')
            .delete({ count: 'exact' })
            .in('car_id', carIds)
          deletionSummary.auction_metrics = metricsCount || 0
        }

        // Delete cars
        const { count: carsCount } = await supabase
          .from('cars')
          .delete({ count: 'exact' })
          .eq('seller_id', sellerUserId)
        deletionSummary.cars = carsCount || 0

        // Delete seller record
        const { error: deleteSellerError } = await supabase
          .from('sellers')
          .delete()
          .eq('id', params.sellerId)
        if (deleteSellerError) {
          console.error('Seller deletion error:', deleteSellerError)
          throw new Error(`Seller deletion failed: ${deleteSellerError.message}`)
        }
        deletionSummary.sellers = 1

        // NEW: Delete manual valuations by this user
        const { count: manualValCount } = await supabase
          .from('manual_valuations')
          .delete({ count: 'exact' })
          .eq('user_id', sellerUserId)
        deletionSummary.manual_valuations = manualValCount || 0

        // NEW: Delete audit logs by this user
        const { count: auditCount } = await supabase
          .from('audit_logs')
          .delete({ count: 'exact' })
          .eq('user_id', sellerUserId)
        deletionSummary.audit_logs = auditCount || 0

        // NEW: Delete dispute comments authored by this user
        const { count: userCommentCount } = await supabase
          .from('dispute_comments')
          .delete({ count: 'exact' })
          .eq('author_id', sellerUserId)
        deletionSummary.dispute_comments_by_user = userCommentCount || 0

        // NEW: Delete disputes submitted by this user
        const { count: userDisputeCount } = await supabase
          .from('disputes')
          .delete({ count: 'exact' })
          .eq('submitted_by', sellerUserId)
        deletionSummary.disputes_by_user = userDisputeCount || 0

        // Delete user role
        const { count: roleCount } = await supabase
          .from('user_roles')
          .delete({ count: 'exact' })
          .eq('user_id', sellerUserId)
        deletionSummary.user_roles = roleCount || 0

        // Delete profile
        const { count: profileCount } = await supabase
          .from('profiles')
          .delete({ count: 'exact' })
          .eq('id', sellerUserId)
        deletionSummary.profiles = profileCount || 0

        console.log('Deletion summary:', deletionSummary)
        result = { success: true, message: 'Seller and all related data deleted successfully', summary: deletionSummary }
        break
      }

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

      case 'recoverAuction': {
        console.log('Recovering auction...', params)
        const { auctionId, action: recoveryAction } = params
        
        if (!auctionId) {
          throw new Error('Auction ID is required')
        }
        if (!['reset', 'force_complete', 'force_start', 'reset_bids'].includes(recoveryAction)) {
          throw new Error('Invalid recovery action')
        }

        // Get current auction state
        const { data: auctionData, error: auctionFetchError } = await supabase
          .from('cars')
          .select('*')
          .eq('id', auctionId)
          .single()
        
        if (auctionFetchError) throw auctionFetchError
        if (!auctionData) throw new Error('Auction not found')

        // Log recovery attempt
        await supabase
          .from('audit_logs')
          .insert({
            action: 'recovery_attempt',
            entity_type: 'auction',
            entity_id: auctionId,
            user_id: user.id,
            details: {
              recovery_action: recoveryAction,
              previous_state: {
                status: auctionData.auction_status,
                current_bid: auctionData.current_bid,
                end_time: auctionData.auction_end_time
              }
            }
          })

        let recoveryResult;

        switch (recoveryAction) {
          case 'reset':
            recoveryResult = await supabase
              .from('cars')
              .update({
                auction_status: 'ready',
                is_manually_controlled: true,
                current_bid: 0,
                updated_at: new Date().toISOString()
              })
              .eq('id', auctionId)
            break

          case 'force_complete': {
            const reserveMet = auctionData.current_bid >= auctionData.reserve_price
            recoveryResult = await supabase
              .from('cars')
              .update({
                auction_status: reserveMet ? 'sold' : 'reserve_not_met',
                status: reserveMet ? 'sold' : 'available',
                is_manually_controlled: true,
                updated_at: new Date().toISOString()
              })
              .eq('id', auctionId)
            break
          }

          case 'force_start': {
            const newEndTime = new Date()
            newEndTime.setHours(newEndTime.getHours() + 24)
            recoveryResult = await supabase
              .from('cars')
              .update({
                auction_status: 'active',
                auction_start_time: new Date().toISOString(),
                auction_end_time: newEndTime.toISOString(),
                is_manually_controlled: true,
                updated_at: new Date().toISOString()
              })
              .eq('id', auctionId)
            break
          }

          case 'reset_bids': {
            // Archive current bids before deleting
            const { data: existingBids } = await supabase
              .from('bids')
              .select('*')
              .eq('car_id', auctionId)

            if (existingBids && existingBids.length > 0) {
              await supabase
                .from('audit_logs')
                .insert({
                  action: 'bids_archived',
                  entity_type: 'auction',
                  entity_id: auctionId,
                  user_id: user.id,
                  details: { archived_bids: existingBids }
                })

              await supabase
                .from('bids')
                .delete()
                .eq('car_id', auctionId)
            }

            // Clear proxy bids
            await supabase
              .from('proxy_bids')
              .delete()
              .eq('car_id', auctionId)

            recoveryResult = await supabase
              .from('cars')
              .update({
                current_bid: 0,
                is_manually_controlled: true,
                updated_at: new Date().toISOString()
              })
              .eq('id', auctionId)
            break
          }
        }

        // Log success
        await supabase
          .from('audit_logs')
          .insert({
            action: 'recovery_completed',
            entity_type: 'auction',
            entity_id: auctionId,
            user_id: user.id,
            details: { recovery_action: recoveryAction, success: true }
          })

        result = {
          success: true,
          message: `Auction ${auctionId} recovered successfully with action: ${recoveryAction}`,
          recoveryResult
        }
        break
      }

      case 'bulkRestoreAuctions':
        console.log('Bulk restoring auctions...')
        const { carIds, auctionEndTime } = params
        
        if (!carIds || !Array.isArray(carIds) || carIds.length === 0) {
          throw new Error('carIds array is required')
        }
        
        if (!auctionEndTime) {
          throw new Error('auctionEndTime is required')
        }
        
        console.log(`Restoring ${carIds.length} auctions to active status with end time: ${auctionEndTime}`)
        
        // Step 1: Clean up dealer_won_vehicles for these cars
        const { data: deletedWonVehicles, error: wonVehiclesError } = await supabase
          .from('dealer_won_vehicles')
          .delete()
          .in('car_id', carIds)
          .select('id, car_id')
        
        if (wonVehiclesError) {
          console.error('dealer_won_vehicles cleanup error:', wonVehiclesError)
          // Don't throw - cleanup is best-effort
        } else {
          console.log(`Cleaned up ${deletedWonVehicles?.length || 0} dealer_won_vehicles records`)
        }
        
        // Step 2: Clean up auction_results for these cars
        const { data: deletedResults, error: resultsError } = await supabase
          .from('auction_results')
          .delete()
          .in('car_id', carIds)
          .select('id, car_id')
        
        if (resultsError) {
          console.error('auction_results cleanup error:', resultsError)
          // Don't throw - cleanup is best-effort
        } else {
          console.log(`Cleaned up ${deletedResults?.length || 0} auction_results records`)
        }
        
        // Step 3: Update cars table
        const { data: carsUpdateData, error: carsUpdateError } = await supabase
          .from('cars')
          .update({
            auction_status: 'active',
            status: 'available',
            auction_end_time: auctionEndTime,
            is_auction: true,
            awaiting_seller_decision: false,
            updated_at: new Date().toISOString()
          })
          .in('id', carIds)
          .select('id, title, auction_status, auction_end_time, current_bid')
        
        if (carsUpdateError) {
          console.error('Cars bulk update error:', carsUpdateError)
          throw new Error(`Cars bulk update failed: ${carsUpdateError.message}`)
        }
        
        console.log(`Successfully updated ${carsUpdateData?.length || 0} cars`)
        
        // Update auction_schedules table
        const { data: schedulesUpdateData, error: schedulesUpdateError } = await supabase
          .from('auction_schedules')
          .update({
            status: 'active',
            end_time: auctionEndTime,
            updated_at: new Date().toISOString(),
            last_status_change: new Date().toISOString()
          })
          .in('car_id', carIds)
          .select('id, car_id, status, end_time')
        
        if (schedulesUpdateError) {
          console.error('Schedules bulk update error:', schedulesUpdateError)
          // Don't throw - schedules update is optional
        }
        
        console.log(`Updated ${schedulesUpdateData?.length || 0} auction schedules`)
        
        result = {
          success: true,
          carsUpdated: carsUpdateData?.length || 0,
          schedulesUpdated: schedulesUpdateData?.length || 0,
          cars: carsUpdateData,
          schedules: schedulesUpdateData
        }
        break

      case 'adminAcceptBidForSeller': {
        const { carId, decision } = params
        console.log('Admin accepting bid for seller:', { carId, decision })

        if (!carId || !['accepted', 'declined'].includes(decision)) {
          throw new Error('carId and decision ("accepted" or "declined") are required')
        }

        // 1. Get car details
        const { data: carData, error: carError } = await supabase
          .from('cars')
          .select('id, seller_id, current_bid, awaiting_seller_decision, auction_status')
          .eq('id', carId)
          .single()

        if (carError || !carData) {
          throw new Error(`Car not found: ${carError?.message || 'No record'}`)
        }

        if (!carData.seller_id) {
          throw new Error('Car has no seller_id')
        }

        // 2. Check no decision already exists
        const { data: existingDecision } = await supabase
          .from('seller_bid_decisions')
          .select('id, decision')
          .eq('car_id', carId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (existingDecision) {
          throw new Error(`A decision already exists for this car: ${existingDecision.decision}`)
        }

        // 3. Get dealer_won_vehicles record for highest_bid_dealer_id
        const { data: wonVehicle, error: wonError } = await supabase
          .from('dealer_won_vehicles')
          .select('dealer_id, winning_bid_amount')
          .eq('car_id', carId)
          .single()

        if (wonError || !wonVehicle) {
          throw new Error(`No winning bid record found: ${wonError?.message || 'No dealer_won_vehicles record'}`)
        }

        // 4. Get auction_results record for linking
        const { data: auctionResult } = await supabase
          .from('auction_results')
          .select('id')
          .eq('car_id', carId)
          .maybeSingle()

        // 5. Insert into seller_bid_decisions (triggers downstream automation)
        const { error: insertError } = await supabase
          .from('seller_bid_decisions')
          .insert({
            car_id: carId,
            seller_id: carData.seller_id,
            decision: decision,
            highest_bid: wonVehicle.winning_bid_amount,
            highest_bid_dealer_id: wonVehicle.dealer_id,
            auction_result_id: auctionResult?.id || null,
          })

        if (insertError) {
          throw new Error(`Failed to insert seller decision: ${insertError.message}`)
        }

        // 6. Update cars.awaiting_seller_decision = false
        await supabase
          .from('cars')
          .update({ awaiting_seller_decision: false })
          .eq('id', carId)

        console.log(`Admin ${decision} bid for car ${carId} on behalf of seller ${carData.seller_id}`)

        result = {
          success: true,
          message: `Bid ${decision} on behalf of seller`,
          carId,
          decision,
          sellerId: carData.seller_id,
          dealerId: wonVehicle.dealer_id,
          amount: wonVehicle.winning_bid_amount,
        }
        break
      }

      case 'getReviews': {
        console.log('Fetching all reviews...');
        const [sellerRes, dealerRes] = await Promise.all([
          supabase.from('seller_reviews').select('*').order('created_at', { ascending: false }),
          supabase.from('dealer_reviews').select('*').order('created_at', { ascending: false }),
        ]);
        if (sellerRes.error) throw new Error(`seller_reviews query failed: ${sellerRes.error.message}`);
        if (dealerRes.error) throw new Error(`dealer_reviews query failed: ${dealerRes.error.message}`);

        const sellerReviews = (sellerRes.data || []).map((r: any) => ({
          id: r.id, reviewType: 'seller', reviewerName: r.seller_name, carTitle: r.car_title,
          rating: r.rating, reviewText: r.review_text, status: r.status, createdAt: r.created_at,
        }));
        const dealerReviews = (dealerRes.data || []).map((r: any) => ({
          id: r.id, reviewType: 'dealer', reviewerName: r.dealer_name, carTitle: r.car_title,
          rating: r.rating, reviewText: r.review_text, status: r.status, createdAt: r.created_at,
        }));

        result = [...sellerReviews, ...dealerReviews].sort(
          (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        console.log(`Fetched ${result.length} total reviews`);
        break;
      }

      case 'manageReview': {
        const { reviewId, reviewType, newStatus } = params;
        if (!reviewId || !reviewType || !newStatus) {
          throw new Error('Missing required parameters: reviewId, reviewType, newStatus');
        }
        if (!['seller', 'dealer'].includes(reviewType)) {
          throw new Error('reviewType must be "seller" or "dealer"');
        }
        if (!['approved', 'rejected'].includes(newStatus)) {
          throw new Error('newStatus must be "approved" or "rejected"');
        }
        const reviewTable = reviewType === 'seller' ? 'seller_reviews' : 'dealer_reviews';
        const { error: reviewError } = await supabase
          .from(reviewTable)
          .update({ status: newStatus })
          .eq('id', reviewId);
        if (reviewError) {
          throw new Error(`Failed to update review: ${reviewError.message}`);
        }
        console.log(`Review ${reviewId} in ${reviewTable} updated to ${newStatus}`);
        result = { success: true, reviewId, reviewType, newStatus };
        break;
      }

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
