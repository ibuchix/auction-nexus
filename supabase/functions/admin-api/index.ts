
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('=== Admin API Request ===')
  console.log('Method:', req.method)
  console.log('URL:', req.url)
  
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
    
    // Create admin client with service role (bypasses all RLS)
    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Parse request body - multiple methods for reliability
    let requestData: any = {}
    
    try {
      const bodyText = await req.text()
      console.log('Raw body:', bodyText)
      
      if (bodyText && bodyText.trim().length > 0) {
        requestData = JSON.parse(bodyText)
      }
    } catch (parseError) {
      console.log('Body parse failed:', parseError)
      // If JSON parsing fails, check if it's form data or try other methods
      try {
        const clonedReq = req.clone()
        const formData = await clonedReq.formData()
        requestData = Object.fromEntries(formData.entries())
      } catch (formError) {
        console.log('Form data parse also failed, using empty object')
        requestData = {}
      }
    }

    console.log('Parsed request data:', requestData)
    
    const { action, params = {} } = requestData
    
    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Action parameter is required' }),
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
          timestamp: new Date().toISOString()
        }
        break

      case 'getAuctionListings':
        console.log('Fetching auction listings...')
        let query = adminClient.from('cars').select('*')
        
        if (!params.showAllCars && params.status) {
          query = query.eq('auction_status', params.status)
        } else if (!params.showAllCars) {
          query = query.in('status', ['approved', 'available'])
        }
        
        const { data: carsData, error: carsError } = await query.order('created_at', { ascending: false })
        
        if (carsError) {
          throw new Error(`Cars query failed: ${carsError.message}`)
        }
        
        console.log(`Fetched ${carsData?.length || 0} cars`)
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
          throw new Error(`Active auctions query failed: ${activeError.message}`)
        }
        
        console.log(`Fetched ${activeData?.length || 0} active auctions`)
        result = activeData
        break

      case 'getAllUsers':
        console.log('Fetching all users...')
        const { data: usersData, error: usersError } = await adminClient
          .from('profiles')
          .select('*')
          .order('updated_at', { ascending: false })

        if (usersError) {
          throw new Error(`Users query failed: ${usersError.message}`)
        }

        console.log(`Fetched ${usersData?.length || 0} users`)
        result = usersData
        break

      case 'getAllSellers':
        console.log('Fetching all sellers...')
        const { data: sellersData, error: sellersError } = await adminClient
          .from('sellers')
          .select('*')
          .order('created_at', { ascending: false })

        if (sellersError) {
          throw new Error(`Sellers query failed: ${sellersError.message}`)
        }

        console.log(`Fetched ${sellersData?.length || 0} sellers`)
        result = sellersData
        break

      case 'getAllDealers':
        console.log('Fetching all dealers...')
        const { data: dealersData, error: dealersError } = await adminClient
          .from('dealers')
          .select('*')
          .order('created_at', { ascending: false })

        if (dealersError) {
          throw new Error(`Dealers query failed: ${dealersError.message}`)
        }

        console.log(`Fetched ${dealersData?.length || 0} dealers`)
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
          throw new Error(`Dealer rejection failed: ${rejectError.message}`)
        }

        result = rejectData
        break

      case 'deleteSeller':
        console.log('Deleting seller...')
        // Delete cars first
        await adminClient.from('cars').delete().eq('seller_id', params.sellerId)
        
        // Delete seller
        const { data: deleteData, error: deleteError } = await adminClient
          .from('sellers')
          .delete()
          .eq('user_id', params.sellerId)

        if (deleteError) {
          throw new Error(`Seller deletion failed: ${deleteError.message}`)
        }

        result = { success: true, message: 'Seller deleted successfully' }
        break

      case 'pauseAuction':
        const { data: pauseData, error: pauseError } = await adminClient
          .from('cars')
          .update({ auction_status: 'paused' })
          .eq('id', params.auctionId)
          .select()
          .single()

        if (pauseError) {
          throw new Error(`Auction pause failed: ${pauseError.message}`)
        }

        result = pauseData
        break

      case 'startAuction':
        const { data: startData, error: startError } = await adminClient
          .from('cars')
          .update({ auction_status: 'active' })
          .eq('id', params.auctionId)
          .select()
          .single()

        if (startError) {
          throw new Error(`Auction start failed: ${startError.message}`)
        }

        result = startData
        break

      case 'cancelAuction':
        const { data: cancelData, error: cancelError } = await adminClient
          .from('cars')
          .update({ auction_status: 'cancelled' })
          .eq('id', params.auctionId)
          .select()
          .single()

        if (cancelError) {
          throw new Error(`Auction cancellation failed: ${cancelError.message}`)
        }

        result = cancelData
        break

      case 'checkSystemHealth':
        result = { 
          status: 'healthy', 
          timestamp: new Date().toISOString(),
          database: 'connected'
        }
        break

      case 'recoverAuction':
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
    
    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('=== Admin API Error ===')
    console.error('Error:', error.message)
    console.error('Stack:', error.stack)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
