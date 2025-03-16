
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AuditReportRequest {
  startDate: string;
  endDate: string;
  filterType?: string;
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
    
    // Parse request body
    const { startDate, endDate, filterType } = await req.json() as AuditReportRequest
    
    // Validate inputs
    if (!startDate || !endDate) {
      throw new Error('Start date and end date are required')
    }
    
    console.log(`Generating audit report from ${startDate} to ${endDate}`)
    
    // Query audit logs based on filter criteria
    let query = supabaseClient
      .from('audit_logs')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false })
    
    // Apply type filter if provided
    if (filterType) {
      if (filterType === 'errors') {
        query = query.like('action', '%failed%')
      } else if (filterType === 'auctions') {
        query = query.or('action.eq.auction_closed,action.eq.auction_close_failed')
      } else if (filterType === 'bids') {
        query = query.or('action.eq.auto_proxy_bid,entity_type.eq.proxy_bid')
      } else if (filterType === 'admin') {
        query = query.or('action.eq.recovery_attempt,action.eq.system_reset_attempt')
      }
    }
    
    const { data: logs, error } = await query
    
    if (error) {
      throw error
    }
    
    // Create export history record
    const { data: exportRecord, error: exportError } = await supabaseClient
      .from('export_history')
      .insert({
        export_type: 'audit_logs',
        date_range_start: startDate,
        date_range_end: endDate,
        filters: { filter_type: filterType },
        record_count: logs?.length || 0,
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (exportError) {
      console.error('Error creating export record:', exportError)
    }
    
    // Prepare summary statistics
    const stats = {
      total_logs: logs?.length || 0,
      errors_count: logs?.filter(log => log.action.includes('failed') || log.action.includes('error')).length || 0,
      auction_operations: logs?.filter(log => log.entity_type === 'auction').length || 0,
      system_operations: logs?.filter(log => log.entity_type === 'system').length || 0,
      top_actions: [] as {action: string, count: number}[]
    }
    
    // Calculate top actions
    const actionCounts = logs?.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}
    
    stats.top_actions = Object.entries(actionCounts)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
    
    // Generate CSV data for export
    const csvHeader = 'Timestamp,Action,Entity Type,Entity ID,Details\n'
    const csvRows = logs?.map(log => {
      const timestamp = new Date(log.created_at).toISOString()
      const action = log.action
      const entityType = log.entity_type
      const entityId = log.entity_id
      const details = JSON.stringify(log.details || {})
      
      return `"${timestamp}","${action}","${entityType}","${entityId}","${details.replace(/"/g, '""')}"`
    }).join('\n') || ''
    
    const csvContent = csvHeader + csvRows
    
    // Generate HTML report preview
    const htmlReport = `
      <html>
        <head>
          <title>Audit Log Report (${startDate} to ${endDate})</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            .summary { background: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            tr:nth-child(even) { background-color: #f9f9f9; }
          </style>
        </head>
        <body>
          <h1>Audit Log Report</h1>
          <p>Period: ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}</p>
          <p>Filter: ${filterType || 'None'}</p>
          
          <div class="summary">
            <h2>Summary</h2>
            <p>Total Logs: ${stats.total_logs}</p>
            <p>Error Entries: ${stats.errors_count}</p>
            <p>Auction Operations: ${stats.auction_operations}</p>
            <p>System Operations: ${stats.system_operations}</p>
            
            <h3>Top Actions</h3>
            <ul>
              ${stats.top_actions.map(a => `<li>${a.action}: ${a.count}</li>`).join('')}
            </ul>
          </div>
          
          <h2>Log Entries (${Math.min(logs?.length || 0, 100)} of ${logs?.length || 0})</h2>
          <table>
            <tr>
              <th>Timestamp</th>
              <th>Action</th>
              <th>Entity Type</th>
              <th>Entity ID</th>
              <th>Details</th>
            </tr>
            ${logs?.slice(0, 100).map(log => `
              <tr>
                <td>${new Date(log.created_at).toLocaleString()}</td>
                <td>${log.action}</td>
                <td>${log.entity_type}</td>
                <td>${log.entity_id || 'N/A'}</td>
                <td><pre>${JSON.stringify(log.details || {}, null, 2)}</pre></td>
              </tr>
            `).join('') || ''}
          </table>
          
          <p>Generated at: ${new Date().toLocaleString()}</p>
        </body>
      </html>
    `
    
    return new Response(
      JSON.stringify({
        success: true,
        stats,
        export_id: exportRecord?.id,
        report_preview: htmlReport,
        csv_data: csvContent
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error generating audit report:', error)
    
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
