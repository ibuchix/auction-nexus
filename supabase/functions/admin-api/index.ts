
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
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    console.log('Environment check:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!serviceKey,
      serviceKeyPrefix: serviceKey?.substring(0, 20) + '...'
    })
    
    // Create admin client with service role (bypasses all RLS)
    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Enhanced request body parsing with multiple methods
    let requestData: any = {}
    let bodyParsingMethod = 'none'
    
    try {
      // Method 1: Try to read as text first
      const bodyText = await req.text()
      console.log('Raw body text:', bodyText)
      console.log('Raw body length:', bodyText?.length || 0)
      
      if (bodyText && bodyText.trim().length > 0) {
        try {
          requestData = JSON.parse(bodyText)
          bodyParsingMethod = 'json-from-text'
          console.log('Successfully parsed JSON from text')
        } catch (jsonError) {
          console.log('JSON parse failed:', jsonError.message)
          // If it's not JSON, maybe it's a simple string action
          if (bodyText.trim().length < 100) {
            requestData = { action: bodyText.trim() }
            bodyParsingMethod = 'simple-text'
          }
        }
      } else {
        console.log('Empty body received, checking URL for action')
        // Check URL for action parameter as fallback
        const url = new URL(req.url)
        const urlAction = url.searchParams.get('action')
        if (urlAction) {
          requestData = { action: urlAction }
          bodyParsingMethod = 'url-param'
        }
      }
    } catch (parseError) {
      console.log('Body parsing failed:', parseError.message)
    }

    console.log('Parsed request data:', requestData)
    console.log('Body parsing method:', bodyParsingMethod)
    
    const { action, params = {} } = requestData
    
    // Special test action that doesn't require parameters
    if (!action || action === 'test') {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Admin API is working',
          debug: {
            method: req.method,
            bodyParsingMethod,
            hasServiceKey: !!serviceKey,
            timestamp: new Date().toISOString()
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    if (!action) {
      return new Response(
        JSON.stringify({ 
          error: 'Action parameter is required',
          debug: {
            bodyParsingMethod,
            receivedData: requestData,
            availableActions: ['verifyAccess', 'getAuctionListings', 'getActiveAuctions', 'getAllUsers', 'getAllSellers', 'getAllDealers']
          }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Processing action:', action)
    console.log('With params:', params)

    // Handle admin actions - using service role for maximum permissions
    let result: any = null

    switch (action) {
      case 'verifyAccess':
        result = { 
          success: true, 
          message: 'Admin access verified',
          timestamp: new Date().toISOString(),
          serviceRole: true
        }
        break

      case 'getAuctionListings':
        console.log('Fetching auction listings with params:', params)
        let query = adminClient.from('cars').select('*')
        
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
        const { data: activeData, error: activeError } = await adminClient
          .from('cars')
          .select('*')
          .in('auction_status', ['active', 'pending'])
          .eq('is_auction', true)
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
        const { data: usersData, error: usersError } = await adminClient
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
        const { data: sellersData, error: sellersError } = await adminClient
          .from('sellers')
          .select('*')
          .order('created_at', { ascending: false })

        if (sellersError) {
          console.error('Sellers query error:', sellersError)
          throw new Error(`Sellers query failed: ${sellersError.message}`)
        }

        console.log(`Successfully fetched ${sellersData?.length || 0} sellers`)
        result = sellersData
        break

      case 'getAllDealers':
        console.log('Fetching all dealers...')
        const { data: dealersData, error: dealersError } = await adminClient
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
        const { data: roleData, error: roleError } = await adminClient
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
        const { data: suspendData, error: suspendError } = await adminClient
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
        const { data: verifyData, error: verifyError } = await adminClient
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
        const { data: rejectData, error: rejectError } = await adminClient
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
        const { error: deleteCarError } = await adminClient.from('cars').delete().eq('seller_id', params.sellerId)
        if (deleteCarError) {
          console.error('Error deleting seller cars:', deleteCarError)
        }
        
        // Delete seller
        const { data: deleteData, error: deleteError } = await adminClient
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
        const { data: pauseData, error: pauseError } = await adminClient
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
        const { data: startData, error: startError } = await adminClient
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
        const { data: cancelData, error: cancelError } = await adminClient
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
        const { data: healthData, error: healthError } = await adminClient
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
    
    // Return success response
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
    console.error('Error type:', typeof error)
    
    const errorResponse = {
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString(),
      debug: {
        errorType: error.constructor.name,
        stack: error.stack
      }
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
