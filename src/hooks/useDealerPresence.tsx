import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Hook that automatically tracks dealer presence in realtime
 * Only activates for users with role='dealer'
 * Zero database impact - uses Supabase Realtime Presence
 */
export function useDealerPresence() {
  const { user } = useAuth();
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    if (!user) {
      // Clean up if user logs out
      if (channel) {
        channel.unsubscribe();
        setChannel(null);
        setIsTracking(false);
      }
      return;
    }

    // Check if user is a dealer
    const checkAndTrackPresence = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', user.id)
          .single();

        if (!profile || profile.role !== 'dealer') {
          return;
        }

        // User is a dealer - join presence channel
        const presenceChannel = supabase.channel('dealer-presence');

        presenceChannel.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await presenceChannel.track({
              user_id: user.id,
              name: profile.full_name || 'Unknown Dealer',
              email: user.email || '',
              online_at: new Date().toISOString(),
            });
            setIsTracking(true);
          }
        });

        setChannel(presenceChannel);
      } catch (error) {
        console.error('Error tracking dealer presence:', error);
      }
    };

    checkAndTrackPresence();

    // Cleanup on unmount
    return () => {
      if (channel) {
        channel.unsubscribe();
        setIsTracking(false);
      }
    };
  }, [user?.id]);

  return { isTracking };
}
