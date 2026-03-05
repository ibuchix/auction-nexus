
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
    
    console.log('Starting scheduled auctions... triggered by admin:', user.id)
    
    // Log the operation start
    const { data: logEntry, error: logError } = await supabaseClient
      .from('audit_logs')
      .insert({
        action: 'start_scheduled_auctions',
        entity_type: 'system',
        entity_id: '00000000-0000-0000-0000-000000000000',
        user_id: user.id,
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
    
    // Find auctions to start (scheduled and start time has passed)
    const { data: schedulesToStart, error: schedulesError } = await supabaseClient
      .from('auction_schedules')
      .select(`
        id,
        car_id,
        start_time,
        end_time,
        status,
        notes,
        cars!inner (
          id,
          title
        )
      `)
      .eq('status', 'scheduled')
      .lte('start_time', new Date().toISOString())
    
    if (schedulesError) {
      if (logId) {
        await supabaseClient
          .from('audit_logs')
          .update({
            details: {
              operation_start: new Date().toISOString(),
              status: 'failed',
              error: schedulesError.message
            }
          })
          .eq('id', logId)
      }
      
      throw schedulesError
    }
    
    if (!schedulesToStart?.length) {
      if (logId) {
        await supabaseClient
          .from('audit_logs')
          .update({
            details: {
              operation_start: new Date().toISOString(),
              status: 'completed',
              auctions_started: 0,
              message: 'No auctions to start'
            }
          })
          .eq('id', logId)
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No auctions to start', 
          result: { auctions_started: 0 } 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }
    
    console.log(`Found ${schedulesToStart.length} auctions to start`)
    
    const results = []
    const errors = []
    
    // Process each schedule
    for (const schedule of schedulesToStart) {
      try {
        console.log(`Starting auction for car ${schedule.car_id} (${schedule.cars.title || 'Untitled'})`)
        
        const { error: updateScheduleError } = await supabaseClient
          .from('auction_schedules')
          .update({
            status: 'running',
            last_status_change: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', schedule.id)
        
        if (updateScheduleError) {
          throw updateScheduleError
        }
        
        const { error: updateCarError } = await supabaseClient
          .from('cars')
          .update({
            auction_status: 'active',
            is_auction: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', schedule.car_id)
        
        if (updateCarError) {
          throw updateCarError
        }
        
        await supabaseClient
          .from('audit_logs')
          .insert({
            action: 'auction_started',
            entity_type: 'auction',
            entity_id: schedule.car_id,
            user_id: user.id,
            details: {
              schedule_id: schedule.id,
              title: schedule.cars.title,
              start_time: schedule.start_time,
              end_time: schedule.end_time
            }
          })
        
        results.push({
          schedule_id: schedule.id,
          car_id: schedule.car_id,
          title: schedule.cars.title,
          success: true
        })
      } catch (scheduleError) {
        console.error(`Error starting auction for schedule ${schedule.id}:`, scheduleError)
        
        await supabaseClient
          .from('audit_logs')
          .insert({
            action: 'auction_start_failed',
            entity_type: 'auction_schedule',
            entity_id: schedule.id,
            user_id: user.id,
            details: {
              car_id: schedule.car_id,
              error: scheduleError.message
            }
          })
        
        errors.push({
          schedule_id: schedule.id,
          car_id: schedule.car_id,
          error: scheduleError.message,
          success: false
        })
      }
    }
    
    if (logId) {
      await supabaseClient
        .from('audit_logs')
        .update({
          details: {
            operation_start: new Date().toISOString(),
            status: 'completed',
            auctions_started: results.length,
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
        message: `Started ${results.length} auctions with ${errors.length} errors`, 
        result: { 
          auctions_started: results.length,
          success: results,
          errors
        } 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error starting scheduled auctions:', error)
    
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