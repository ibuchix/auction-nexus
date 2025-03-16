
import { adminSupabase } from "@/integrations/supabase/adminClient";
import { toast } from "sonner";

export function useRecoveryOperations() {
  const recoverAuction = async (auctionId: string, action: 'reset' | 'force_complete' | 'force_start' | 'reset_bids') => {
    try {
      // Call Supabase Edge Function
      const { data, error } = await adminSupabase.functions.invoke('recover-auction', {
        body: { auctionId, action }
      });
      
      if (error) throw error;
      
      if (!data?.success) {
        throw new Error(data?.message || 'Recovery operation failed');
      }
      
      return data;
    } catch (error) {
      console.error('Error in recoverAuction:', error);
      toast.error('Failed to recover auction: ' + (error as Error).message);
      throw error;
    }
  };
  
  const resetSystemState = async () => {
    try {
      // Call Supabase Edge Function
      const { data, error } = await adminSupabase.functions.invoke('reset-auction-system', {
        body: {}
      });
      
      if (error) throw error;
      
      if (!data?.success) {
        throw new Error(data?.message || 'System reset failed');
      }
      
      return data;
    } catch (error) {
      console.error('Error in resetSystemState:', error);
      toast.error('Failed to reset auction system: ' + (error as Error).message);
      throw error;
    }
  };

  return {
    recoverAuction,
    resetSystemState
  };
}
