import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TopBid {
  id: string;
  amount: number;
  dealershipName: string;
  createdAt: string;
}

export function useTopBids(carId: string | null | undefined, isActive: boolean) {
  const [topBids, setTopBids] = useState<TopBid[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!carId || !isActive) {
      setTopBids([]);
      return;
    }

    const fetchTopBids = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('bids')
        .select(`
          id,
          amount,
          created_at,
          dealers:dealer_id (
            dealership_name
          )
        `)
        .eq('car_id', carId)
        .order('amount', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(3);

      if (!error && data) {
        const formatted = data.map((bid: any) => ({
          id: bid.id,
          amount: bid.amount,
          dealershipName: bid.dealers?.dealership_name || 'Unknown Dealer',
          createdAt: bid.created_at
        }));
        setTopBids(formatted);
      }
      setIsLoading(false);
    };

    fetchTopBids();

    const channel = supabase
      .channel(`bids-${carId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'bids',
        filter: `car_id=eq.${carId}`
      }, () => {
        fetchTopBids();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [carId, isActive]);

  return { topBids, isLoading };
}
