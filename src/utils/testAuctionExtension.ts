import { supabase } from "@/integrations/supabase/client";

/**
 * Testing utilities for auction extension functionality
 * Use these functions to verify data consistency after extending auctions
 */

export interface AuctionExtensionTestResult {
  success: boolean;
  message: string;
  details?: any;
}

/**
 * Test 1: Verify both tables are updated consistently
 */
export async function testDataConsistency(carId: string): Promise<AuctionExtensionTestResult> {
  try {
    // Get car data
    const { data: car, error: carError } = await supabase
      .from('cars')
      .select('id, auction_end_time, is_manually_controlled, updated_at')
      .eq('id', carId)
      .single();

    if (carError) throw carError;

    // Get auction schedule data
    const { data: schedule, error: scheduleError } = await supabase
      .from('auction_schedules')
      .select('id, end_time, is_manually_controlled, updated_at, notes')
      .eq('car_id', carId)
      .eq('status', 'running')
      .single();

    if (scheduleError) throw scheduleError;

    // Check if end times match
    const carEndTime = new Date(car.auction_end_time!).getTime();
    const scheduleEndTime = new Date(schedule.end_time).getTime();
    const timeDiff = Math.abs(carEndTime - scheduleEndTime);

    // Check if manually controlled flags match
    const manualControlMatch = car.is_manually_controlled === schedule.is_manually_controlled;

    if (timeDiff > 1000) { // Allow 1 second difference for precision
      return {
        success: false,
        message: "End times do not match between cars and auction_schedules tables",
        details: {
          carEndTime: car.auction_end_time,
          scheduleEndTime: schedule.end_time,
          differenceMs: timeDiff
        }
      };
    }

    if (!manualControlMatch) {
      return {
        success: false,
        message: "is_manually_controlled flags do not match",
        details: {
          carFlag: car.is_manually_controlled,
          scheduleFlag: schedule.is_manually_controlled
        }
      };
    }

    return {
      success: true,
      message: "Data consistency verified: both tables match",
      details: {
        carEndTime: car.auction_end_time,
        scheduleEndTime: schedule.end_time,
        bothManuallyControlled: car.is_manually_controlled,
        scheduleNotes: schedule.notes
      }
    };
  } catch (error) {
    return {
      success: false,
      message: "Error checking data consistency",
      details: error
    };
  }
}

/**
 * Test 2: Verify audit log was created
 */
export async function testAuditLogCreated(carId: string): Promise<AuctionExtensionTestResult> {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('entity_type', 'auction')
      .eq('entity_id', carId)
      .eq('action', 'extend_auction' as any)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      return {
        success: false,
        message: "No audit log found for this extension",
        details: error
      };
    }

    const details = data.details as any;
    
    return {
      success: true,
      message: "Audit log verified",
      details: {
        logId: data.id,
        oldEndTime: details.old_end_time,
        newEndTime: details.new_end_time,
        hoursAdded: details.hours_added,
        reason: details.reason,
        extendedBy: data.user_id,
        createdAt: data.created_at
      }
    };
  } catch (error) {
    return {
      success: false,
      message: "Error checking audit log",
      details: error
    };
  }
}

/**
 * Test 3: Verify extension notes were added to schedule
 */
export async function testScheduleNotesUpdated(carId: string): Promise<AuctionExtensionTestResult> {
  try {
    const { data, error } = await supabase
      .from('auction_schedules')
      .select('notes, updated_at')
      .eq('car_id', carId)
      .eq('status', 'running')
      .single();

    if (error) throw error;

    if (!data.notes || !data.notes.includes('Extended at')) {
      return {
        success: false,
        message: "Extension notes not found in auction_schedules",
        details: { notes: data.notes }
      };
    }

    return {
      success: true,
      message: "Schedule notes verified",
      details: {
        notes: data.notes,
        lastUpdated: data.updated_at
      }
    };
  } catch (error) {
    return {
      success: false,
      message: "Error checking schedule notes",
      details: error
    };
  }
}

/**
 * Test 4: Run all tests for a specific auction
 */
export async function runFullTestSuite(carId: string): Promise<{
  allPassed: boolean;
  results: Record<string, AuctionExtensionTestResult>;
}> {
  const results = {
    dataConsistency: await testDataConsistency(carId),
    auditLog: await testAuditLogCreated(carId),
    scheduleNotes: await testScheduleNotesUpdated(carId)
  };

  const allPassed = Object.values(results).every(result => result.success);

  return { allPassed, results };
}

/**
 * Get a summary of recent extensions
 */
export async function getRecentExtensions(limit: number = 10) {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        id,
        created_at,
        user_id,
        entity_id,
        details
      `)
      .eq('action', 'extend_auction' as any)
      .eq('entity_type', 'auction')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return {
      success: true,
      data: data.map(log => ({
        carId: log.entity_id,
        extendedAt: log.created_at,
        extendedBy: log.user_id,
        details: log.details as any
      }))
    };
  } catch (error) {
    return {
      success: false,
      error
    };
  }
}
