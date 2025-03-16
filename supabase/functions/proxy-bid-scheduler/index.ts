
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// This edge function is designed to be called on a schedule (every 2 minutes)
// It will invoke the process-proxy-bids function
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Proxy bid scheduler running...')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // First, check if there are any active auctions
    const { data: activeAuctions, error: checkError } = await supabaseClient
      .from('cars')
      .select('id')
      .eq('auction_status', 'active')
      .limit(1)
    
    if (checkError) {
      console.error('Error checking for active auctions:', checkError)
      throw checkError
    }
    
    // If no active auctions, log and return early
    if (!activeAuctions || activeAuctions.length === 0) {
      console.log('No active auctions found, skipping proxy bid processing')
      
      // Log the scheduler execution with "skipped" status
      await supabaseClient
        .from('audit_logs')
        .insert({
          action: 'scheduler_run',
          entity_type: 'system',
          entity_id: '00000000-0000-0000-0000-000000000000',
          details: {
            scheduler: 'proxy_bid_scheduler',
            execution_time: new Date().toISOString(),
            status: 'skipped',
            reason: 'no_active_auctions'
          }
        })
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No active auctions found, proxy bid processing skipped'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }
    
    // If we reach here, there are active auctions, so log the scheduler execution
    const { data: logEntry, error: logError } = await supabaseClient
      .from('audit_logs')
      .insert({
        action: 'scheduler_run',
        entity_type: 'system',
        entity_id: '00000000-0000-0000-0000-000000000000',
        details: {
          scheduler: 'proxy_bid_scheduler',
          execution_time: new Date().toISOString()
        }
      })
    
    if (logError) {
      console.error('Error logging scheduler execution:', logError)
    }
    
    // Call the database function to process proxy bids
    const { data, error } = await supabaseClient.rpc('process_pending_proxy_bids')
    
    if (error) {
      throw error
    }
    
    console.log('Proxy bid processing completed:', data)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Proxy bid processing triggered successfully',
        results: data
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in proxy bid scheduler:', error)
    
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
