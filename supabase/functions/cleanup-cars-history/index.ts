import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.36.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CleanupResult {
  success: boolean
  deleted_count: number
  batches: number
  cutoff_date: string
  duration_seconds: number
  more_to_delete: boolean
}

async function runCleanupLoop() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseKey)

  let totalDeleted = 0
  let iteration = 0
  let moreToDelete = true
  const startTime = Date.now()

  console.log('[cleanup-cars-history] Starting background cleanup loop...')

  while (moreToDelete) {
    iteration++
    
    try {
      const { data, error } = await supabase.rpc('cleanup_cars_history_backlog')
      
      if (error) {
        console.error(`[cleanup-cars-history] Iteration ${iteration} error:`, error.message)
        break
      }

      const result = data as CleanupResult
      totalDeleted += result.deleted_count
      moreToDelete = result.more_to_delete

      console.log(`[cleanup-cars-history] Iteration ${iteration}: Deleted ${result.deleted_count}, Total: ${totalDeleted}, More: ${moreToDelete}`)

      if (iteration % 50 === 0) {
        const elapsed = Math.round((Date.now() - startTime) / 1000)
        console.log(`[cleanup-cars-history] Progress: ${iteration} iterations, ${totalDeleted} total deleted, ${elapsed}s elapsed`)
      }

      if (moreToDelete) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    } catch (err) {
      console.error(`[cleanup-cars-history] Iteration ${iteration} exception:`, err)
      break
    }
  }

  const totalTime = Math.round((Date.now() - startTime) / 1000)
  console.log(`[cleanup-cars-history] Cleanup complete! Total deleted: ${totalDeleted} in ${iteration} iterations, took ${totalTime}s`)

  return { totalDeleted, iterations: iteration, durationSeconds: totalTime }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
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

    console.log('[cleanup-cars-history] Request received from admin:', user.id)

    // Start cleanup in background
    EdgeRuntime.waitUntil(runCleanupLoop())

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Cleanup started in background. Check edge function logs for progress.',
        logsUrl: 'https://supabase.com/dashboard/project/sdvakfhmoaoucmhbhwvy/functions/cleanup-cars-history/logs'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('[cleanup-cars-history] Auth error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})