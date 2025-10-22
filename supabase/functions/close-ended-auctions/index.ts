
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

    console.log('Manual auction close triggered by admin')
    
    // Log the manual trigger
    const { error: logError } = await supabaseClient
      .from('audit_logs')
      .insert({
        action: 'manual_retry',
        entity_type: 'system',
        entity_id: '00000000-0000-0000-0000-000000000000',
        details: {
          triggered_at: new Date().toISOString(),
          triggered_by: 'admin_button',
          operation: 'close_ended_auctions_manual'
        }
      })

    if (logError) {
      console.error('Error logging manual trigger:', logError)
    }

    // Call the secure processing function with proxy bid logic and ON CONFLICT protection
    console.log('Calling process_ended_auctions_securely()...')
    
    const { data, error } = await supabaseClient.rpc('process_ended_auctions_securely')

    if (error) {
      console.error('Error processing auctions:', error)
      
      // Log the failure
      await supabaseClient
        .from('audit_logs')
        .insert({
          action: 'auction_close_failed',
          entity_type: 'system',
          entity_id: '00000000-0000-0000-0000-000000000000',
          details: {
            error: error.message,
            error_details: error.details,
            triggered_by: 'admin_button'
          }
        })
      
      throw error
    }

    console.log('Auction processing result:', data)

    // Log success
    await supabaseClient
      .from('audit_logs')
      .insert({
        action: 'process_auctions',
        entity_type: 'system',
        entity_id: '00000000-0000-0000-0000-000000000000',
        details: {
          result: data,
          triggered_by: 'admin_button',
          success: true
        }
      })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Auctions processed successfully using secure proxy logic',
        result: data
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error processing auction results:', error)
    
    // Try to log the error
    try {
      const supabaseErrorLog = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )
      
      await supabaseErrorLog
        .from('audit_logs')
        .insert({
          action: 'auction_close_system_error',
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
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
