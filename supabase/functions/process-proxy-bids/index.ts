
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
    
    console.log('Processing pending proxy bids...')
    
    // Log the operation start
    const { data: logEntry, error: logError } = await supabaseClient
      .from('audit_logs')
      .insert({
        action: 'process_proxy_bids',
        entity_type: 'system',
        entity_id: '00000000-0000-0000-0000-000000000000',
        details: {
          operation_start: new Date().toISOString(),
          status: 'in_progress'
        }
      })
      .select()
      .single()
    
    if (logError) {
      console.error('Error logging operation start:', logError)
    }
    
    const logId = logEntry?.id
    
    // Get active auctions with proxy bids
    const { data: activeAuctions, error: auctionsError } = await supabaseClient
      .from('cars')
      .select(`
        id,
        auction_end_time,
        current_bid,
        minimum_bid_increment,
        proxy_bids!inner (
          id,
          dealer_id,
          max_bid_amount,
          last_processed_amount
        )
      `)
      .eq('auction_status', 'active')
      .order('auction_end_time', { ascending: true })
      
    if (auctionsError) {
      // Update log entry with error
      if (logId) {
        await supabaseClient
          .from('audit_logs')
          .update({
            details: {
              operation_start: new Date().toISOString(),
              status: 'failed',
              error: auctionsError.message
            }
          })
          .eq('id', logId)
      }
      
      throw auctionsError
    }
    
    console.log(`Found ${activeAuctions?.length || 0} auctions with pending proxy bids`)
    
    if (!activeAuctions?.length) {
      // Update log entry with success but no auctions
      if (logId) {
        await supabaseClient
          .from('audit_logs')
          .update({
            details: {
              operation_start: new Date().toISOString(),
              status: 'completed',
              auctions_processed: 0,
              message: 'No proxy bids to process'
            }
          })
          .eq('id', logId)
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No proxy bids to process' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Process each auction's proxy bids
    const results = []
    const errors = []
    let processedBidsCount = 0
    
    for (const auction of activeAuctions) {
      try {
        const bidIncrement = auction.minimum_bid_increment || 250
        let currentHighBid = auction.current_bid || 0
        
        // Sort proxy bids by max amount (highest first)
        const sortedProxyBids = auction.proxy_bids.sort((a, b) => 
          b.max_bid_amount - a.max_bid_amount
        )
        
        for (const proxyBid of sortedProxyBids) {
          // Skip if this proxy bid is already at its maximum or has been outbid
          if (proxyBid.max_bid_amount <= currentHighBid) {
            continue
          }
          
          // Calculate the next bid amount based on the bid increment
          // If this is the first bid, use the current high bid + increment
          // Otherwise, use the next bid that exceeds the previous high bid
          const lastProcessed = proxyBid.last_processed_amount || 0
          const nextBidAmount = Math.min(
            proxyBid.max_bid_amount,
            Math.max(currentHighBid + bidIncrement, lastProcessed + bidIncrement)
          )
          
          // Only place a bid if it's different from the last processed amount
          if (nextBidAmount > lastProcessed && nextBidAmount > currentHighBid) {
            // Place the proxy bid using the place_bid function
            const { data: bidResult, error: bidError } = await supabaseClient.rpc(
              'place_bid',
              {
                p_car_id: auction.id,
                p_dealer_id: proxyBid.dealer_id,
                p_amount: nextBidAmount,
                p_is_proxy: true,
                p_max_proxy_amount: proxyBid.max_bid_amount
              }
            )
            
            if (bidError) {
              console.error('Error placing proxy bid:', bidError)
              errors.push({
                auction_id: auction.id,
                proxy_bid_id: proxyBid.id,
                error: bidError.message
              })
              
              // Log individual bid failure
              await supabaseClient
                .from('audit_logs')
                .insert({
                  action: 'proxy_bid_failed',
                  entity_type: 'proxy_bid',
                  entity_id: proxyBid.id,
                  details: {
                    auction_id: auction.id,
                    amount: nextBidAmount,
                    error: bidError.message
                  }
                })
              
              continue
            }
            
            // Update the last processed amount
            await supabaseClient
              .from('proxy_bids')
              .update({
                last_processed_amount: nextBidAmount,
                updated_at: new Date().toISOString()
              })
              .eq('id', proxyBid.id)
            
            results.push({
              auction_id: auction.id,
              proxy_bid_id: proxyBid.id,
              success: true,
              bid_amount: nextBidAmount,
              bid_result: bidResult
            })
            
            // Log successful bid
            await supabaseClient
              .from('audit_logs')
              .insert({
                action: 'auto_proxy_bid',
                entity_type: 'auction',
                entity_id: auction.id,
                details: {
                  proxy_bid_id: proxyBid.id,
                  amount: nextBidAmount,
                  dealer_id: proxyBid.dealer_id,
                  success: true
                }
              })
            
            processedBidsCount++
            
            // Update current high bid for subsequent processing
            currentHighBid = nextBidAmount
          }
        }
      } catch (auctionError) {
        console.error(`Error processing auction ${auction.id}:`, auctionError)
        
        // Log auction error
        await supabaseClient
          .from('audit_logs')
          .insert({
            action: 'proxy_processing_failed',
            entity_type: 'auction',
            entity_id: auction.id,
            details: {
              error: auctionError.message
            }
          })
        
        errors.push({
          auction_id: auction.id,
          success: false,
          error: auctionError.message
        })
      }
    }
    
    // Update the main log entry with final results
    if (logId) {
      await supabaseClient
        .from('audit_logs')
        .update({
          details: {
            operation_start: new Date().toISOString(),
            status: 'completed',
            auctions_processed: activeAuctions.length,
            bids_processed: processedBidsCount,
            errors_count: errors.length,
            completed_at: new Date().toISOString(),
            success: errors.length === 0
          }
        })
        .eq('id', logId)
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Processed proxy bids', 
        results,
        errors,
        auctions_processed: activeAuctions.length,
        bids_processed: processedBidsCount 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error processing proxy bids:', error)
    
    // Try to log the error
    try {
      const supabaseErrorLog = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )
      
      await supabaseErrorLog
        .from('audit_logs')
        .insert({
          action: 'proxy_system_error',
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
