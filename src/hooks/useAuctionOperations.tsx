import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Auction = Database['public']['Tables']['cars']['Row'] & {
  bids: Database['public']['Tables']['bids']['Row'][];
  auction_metrics: Database['public']['Tables']['auction_metrics']['Row'][];
};

export function useAuctionOperations() {
  const pauseAuction = async (auctionId: string) => {
    const { error } = await supabase
      .from('cars')
      .update({ auction_status: 'paused' })
      .eq('id', auctionId);

    if (error) throw error;
  };

  const cancelAuction = async (auctionId: string) => {
    const { error } = await supabase
      .from('cars')
      .update({ auction_status: 'cancelled' })
      .eq('id', auctionId);

    if (error) throw error;
  };

  return {
    pauseAuction,
    cancelAuction,
  };
}