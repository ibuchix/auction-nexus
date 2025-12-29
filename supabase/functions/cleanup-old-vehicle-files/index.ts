import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CleanupResult {
  success: boolean;
  dry_run: boolean;
  cutoff_date: string;
  deleted: {
    cars: number;
    bids: number;
    auction_schedules: number;
    dealer_won_vehicles: number;
    auction_results: number;
    dealer_wishlists: number;
    car_file_uploads: number;
    cars_history: number;
    auction_metrics: number;
    listing_verifications: number;
    manual_valuations: number;
    manual_file_uploads: number;
  };
  file_paths_to_delete: {
    car_files: string[];
    manual_files: string[];
  };
  executed_at: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('🧹 Starting monthly vehicle cleanup job...');

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body for dry_run option
    let dryRun = false;
    try {
      const body = await req.json();
      dryRun = body?.dry_run === true;
    } catch {
      // No body or invalid JSON, default to dry_run = false
    }

    console.log(`📋 Mode: ${dryRun ? 'DRY RUN (preview only)' : 'LIVE (actual deletion)'}`);

    // Step 1: Call the database function to clean up records and get file paths
    console.log('📊 Calling cleanup_old_vehicle_data function...');
    
    const { data: cleanupResult, error: cleanupError } = await supabase.rpc(
      'cleanup_old_vehicle_data',
      { dry_run: dryRun }
    );

    if (cleanupError) {
      console.error('❌ Database cleanup failed:', cleanupError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: cleanupError.message,
          phase: 'database_cleanup'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const result = cleanupResult as CleanupResult;
    console.log('✅ Database cleanup completed:', JSON.stringify(result.deleted));

    // Step 2: Delete files from storage (only if not dry run)
    let storageStats = {
      car_files_deleted: 0,
      car_files_failed: 0,
      manual_files_deleted: 0,
      manual_files_failed: 0,
    };

    if (!dryRun) {
      const carFilePaths = result.file_paths_to_delete?.car_files || [];
      const manualFilePaths = result.file_paths_to_delete?.manual_files || [];

      console.log(`🗂️ Deleting ${carFilePaths.length} car files and ${manualFilePaths.length} manual valuation files...`);

      // Delete car files (from car-images and car-files buckets)
      for (const filePath of carFilePaths) {
        try {
          // Determine bucket based on file path pattern
          let bucket = 'car-images';
          if (filePath.includes('/documents/') || filePath.endsWith('.pdf')) {
            bucket = 'car-files';
          }

          const { error } = await supabase.storage.from(bucket).remove([filePath]);
          
          if (error) {
            console.warn(`⚠️ Failed to delete car file ${filePath}:`, error.message);
            storageStats.car_files_failed++;
          } else {
            storageStats.car_files_deleted++;
          }
        } catch (err) {
          console.warn(`⚠️ Error deleting car file ${filePath}:`, err);
          storageStats.car_files_failed++;
        }
      }

      // Delete manual valuation files
      for (const filePath of manualFilePaths) {
        try {
          const { error } = await supabase.storage
            .from('manual-valuation-photos')
            .remove([filePath]);
          
          if (error) {
            console.warn(`⚠️ Failed to delete manual file ${filePath}:`, error.message);
            storageStats.manual_files_failed++;
          } else {
            storageStats.manual_files_deleted++;
          }
        } catch (err) {
          console.warn(`⚠️ Error deleting manual file ${filePath}:`, err);
          storageStats.manual_files_failed++;
        }
      }

      console.log(`🗑️ Storage cleanup: ${storageStats.car_files_deleted} car files, ${storageStats.manual_files_deleted} manual files deleted`);
    }

    // Build final response
    const response = {
      success: true,
      dry_run: dryRun,
      cutoff_date: result.cutoff_date,
      database_cleanup: result.deleted,
      storage_cleanup: dryRun ? {
        car_files_pending: result.file_paths_to_delete?.car_files?.length || 0,
        manual_files_pending: result.file_paths_to_delete?.manual_files?.length || 0,
      } : storageStats,
      executed_at: new Date().toISOString(),
    };

    console.log('🎉 Monthly vehicle cleanup completed successfully!');
    console.log(JSON.stringify(response, null, 2));

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Unexpected error during cleanup:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        phase: 'execution'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
