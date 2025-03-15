
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Closing ended auctions...')
    
    // Find auctions that have ended but still have 'active' status
    const { data: endedAuctions, error: auctionsError } = await supabaseClient
      .from('cars')
      .select(`
        id,
        title,
        current_bid,
        reserve_price,
        auction_end_time,
        bids (
          id,
          dealer_id,
          amount,
          created_at,
          status
        )
      `)
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

    console.log(`Found ${endedAuctions.length} auctions to close`)
    
    const processedResults = []
    
    // Process each auction individually for better error handling
    for (const auction of endedAuctions) {
      try {
        console.log(`Processing auction: ${auction.id} - ${auction.title || 'No title'}`)
        
        // Get the highest bid
        const bids = auction.bids || []
        const sortedBids = [...bids].sort((a, b) => b.amount - a.amount)
        const highestBid = sortedBids[0]
        
        // Determine if reserve was met
        const reserveMet = highestBid && highestBid.amount >= auction.reserve_price
        const newStatus = reserveMet ? 'sold' : 'reserve_not_met'
        
        // Update auction status
        const { error: updateError } = await supabaseClient
          .from('cars')
          .update({ 
            auction_status: newStatus,
            status: reserveMet ? 'sold' : 'available',
            updated_at: new Date().toISOString()
          })
          .eq('id', auction.id)
        
        if (updateError) {
          throw updateError
        }
        
        // If sold, create a dealer purchase record
        if (reserveMet && highestBid) {
          const { error: purchaseError } = await supabaseClient
            .from('dealer_purchases')
            .insert({
              car_id: auction.id,
              dealer_id: highestBid.dealer_id,
              amount: highestBid.amount,
              status: 'purchased',
              purchase_date: new Date().toISOString()
            })
          
          if (purchaseError) {
            console.warn(`Error creating dealer purchase for auction ${auction.id}:`, purchaseError)
            // Continue processing other auctions even if purchase record fails
          }
        }
        
        // Update auction results table
        const uniqueBidders = new Set(bids.map(bid => bid.dealer_id)).size
        
        // Create timeline of bidding activity
        const timeline = bids.map(bid => ({
          timestamp: bid.created_at,
          action: 'bid',
          amount: bid.amount,
          dealer_id: bid.dealer_id
        })).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        
        // Insert or update auction results
        const { error: resultsError } = await supabaseClient
          .from('auction_results')
          .upsert({
            auction_id: auction.id,
            bid_count: bids.length,
            sale_status: reserveMet ? 'sold' : 'unsold',
            final_price: highestBid?.amount || null,
            total_bids: bids.length,
            unique_bidders: uniqueBidders,
            highest_bid_dealer_id: highestBid?.dealer_id || null,
            bidding_activity_timeline: timeline,
            created_at: new Date().toISOString()
          }, { onConflict: 'auction_id' })
        
        if (resultsError) {
          console.warn(`Error updating auction results for auction ${auction.id}:`, resultsError)
          // Continue processing other auctions even if results update fails
        }
        
        // Add to processed results
        processedResults.push({
          auction_id: auction.id,
          title: auction.title,
          status: newStatus,
          reserve_met: reserveMet,
          highest_bid: highestBid?.amount || null
        })
        
        console.log(`Successfully closed auction ${auction.id} with status ${newStatus}`)
      } catch (auctionError) {
        console.error(`Error processing auction ${auction.id}:`, auctionError)
        processedResults.push({
          auction_id: auction.id,
          error: auctionError.message,
          success: false
        })
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Successfully processed auction results',
        processed: processedResults
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
