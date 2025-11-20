import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface OnlineDealer {
  user_id: string;
  name: string;
  email: string;
  online_at: string;
}

interface PresenceHistory {
  user_id: string;
  name: string;
  email: string;
  joined_at: string;
  left_at?: string;
}

/**
 * Hook for admins to monitor dealer presence in realtime
 * Returns count and list of currently online dealers, plus last hour activity
 */
export function useDealerPresenceMonitor() {
  const [onlineCount, setOnlineCount] = useState(0);
  const [onlineDealers, setOnlineDealers] = useState<OnlineDealer[]>([]);
  const [presenceHistory, setPresenceHistory] = useState<PresenceHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Calculate unique dealers seen in the last hour
  const lastHourCount = useMemo(() => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const uniqueDealers = new Set(
      presenceHistory
        .filter(p => new Date(p.joined_at) >= oneHourAgo)
        .map(p => p.user_id)
    );
    return uniqueDealers.size;
  }, [presenceHistory]);

  useEffect(() => {
    const presenceChannel = supabase.channel('dealer-presence');

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState<OnlineDealer>();
        const dealers = Object.values(state)
          .flat()
          .map((presence: any) => ({
            user_id: presence.user_id,
            name: presence.name,
            email: presence.email,
            online_at: presence.online_at,
          }));
        setOnlineDealers(dealers);
        setOnlineCount(dealers.length);
        setIsLoading(false);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('Dealers joined:', newPresences);
        const now = new Date().toISOString();
        setPresenceHistory(prev => {
          const filtered = prev.filter(p => !newPresences.find((np: any) => np.user_id === p.user_id));
          const newEntries = newPresences.map((p: any) => ({
            user_id: p.user_id,
            name: p.name,
            email: p.email,
            joined_at: now,
          }));
          return [...filtered, ...newEntries];
        });
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('Dealers left:', leftPresences);
        const now = new Date().toISOString();
        setPresenceHistory(prev =>
          prev.map(p => {
            const leaving = leftPresences.find((lp: any) => lp.user_id === p.user_id);
            return leaving ? { ...p, left_at: now } : p;
          })
        );
      })
      .subscribe();

    setChannel(presenceChannel);

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, []);

  // Clean up old history entries (older than 2 hours) every 5 minutes
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      setPresenceHistory(prev =>
        prev.filter(p => new Date(p.joined_at) >= twoHoursAgo)
      );
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(cleanupInterval);
  }, []);

  return {
    onlineCount,
    onlineDealers,
    lastHourCount,
    isLoading,
  };
}
