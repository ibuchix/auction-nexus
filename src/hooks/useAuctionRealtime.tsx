
import { useState, useEffect } from 'react';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';
import { adminSupabase } from '@/integrations/supabase/adminClient'; // Changed to adminSupabase for admin context
import { Auction, Car, Bid } from '@/types/auction';

type CarRow = Database['public']['Tables']['cars']['Row'];
type BidRow = Database['public']['Tables']['bids']['Row'];

type RealtimeCarPayload = RealtimePostgresChangesPayload<CarRow>;
type RealtimeBidPayload = RealtimePostgresChangesPayload<BidRow>;

export function useAuctionRealtime(initialAuctions: Auction[]) {
  const [realTimeAuctions, setRealTimeAuctions] = useState<Auction[]>(initialAuctions);

  useEffect(() => {
    setRealTimeAuctions(initialAuctions);
  }, [initialAuctions]);

  useEffect(() => {
    const channel = adminSupabase // Changed to adminSupabase
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
      adminSupabase.removeChannel(channel); // Changed to adminSupabase
    };
  }, []);

  return realTimeAuctions;
}
