
import { useState } from 'react';
import { toast } from 'sonner';
import { edgeFunctionAdminOperations } from '@/utils/edgeFunctionAdminOperations';

export function useRecoveryOperations() {
  const [isRecovering, setIsRecovering] = useState(false);

  const recoverAuction = async (
    auctionId: string, 
    action: 'reset' | 'force_complete' | 'force_start' | 'reset_bids'
  ) => {
    setIsRecovering(true);
    try {
      const result = await edgeFunctionAdminOperations.recoverAuction(auctionId, action);
      
      if (result) {
        toast.success(`Auction recovery successful: ${action}`);
      } else {
        toast.error('Failed to recover auction');
      }
      
      return result;
    } catch (error) {
      console.error('Error recovering auction:', error);
      toast.error(`Recovery error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    } finally {
      setIsRecovering(false);
    }
  };

  const resetSystemState = async () => {
    setIsRecovering(true);
    try {
      const result = await edgeFunctionAdminOperations.resetSystemState();
      
      if (result && result.success) {
        toast.success('System state reset successfully');
      } else {
        toast.error('Failed to reset system state');
      }
      
      return result;
    } catch (error) {
      console.error('Error resetting system state:', error);
      toast.error(`System reset error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    } finally {
      setIsRecovering(false);
    }
  };

  return {
    recoverAuction,
    resetSystemState,
    isRecovering
  };
}
