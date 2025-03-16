
import { supabase } from "@/integrations/supabase/client";
import { adminSupabase } from "@/integrations/supabase/adminClient";
import { toast } from "sonner";
import { useCallback } from "react";

export function useRecoveryOperations() {
  // Retry a failed auction operation
  const retryFailedOperation = useCallback(async (
    operationId: string, 
    operationType: 'close' | 'proxy' | 'start'
  ): Promise<void> => {
    try {
      toast.loading("Retrying operation...");
      
      let result;
      
      switch (operationType) {
        case 'close':
          result = await adminSupabase.functions.invoke('close-ended-auctions');
          break;
        case 'proxy':
          result = await adminSupabase.rpc('process_pending_proxy_bids');
          break;
        case 'start':
          result = await adminSupabase.functions.invoke('start-scheduled-auctions');
          break;
      }
      
      // Log the retry attempt
      await adminSupabase.from('audit_logs').insert({
        action: 'manual_retry',
        entity_type: 'auction_operation',
        entity_id: operationId,
        details: {
          operation_type: operationType,
          result: result.data
        }
      });
      
      toast.success("Operation retried successfully");
    } catch (error) {
      console.error('Error retrying operation:', error);
      toast.error("Failed to retry operation");
      throw error;
    }
  }, []);

  // Manually recover an auction
  const recoverAuction = useCallback(async (
    auctionId: string, 
    action: 'reset' | 'force_complete' | 'force_start' | 'reset_bids'
  ): Promise<void> => {
    try {
      toast.loading("Recovering auction...");
      
      const { data, error } = await adminSupabase.functions.invoke('recover-auction', {
        body: { 
          auctionId, 
          action 
        }
      });
      
      if (error) throw error;
      
      // Log the recovery action
      await adminSupabase.from('audit_logs').insert({
        action: 'auction_recovery',
        entity_type: 'auction',
        entity_id: auctionId,
        details: {
          recovery_action: action,
          result: data
        }
      });
      
      toast.success("Auction recovered successfully");
    } catch (error) {
      console.error('Error recovering auction:', error);
      toast.error("Failed to recover auction");
      throw error;
    }
  }, []);

  // Reset system state after critical failure
  const resetSystemState = useCallback(async (): Promise<void> => {
    try {
      toast.loading("Resetting system state...");
      
      const { error } = await adminSupabase.functions.invoke('reset-auction-system');
      
      if (error) throw error;
      
      toast.success("System state reset successfully");
    } catch (error) {
      console.error('Error resetting system state:', error);
      toast.error("Failed to reset system state");
      throw error;
    }
  }, []);

  // Generate audit report for specific period
  const generateAuditReport = useCallback(async (
    startDate: Date,
    endDate: Date,
    filterType?: string
  ): Promise<string> => {
    try {
      toast.loading("Generating audit report...");
      
      const { data, error } = await adminSupabase.functions.invoke('generate-audit-report', {
        body: { 
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          filterType
        }
      });
      
      if (error) throw error;
      
      toast.success("Audit report generated");
      return data.reportUrl;
    } catch (error) {
      console.error('Error generating audit report:', error);
      toast.error("Failed to generate audit report");
      throw error;
    }
  }, []);

  return {
    retryFailedOperation,
    recoverAuction,
    resetSystemState,
    generateAuditReport
  };
}
