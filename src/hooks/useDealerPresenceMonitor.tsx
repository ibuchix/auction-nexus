import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface OnlineDealer {
  user_id: string;
  name: string;
  email: string;
  online_at: string;
}

/**
 * Hook for admins to monitor dealer presence in realtime
 * Returns count and list of currently online dealers
 */
export function useDealerPresenceMonitor() {
  const [onlineCount, setOnlineCount] = useState(0);
  const [onlineDealers, setOnlineDealers] = useState<OnlineDealer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

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
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('Dealers left:', leftPresences);
      })
      .subscribe();

    setChannel(presenceChannel);

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, []);

  return {
    onlineCount,
    onlineDealers,
    isLoading,
  };
}
