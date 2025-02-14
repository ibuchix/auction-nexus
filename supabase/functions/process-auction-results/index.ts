
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProcessedAuction {
  auction_id: string
  bid_count: number
  sale_status: 'sold' | 'unsold'
  final_price: number | null
  total_bids: number
  unique_bidders: number
  highest_bid_dealer_id: string | null
  bidding_activity_timeline: {
    timestamp: string
    action: string
    amount?: number
    dealer_id?: string
  }[]
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all cars with ended auctions that haven't been processed
    const { data: endedAuctions, error: auctionsError } = await supabaseClient
      .from('cars')
      .select(`
        id,
        auction_end_time,
        reserve_price,
        bids (
          amount,
          dealer_id,
          created_at,
          status
        )
      `)
      .eq('is_auction', true)
      .eq('auction_status', 'active')
      .lt('auction_end_time', new Date().toISOString())

    if (auctionsError) {
      console.error('Error fetching ended auctions:', auctionsError)
      throw auctionsError
    }

    if (!endedAuctions?.length) {
      return new Response(
        JSON.stringify({ message: 'No ended auctions to process' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    const processedResults: ProcessedAuction[] = endedAuctions.map((auction) => {
      const bids = auction.bids || []
      const sortedBids = [...bids].sort((a, b) => b.amount - a.amount)
      const highestBid = sortedBids[0]
      const uniqueBidders = new Set(bids.map(bid => bid.dealer_id)).size

      // Create bidding timeline
      const timeline = bids.map(bid => ({
        timestamp: bid.created_at,
        action: 'bid',
        amount: bid.amount,
        dealer_id: bid.dealer_id
      })).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

      const result: ProcessedAuction = {
        auction_id: auction.id,
        bid_count: bids.length,
        sale_status: highestBid && highestBid.amount >= auction.reserve_price ? 'sold' : 'unsold',
        final_price: highestBid?.amount || null,
        total_bids: bids.length,
        unique_bidders: uniqueBidders,
        highest_bid_dealer_id: highestBid?.dealer_id || null,
        bidding_activity_timeline: timeline
      }

      return result
    })

    // Insert results into auction_results table
    const { error: insertError } = await supabaseClient
      .from('auction_results')
      .upsert(
        processedResults.map(result => ({
          ...result,
          created_at: new Date().toISOString()
        })),
        { onConflict: 'auction_id' }
      )

    if (insertError) {
      console.error('Error inserting auction results:', insertError)
      throw insertError
    }

    // Update car statuses
    for (const result of processedResults) {
      if (result.sale_status === 'sold') {
        // Create dealer purchase record
        const { error: purchaseError } = await supabaseClient
          .from('dealer_purchases')
          .insert({
            car_id: result.auction_id,
            dealer_id: result.highest_bid_dealer_id,
            amount: result.final_price,
            status: 'purchased',
            purchase_date: new Date().toISOString()
          })

        if (purchaseError) {
          console.error('Error creating dealer purchase:', purchaseError)
          continue
        }
      }

      // Update car status
      const { error: updateError } = await supabaseClient
        .from('cars')
        .update({ 
          auction_status: result.sale_status === 'sold' ? 'sold' : 'reserve_not_met',
          status: result.sale_status === 'sold' ? 'sold' : 'available'
        })
        .eq('id', result.auction_id)

      if (updateError) {
        console.error('Error updating car status:', updateError)
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Successfully processed auction results',
        processed: processedResults.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error processing auction results:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
