
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
    
    // First, log the scheduler execution
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
