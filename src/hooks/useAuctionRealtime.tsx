
import { useState, useEffect } from 'react';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client'; // Changed to standard supabase client
import { Auction, Car, Bid } from '@/types/auction';

type CarRow = Database['public']['Tables']['cars']['Row'];
type BidRow = Database['public']['Tables']['bids']['Row'];

type RealtimeCarPayload = RealtimePostgresChangesPayload<CarRow>;
type RealtimeBidPayload = RealtimePostgresChangesPayload<BidRow>;

export function useAuctionRealtime(initialAuctions: Auction[]) {
  const [realTimeAuctions, setRealTimeAuctions] = useState<Auction[]>(() => 
    Array.isArray(initialAuctions) ? initialAuctions : []
  );

  // Sync state when initialAuctions changes (when query resolves)
  useEffect(() => {
    if (Array.isArray(initialAuctions)) {
      setRealTimeAuctions(initialAuctions);
    }
  }, [initialAuctions]);

  useEffect(() => {
    console.log('🔌 [Real-Time] Subscribing to auction updates...');
    
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
          if (!payload.new || typeof payload.new !== 'object' || Object.keys(payload.new).length === 0) return;
          const newData = payload.new as CarRow;
          
          console.log('🚗 [Real-Time] Cars table update received:', {
            event: payload.eventType,
            carId: newData.id,
            currentBid: newData.current_bid,
            status: newData.auction_status,
            timestamp: new Date().toISOString()
          });
          
          setRealTimeAuctions((current) => {
            if (!Array.isArray(current)) return [];
            const updated = [...current];
            const index = updated.findIndex((auction) => auction.id === newData.id);
            
            if (index !== -1) {
              const oldBid = updated[index].current_bid;
              updated[index] = { ...updated[index], ...newData };
              
              console.log('✅ [Real-Time] Auction updated:', {
                carId: newData.id,
                oldBid,
                newBid: newData.current_bid,
                bidChanged: oldBid !== newData.current_bid
              });
            } else {
              console.log('⚠️ [Real-Time] Auction not found in local state:', newData.id);
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
          if (!payload.new || typeof payload.new !== 'object' || Object.keys(payload.new).length === 0) return;
          const newBid = payload.new as BidRow;
          
          console.log('💰 [Real-Time] New bid inserted:', {
            bidId: newBid.id,
            carId: newBid.car_id,
            amount: newBid.amount,
            dealerId: newBid.dealer_id,
            timestamp: new Date().toISOString()
          });

          setRealTimeAuctions((current) => {
            if (!Array.isArray(current)) return [];
            const updated = [...current];
            const index = updated.findIndex((auction) => auction.id === newBid.car_id);
            
            if (index !== -1) {
              const auction = updated[index];
              updated[index] = {
                ...auction,
                bids: [...(auction.bids || []), newBid],
                // Note: We do NOT manually update current_bid here
                // The database updates it via place_bid function,
                // and we'll get it through the cars table update event
              };
              
              console.log('✅ [Real-Time] Bid added to auction:', {
                carId: newBid.car_id,
                bidCount: updated[index].bids?.length || 0,
                note: 'current_bid will update via cars table event'
              });
            } else {
              console.log('⚠️ [Real-Time] Bid for unknown auction:', newBid.car_id);
            }
            
            return updated;
          });
        }
      )
      .subscribe((status) => {
        console.log('📡 [Real-Time] Subscription status:', status);
      });

    return () => {
      console.log('🔌 [Real-Time] Unsubscribing from auction updates');
      supabase.removeChannel(channel);
    };
  }, []);

  return realTimeAuctions;
}
