
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Fixes auctions that have ended but are still marked as active
 */
export async function fixStuckAuctionStatuses(): Promise<{
  success: boolean;
  updatedCount: number;
  error?: string;
}> {
  try {
    console.log('Fixing stuck auction statuses...');
    
    // Get all auctions that have ended but are still active
    const { data: stuckAuctions, error: fetchError } = await supabase
      .from('cars')
      .select('id, auction_end_time, current_bid, reserve_price')
      .eq('auction_status', 'active')
      .lt('auction_end_time', new Date().toISOString());
    
    if (fetchError) {
      console.error('Error fetching stuck auctions:', fetchError);
      return { success: false, updatedCount: 0, error: fetchError.message };
    }
    
    if (!stuckAuctions || stuckAuctions.length === 0) {
      console.log('No stuck auctions found');
      return { success: true, updatedCount: 0 };
    }
    
    console.log(`Found ${stuckAuctions.length} stuck auctions`);
    
    // Update each stuck auction
    let updatedCount = 0;
    const errors: string[] = [];
    
    for (const auction of stuckAuctions) {
      try {
        // Determine the correct status based on whether reserve was met
        const reservePrice = auction.reserve_price || 0;
        const currentBid = auction.current_bid || 0;
        const newStatus = currentBid >= reservePrice ? 'sold' : 'reserve_not_met';
        
        const { error: updateError } = await supabase
          .from('cars')
          .update({ 
            auction_status: newStatus,
            status: currentBid >= reservePrice ? 'sold' : 'available'
          })
          .eq('id', auction.id);
        
        if (updateError) {
          console.error(`Error updating auction ${auction.id}:`, updateError);
          errors.push(`Auction ${auction.id}: ${updateError.message}`);
        } else {
          console.log(`Updated auction ${auction.id} from active to ${newStatus}`);
          updatedCount++;
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error processing auction ${auction.id}:`, errorMsg);
        errors.push(`Auction ${auction.id}: ${errorMsg}`);
      }
    }
    
    console.log(`Auction status fix completed. Updated ${updatedCount} auctions.`);
    
    if (errors.length > 0) {
      console.warn('Some auctions could not be updated:', errors);
      return {
        success: false,
        updatedCount,
        error: `Updated ${updatedCount} auctions, but ${errors.length} failed`
      };
    }
    
    return { success: true, updatedCount };
    
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Fatal error in fixStuckAuctionStatuses:', errorMsg);
    return { success: false, updatedCount: 0, error: errorMsg };
  }
}

/**
 * Runs the auction status fix and shows toast notifications
 */
export async function runAuctionStatusFix(): Promise<void> {
  toast.info('Fixing auction statuses...', { description: 'Updating ended auctions' });
  
  const result = await fixStuckAuctionStatuses();
  
  if (result.success) {
    if (result.updatedCount > 0) {
      toast.success(`Fixed ${result.updatedCount} auction statuses`, {
        description: 'Ended auctions are now properly marked'
      });
    } else {
      toast.info('No auction statuses needed fixing', {
        description: 'All auctions have correct status'
      });
    }
  } else {
    toast.error('Failed to fix auction statuses', {
      description: result.error || 'Unknown error occurred'
    });
  }
}
