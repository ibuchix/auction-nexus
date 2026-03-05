import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RecoverAuctionRequest {
  auctionId: string;
  action: 'reset' | 'force_complete' | 'force_start' | 'reset_bids';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    // --- Admin Auth Guard (Variant A) ---
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    const token = authHeader.replace('Bearer ', '')
    const userClient = createClient(supabaseUrl, supabaseAnonKey)
    const { data: { user }, error: authError } = await userClient.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    const supabaseClient = createClient(supabaseUrl, serviceRoleKey)
    const { data: isAdmin } = await supabaseClient.rpc('has_role', { _user_id: user.id, _role: 'admin' })
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    // --- End Auth Guard ---
    
    const { auctionId, action } = await req.json() as RecoverAuctionRequest
    
    if (!auctionId) {
      throw new Error('Auction ID is required')
    }
    
    if (!['reset', 'force_complete', 'force_start', 'reset_bids'].includes(action)) {
      throw new Error('Invalid action')
    }
    
    console.log(`Recovering auction ${auctionId} with action: ${action}, by admin: ${user.id}`)
    
    const { data: auction, error: auctionError } = await supabaseClient
      .from('cars')
      .select('*')
      .eq('id', auctionId)
      .single()
      
    if (auctionError) throw auctionError
    if (!auction) throw new Error('Auction not found')
    
    await supabaseClient
      .from('audit_logs')
      .insert({
        action: 'recovery_attempt',
        entity_type: 'auction',
        entity_id: auctionId,
        user_id: user.id,
        details: {
          action,
          previous_state: {
            status: auction.auction_status,
            current_bid: auction.current_bid,
            start_time: auction.auction_start_time,
            end_time: auction.auction_end_time
          }
        }
      })
    
    let result;
    
    switch (action) {
      case 'reset':
        result = await supabaseClient
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
        const wasReserveMet = auction.current_bid >= auction.reserve_price
        result = await supabaseClient
          .from('cars')
          .update({
            auction_status: wasReserveMet ? 'sold' : 'reserve_not_met',
            status: wasReserveMet ? 'sold' : 'available',
            is_manually_controlled: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', auctionId)
        break
      }
        
      case 'force_start': {
        const endTime = new Date()
        endTime.setHours(endTime.getHours() + 24)
        result = await supabaseClient
          .from('cars')
          .update({
            auction_status: 'active',
            auction_start_time: new Date().toISOString(),
            auction_end_time: endTime.toISOString(),
            is_manually_controlled: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', auctionId)
        break
      }
        
      case 'reset_bids': {
        const { data: currentBids } = await supabaseClient
          .from('bids')
          .select('*')
          .eq('car_id', auctionId)
        
        if (currentBids && currentBids.length > 0) {
          await supabaseClient
            .from('audit_logs')
            .insert({
              action: 'bids_archived',
              entity_type: 'auction',
              entity_id: auctionId,
              user_id: user.id,
              details: { archived_bids: currentBids }
            })
          
          await supabaseClient
            .from('bids')
            .delete()
            .eq('car_id', auctionId)
        }
        
        await supabaseClient
          .from('proxy_bids')
          .delete()
          .eq('car_id', auctionId)
        
        result = await supabaseClient
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
    
    await supabaseClient
      .from('audit_logs')
      .insert({
        action: 'recovery_completed',
        entity_type: 'auction',
        entity_id: auctionId,
        user_id: user.id,
        details: { action, success: true }
      })
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Auction ${auctionId} recovered successfully with action: ${action}`,
        result
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error recovering auction:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})