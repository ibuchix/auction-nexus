
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    
    console.log('Resetting auction system state')
    
    // Log reset attempt
    await supabaseClient
      .from('audit_logs')
      .insert({
        action: 'system_reset_attempt',
        entity_type: 'system',
        entity_id: '00000000-0000-0000-0000-000000000000',
        details: {
          initiated_at: new Date().toISOString()
        }
      })
    
    // 1. Fix stuck auctions (auctions that are active but past end time)
    const { data: stuckAuctions, error: stuckAuctionsError } = await supabaseClient
      .from('cars')
      .select('id, current_bid, reserve_price, auction_end_time')
      .eq('auction_status', 'active')
      .lt('auction_end_time', new Date().toISOString())
    
    if (stuckAuctionsError) {
      throw stuckAuctionsError
    }
    
    console.log(`Found ${stuckAuctions.length} stuck auctions`)
    
    // Process each stuck auction
    for (const auction of stuckAuctions) {
      const wasReserveMet = auction.current_bid >= auction.reserve_price
      
      await supabaseClient
        .from('cars')
        .update({
          auction_status: wasReserveMet ? 'sold' : 'reserve_not_met',
          status: wasReserveMet ? 'sold' : 'available',
          is_manually_controlled: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', auction.id)
        
      console.log(`Fixed stuck auction ${auction.id}`)
    }
    
    // 2. Fix scheduled auctions that should have started
    const { data: missedSchedules, error: missedSchedulesError } = await supabaseClient
      .from('auction_schedules')
      .select('id, car_id, start_time, end_time')
      .eq('status', 'scheduled')
      .lt('start_time', new Date().toISOString())
    
    if (missedSchedulesError) {
      throw missedSchedulesError
    }
    
    console.log(`Found ${missedSchedules.length} missed scheduled auctions`)
    
    // Process each missed schedule
    for (const schedule of missedSchedules) {
      // Check if end time has also passed
      const endTimePassed = new Date(schedule.end_time) < new Date()
      
      if (endTimePassed) {
        // Schedule is completely past, mark as expired
        await supabaseClient
          .from('auction_schedules')
          .update({
            status: 'expired',
            updated_at: new Date().toISOString(),
            last_status_change: new Date().toISOString()
          })
          .eq('id', schedule.id)
        
        console.log(`Marked expired schedule ${schedule.id}`)
      } else {
        // Start time passed but end time is in future, start the auction
        await supabaseClient
          .from('auction_schedules')
          .update({
            status: 'running',
            updated_at: new Date().toISOString(),
            last_status_change: new Date().toISOString()
          })
          .eq('id', schedule.id)
        
        await supabaseClient
          .from('cars')
          .update({
            auction_status: 'active',
            is_auction: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', schedule.car_id)
        
        console.log(`Started missed auction ${schedule.car_id}`)
      }
    }
    
    // 3. Check for corruption in bid records (highest bid not marked as active)
    const { data: auctions, error: auctionsError } = await supabaseClient
      .from('cars')
      .select('id, current_bid')
      .neq('current_bid', 0)
      .in('auction_status', ['active', 'sold', 'ended', 'reserve_not_met'])
    
    if (auctionsError) {
      throw auctionsError
    }
    
    let bidsFixed = 0
    
    // Process each auction with bids
    for (const auction of auctions) {
      // Find highest bid for this auction
      const { data: highestBid, error: highestBidError } = await supabaseClient
        .from('bids')
        .select('id, amount')
        .eq('car_id', auction.id)
        .order('amount', { ascending: false })
        .limit(1)
        .single()
      
      if (highestBidError && highestBidError.code !== 'PGRST116') { // PGRST116 = No rows returned
        console.error(`Error checking highest bid for auction ${auction.id}:`, highestBidError)
        continue
      }
      
      // If no bids found but current_bid > 0, reset current_bid to 0
      if (!highestBid && auction.current_bid > 0) {
        await supabaseClient
          .from('cars')
          .update({
            current_bid: 0,
            updated_at: new Date().toISOString()
          })
          .eq('id', auction.id)
        
        bidsFixed++
        console.log(`Reset current_bid for auction ${auction.id}`)
        continue
      }
      
      // If highest bid amount doesn't match current_bid, fix it
      if (highestBid && highestBid.amount !== auction.current_bid) {
        await supabaseClient
          .from('cars')
          .update({
            current_bid: highestBid.amount,
            updated_at: new Date().toISOString()
          })
          .eq('id', auction.id)
        
        bidsFixed++
        console.log(`Fixed current_bid mismatch for auction ${auction.id}`)
      }
      
      // Check if highest bid is marked as active
      if (highestBid) {
        const { data: activeBid, error: activeBidError } = await supabaseClient
          .from('bids')
          .select('id')
          .eq('car_id', auction.id)
          .eq('status', 'active')
          .limit(1)
          .single()
        
        if (activeBidError && activeBidError.code !== 'PGRST116') {
          console.error(`Error checking active bid for auction ${auction.id}:`, activeBidError)
          continue
        }
        
        // If no active bid or active bid is not the highest, fix it
        if (!activeBid || (activeBid && activeBid.id !== highestBid.id)) {
          // First, mark all bids as outbid
          await supabaseClient
            .from('bids')
            .update({
              status: 'outbid',
              updated_at: new Date().toISOString()
            })
            .eq('car_id', auction.id)
          
          // Then, mark highest bid as active
          await supabaseClient
            .from('bids')
            .update({
              status: 'active',
              updated_at: new Date().toISOString()
            })
            .eq('id', highestBid.id)
          
          bidsFixed++
          console.log(`Fixed active bid status for auction ${auction.id}`)
        }
      }
    }
    
    // Log successful reset
    await supabaseClient
      .from('audit_logs')
      .insert({
        action: 'system_reset_completed',
        entity_type: 'system',
        entity_id: '00000000-0000-0000-0000-000000000000',
        details: {
          stuck_auctions_fixed: stuckAuctions.length,
          missed_schedules_fixed: missedSchedules.length,
          bids_fixed: bidsFixed,
          completed_at: new Date().toISOString()
        }
      })
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Auction system state reset successfully',
        results: {
          stuck_auctions_fixed: stuckAuctions.length,
          missed_schedules_fixed: missedSchedules.length,
          bids_fixed: bidsFixed
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error resetting auction system:', error)
    
    // Try to log the error
    try {
      const supabaseErrorLog = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )
      
      await supabaseErrorLog
        .from('audit_logs')
        .insert({
          action: 'system_reset_failed',
          entity_type: 'system',
          entity_id: '00000000-0000-0000-0000-000000000000',
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
