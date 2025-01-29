import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

type Auction = Database['public']['Tables']['cars']['Row'] & {
  bids: Database['public']['Tables']['bids']['Row'][];
  auction_metrics: Database['public']['Tables']['auction_metrics']['Row'][];
};

export function useAuctionOperations() {
  const pauseAuction = async (auctionId: string) => {
    try {
      const { error } = await supabase
        .from('cars')
        .update({ auction_status: 'paused' })
        .eq('id', auctionId);

      if (error) throw error;
      toast.success("Auction paused successfully");
    } catch (error) {
      toast.error("Failed to pause auction");
      console.error('Error pausing auction:', error);
    }
  };

  const cancelAuction = async (auctionId: string) => {
    try {
      const { error } = await supabase
        .from('cars')
        .update({ auction_status: 'cancelled' })
        .eq('id', auctionId);

      if (error) throw error;
      toast.success("Auction cancelled successfully");
    } catch (error) {
      toast.error("Failed to cancel auction");
      console.error('Error cancelling auction:', error);
    }
  };

  return {
    pauseAuction,
    cancelAuction,
  };
}