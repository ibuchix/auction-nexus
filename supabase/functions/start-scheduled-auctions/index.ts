
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { cron } from 'https://deno.land/x/deno_cron@v1.0.0/cron.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize the Supabase client
const initSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
}

// Function to start scheduled auctions
const startScheduledAuctions = async () => {
  const supabaseClient = initSupabaseClient()
  
  console.log('Starting scheduled auctions...')
  
  try {
    // Call the database function to start scheduled auctions
    const { data, error } = await supabaseClient.rpc('start_scheduled_auctions')
    
    if (error) {
      throw error
    }

    console.log('Result:', data)
    return { success: true, message: 'Successfully started scheduled auctions', result: data }
  } catch (error) {
    console.error('Error starting scheduled auctions:', error)
    return { success: false, error: error.message }
  }
}

// Set up a CRON job to run every 5 minutes
cron('*/5 * * * *', async () => {
  try {
    console.log('Running scheduled task: start-scheduled-auctions')
    const result = await startScheduledAuctions()
    console.log('Scheduled task completed:', result)
  } catch (error) {
    console.error('Error in scheduled task:', error)
  }
})

// Handle HTTP requests (for manual triggering and Supabase cron invocations)
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const result = await startScheduledAuctions()
    
    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: result.success ? 200 : 500,
      }
    )
  } catch (error) {
    console.error('Error in HTTP handler:', error)
    
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
