
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
    
    console.log('Starting scheduled auctions...')
    
    // Log the operation start
    const { data: logEntry, error: logError } = await supabaseClient
      .from('audit_logs')
      .insert({
        action: 'start_scheduled_auctions',
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
      // Update log entry with error
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
      // Update log entry with success but no auctions to start
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
        
        // Update auction schedule status
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
        
        // Update car status
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
        
        // Log individual auction start
        await supabaseClient
          .from('audit_logs')
          .insert({
            action: 'auction_started',
            entity_type: 'auction',
            entity_id: schedule.car_id,
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
        
        // Log the error
        await supabaseClient
          .from('audit_logs')
          .insert({
            action: 'auction_start_failed',
            entity_type: 'auction_schedule',
            entity_id: schedule.id,
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
    
    // Update the main log entry with final results
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
    
    // Try to log the error
    try {
      const supabaseErrorLog = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )
      
      await supabaseErrorLog
        .from('audit_logs')
        .insert({
          action: 'auction_start_system_error',
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
