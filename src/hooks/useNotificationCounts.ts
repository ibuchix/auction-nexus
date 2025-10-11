import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type NotificationType =
  | "seller_auction_ended"
  | "dealer_bid_accepted"
  | "dealer_bid_declined"
  | "seller_ready_for_pickup";

export interface NotificationCountRow {
  car_id: string;
  type: NotificationType;
  send_count: number;
}

export function useNotificationCounts(carIds: string[]) {
  return useQuery({
    queryKey: ["email-counts", carIds.sort().join(",")],
    enabled: carIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase.rpc<NotificationCountRow[]>(
        "get_email_notification_counts",
        { p_car_ids: carIds }
      );
      if (error) throw error;
      const map = new Map<string, Record<NotificationType, number>>();
      for (const row of data || []) {
        const current = map.get(row.car_id) || {
          seller_auction_ended: 0,
          dealer_bid_accepted: 0,
          dealer_bid_declined: 0,
          seller_ready_for_pickup: 0,
        };
        current[row.type] = row.send_count;
        map.set(row.car_id, current);
      }
      return map;
    },
  });
}
