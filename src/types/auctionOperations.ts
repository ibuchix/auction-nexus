
import { Database } from "@/integrations/supabase/types";

// Auction type with related data
export type Auction = Database['public']['Tables']['cars']['Row'] & {
  bids: Database['public']['Tables']['bids']['Row'][];
  auction_metrics: Database['public']['Tables']['auction_metrics']['Row'][];
};

// Interface for the return type of place_bid RPC function
export interface PlaceBidResponse {
  success: boolean;
  error?: string;
  bid_id?: string;
  amount?: number;
}
