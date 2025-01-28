import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type Auction = Database['public']['Tables']['cars']['Row'] & {
  bids: Database['public']['Tables']['bids']['Row'][];
  auction_metrics: Database['public']['Tables']['auction_metrics']['Row'][];
};

type CarRow = Database['public']['Tables']['cars']['Row'];
type BidRow = Database['public']['Tables']['bids']['Row'];

type RealtimeCarPayload = RealtimePostgresChangesPayload<CarRow>;
type RealtimeBidPayload = RealtimePostgresChangesPayload<BidRow>;

export function useAuctionMonitoring() {
  const [realTimeAuctions, setRealTimeAuctions] = useState<Auction[]>([]);

  const { data: initialAuctions, isLoading } = useQuery({
    queryKey: ['activeAuctions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cars')
        .select(`
          *,
          bids (
            amount,
            dealer_id,
            created_at,
            status
          ),
          auction_metrics (
            total_bids,
            unique_bidders,
            final_price
          )
        `)
        .eq('is_auction', true)
        .in('auction_status', ['active', 'pending'])
        .order('auction_end_time', { ascending: true });

      if (error) throw error;
      return data as Auction[];
    },
  });

  useEffect(() => {
    if (initialAuctions) {
      setRealTimeAuctions(initialAuctions);
    }
  }, [initialAuctions]);

  useEffect(() => {
    const channel = supabase
      .channel('auction-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cars',
          filter: 'is_auction=eq.true',
        },
        (payload: RealtimeCarPayload) => {
          if (!payload.new || typeof payload.new !== 'object') return;
          const newData = payload.new as CarRow;
          
          setRealTimeAuctions((current) => {
            const updated = [...current];
            const index = updated.findIndex((auction) => auction.id === newData.id);
            
            if (index !== -1) {
              updated[index] = { ...updated[index], ...newData };
            }
            
            return updated;
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bids',
        },
        (payload: RealtimeBidPayload) => {
          if (!payload.new || typeof payload.new !== 'object') return;
          const newBid = payload.new as BidRow;

          setRealTimeAuctions((current) => {
            const updated = [...current];
            const index = updated.findIndex((auction) => auction.id === newBid.car_id);
            
            if (index !== -1) {
              const auction = updated[index];
              updated[index] = {
                ...auction,
                bids: [...(auction.bids || []), newBid],
              };
            }
            
            return updated;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
    auctions: realTimeAuctions,
    isLoading,
    pauseAuction,
    cancelAuction,
  };
}