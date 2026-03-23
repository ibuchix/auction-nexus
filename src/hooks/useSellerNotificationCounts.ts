import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SellerNotificationCountRow {
  seller_id: string;
  type: string;
  send_count: number;
}

export function useSellerNotificationCounts(sellerIds: string[]) {
  return useQuery({
    queryKey: ["seller-email-counts", sellerIds.sort().join(",")],
    enabled: sellerIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        "get_seller_email_notification_counts" as any,
        { p_seller_ids: sellerIds }
      );
      if (error) throw error;
      const map = new Map<string, Record<string, number>>();
      for (const row of (data as SellerNotificationCountRow[]) || []) {
        const current = map.get(row.seller_id) || { seller_listing_reminder: 0 };
        current[row.type] = row.send_count;
        map.set(row.seller_id, current);
      }
      return map;
    },
  });
}
