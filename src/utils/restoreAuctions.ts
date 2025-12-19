import { edgeFunctionAdminOperations } from './edgeFunctionAdminOperations';
import { toast } from 'sonner';

/**
 * Restores specific auctions to live status
 * Run this from the browser console or import and call directly
 */
export async function restoreAuctionsToLive() {
  const carIds = [
    '0196e14b-0ad8-42e1-ae5f-00f3d30109e0',  // 2014 Renault Captur (17,210 PLN)
    '6a506467-c7ed-4499-be84-2f84ae416f2f',  // 2020 Volkswagen Passat (44,500 PLN)
    '872fc101-b7f3-469a-a9b4-cf3e299842ae',  // 2022 Citroen C3 (20,700 PLN)
    '3a185e8b-05b3-4ae2-9ce4-36c035e9270e',  // 2023 Hyundai Tucson (82,000 PLN)
    'ba127619-fefc-4be6-950f-853e61ab2089',  // 2019 Mercedes E (52,000 PLN)
    '736f55a1-ed7f-40de-883f-e50b672c87ca',  // 2017 Ford Focus (14,200 PLN)
    'c9026b91-a88a-4eab-9019-50963e4307de',  // 2006 BMW 5-Series (8,823 PLN)
    'd309184f-1db9-4d10-9e95-e425ac0b45d5',  // 2013 Ford Kuga (20,500 PLN)
    'e3c5b922-783b-4c01-9137-47d1f9fc1a0e',  // 2010 KIA Sportage (19,600 PLN)
    '09606a8f-237a-4961-9f85-8ce6a7b0347a',  // 2020 Jeep Wrangler (68,400 PLN)
    '54bb3cd5-83b4-48a9-a62b-06e53dcb5c84',  // 2010 SKODA SUPERB (10,700 PLN)
    'd12cb65d-dc65-4e27-afb7-24fd82d2d636',  // 2019 KIA CEED (40,250 PLN)
    '4347b778-0492-4a6c-8040-a17b00c9052f',  // 2015 AUDI A4 (20,700 PLN)
    'b02e19b8-1ae4-472f-b091-401c644e3cc1',  // 2013 BMW 1-SERIES (20,500 PLN)
    'b414141e-c726-411b-8d0a-c8ca540d0f57'   // 2017 PEUGEOT 208 (18,749 PLN)
  ];
  
  // December 30th, 2024 at 14:00 Polish time (CET = UTC+1)
  const auctionEndTime = '2024-12-30T13:00:00Z';
  
  console.log('Starting bulk auction restore...');
  console.log(`Restoring ${carIds.length} auctions to live status`);
  console.log(`New end time: ${auctionEndTime} (14:00 Polish time)`);
  
  toast.info(`Restoring ${carIds.length} auctions...`);
  
  try {
    const result = await edgeFunctionAdminOperations.bulkRestoreAuctions(carIds, auctionEndTime) as {
      success: boolean;
      carsUpdated: number;
      schedulesUpdated: number;
      cars: any[];
      schedules: any[];
    } | null;
    
    if (result) {
      console.log('Restore completed successfully:', result);
      toast.success(`Successfully restored ${result.carsUpdated} auctions to live status!`);
      return result;
    } else {
      console.error('Restore failed - no result returned');
      toast.error('Failed to restore auctions');
      return null;
    }
  } catch (error) {
    console.error('Restore failed:', error);
    toast.error(`Failed to restore auctions: ${(error as Error).message}`);
    throw error;
  }
}

// Export for console usage
if (typeof window !== 'undefined') {
  (window as any).restoreAuctionsToLive = restoreAuctionsToLive;
}
