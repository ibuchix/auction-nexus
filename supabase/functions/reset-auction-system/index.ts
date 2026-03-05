
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    
    console.log('Resetting auction system state, triggered by admin:', user.id)
    
    // Log reset attempt
    await supabaseClient
      .from('audit_logs')
      .insert({
        action: 'system_reset_attempt',
        entity_type: 'system',
        entity_id: '00000000-0000-0000-0000-000000000000',
        user_id: user.id,
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
    
    if (stuckAuctionsError) throw stuckAuctionsError
    
    console.log(`Found ${stuckAuctions.length} stuck auctions`)
    
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
    
    if (missedSchedulesError) throw missedSchedulesError
    
    console.log(`Found ${missedSchedules.length} missed scheduled auctions`)
    
    for (const schedule of missedSchedules) {
      const endTimePassed = new Date(schedule.end_time) < new Date()
      
      if (endTimePassed) {
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
    
    // 3. Check for corruption in bid records
    const { data: auctions, error: auctionsError } = await supabaseClient
      .from('cars')
      .select('id, current_bid')
      .neq('current_bid', 0)
      .in('auction_status', ['active', 'sold', 'ended', 'reserve_not_met'])
    
    if (auctionsError) throw auctionsError
    
    let bidsFixed = 0
    
    for (const auction of auctions) {
      const { data: highestBid, error: highestBidError } = await supabaseClient
        .from('bids')
        .select('id, amount')
        .eq('car_id', auction.id)
        .order('amount', { ascending: false })
        .limit(1)
        .single()
      
      if (highestBidError && highestBidError.code !== 'PGRST116') {
        console.error(`Error checking highest bid for auction ${auction.id}:`, highestBidError)
        continue
      }
      
      if (!highestBid && auction.current_bid > 0) {
        await supabaseClient
          .from('cars')
          .update({ current_bid: 0, updated_at: new Date().toISOString() })
          .eq('id', auction.id)
        bidsFixed++
        continue
      }
      
      if (highestBid && highestBid.amount !== auction.current_bid) {
        await supabaseClient
          .from('cars')
          .update({ current_bid: highestBid.amount, updated_at: new Date().toISOString() })
          .eq('id', auction.id)
        bidsFixed++
      }
      
      if (highestBid) {
        const { data: activeBid, error: activeBidError } = await supabaseClient
          .from('bids')
          .select('id')
          .eq('car_id', auction.id)
          .eq('status', 'active')
          .limit(1)
          .single()
        
        if (activeBidError && activeBidError.code !== 'PGRST116') continue
        
        if (!activeBid || (activeBid && activeBid.id !== highestBid.id)) {
          await supabaseClient
            .from('bids')
            .update({ status: 'outbid', updated_at: new Date().toISOString() })
            .eq('car_id', auction.id)
          
          await supabaseClient
            .from('bids')
            .update({ status: 'active', updated_at: new Date().toISOString() })
            .eq('id', highestBid.id)
          
          bidsFixed++
        }
      }
    }
    
    await supabaseClient
      .from('audit_logs')
      .insert({
        action: 'system_reset_completed',
        entity_type: 'system',
        entity_id: '00000000-0000-0000-0000-000000000000',
        user_id: user.id,
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
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})