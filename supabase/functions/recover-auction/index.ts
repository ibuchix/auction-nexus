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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create authenticated Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // Parse request body
    const { auctionId, action } = await req.json() as RecoverAuctionRequest
    
    // Validate inputs
    if (!auctionId) {
      throw new Error('Auction ID is required')
    }
    
    if (!['reset', 'force_complete', 'force_start', 'reset_bids'].includes(action)) {
      throw new Error('Invalid action')
    }
    
    console.log(`Recovering auction ${auctionId} with action: ${action}`)
    
    // Get current auction state
    const { data: auction, error: auctionError } = await supabaseClient
      .from('cars')
      .select('*')
      .eq('id', auctionId)
      .single()
      
    if (auctionError) {
      throw auctionError
    }
    
    if (!auction) {
      throw new Error('Auction not found')
    }
    
    // Log the recovery attempt
    await supabaseClient
      .from('audit_logs')
      .insert({
        action: 'recovery_attempt',
        entity_type: 'auction',
        entity_id: auctionId,
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
    
    // Perform recovery action
    switch (action) {
      case 'reset':
        // Reset auction to ready state
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
        
      case 'force_complete':
        // Force completion of auction
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
        
      case 'force_start':
        // Force start auction
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
        
      case 'reset_bids':
        // Reset bids but keep auction active
        // First, archive current bids
        const { data: currentBids } = await supabaseClient
          .from('bids')
          .select('*')
          .eq('car_id', auctionId)
        
        if (currentBids && currentBids.length > 0) {
          // Store in audit log for recovery if needed
          await supabaseClient
            .from('audit_logs')
            .insert({
              action: 'bids_archived',
              entity_type: 'auction',
              entity_id: auctionId,
              details: { archived_bids: currentBids }
            })
          
          // Delete current bids
          await supabaseClient
            .from('bids')
            .delete()
            .eq('car_id', auctionId)
        }
        
        // Clear proxy bids
        await supabaseClient
          .from('proxy_bids')
          .delete()
          .eq('car_id', auctionId)
        
        // Reset current bid on auction
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
    
    // Log the success result
    await supabaseClient
      .from('audit_logs')
      .insert({
        action: 'recovery_completed',
        entity_type: 'auction',
        entity_id: auctionId,
        details: {
          action,
          success: true
        }
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
    
    // Try to log the error
    try {
      const supabaseErrorLog = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )
      
      await supabaseErrorLog
        .from('audit_logs')
        .insert({
          action: 'recovery_failed',
          entity_type: 'auction',
          entity_id: (await req.json())?.auctionId || 'unknown',
          details: {
            error: error.message
          }
        })
    } catch (logError) {
      console.error('Failed to log error:', logError)
    }
    
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
