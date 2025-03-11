
import { Database } from "@/integrations/supabase/types";

export type Car = Database['public']['Tables']['cars']['Row'];
export type Bid = Database['public']['Tables']['bids']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type AuctionMetrics = Database['public']['Tables']['auction_metrics']['Row'];
export type AuctionResult = Database['public']['Tables']['auction_results']['Row'];

export type Auction = Car & {
  bids: Bid[];
  seller: Profile;
  auction_metrics?: AuctionMetrics[];
  auction_status?: string;
};

export type AuctionStatus = "active" | "ended" | "paused" | "cancelled" | "sold" | "ready";

export type DailyAuctionSummary = {
  date: string;
  total_auctions_closed: number;
  sold_vehicles: number;
  unsold_vehicles: number;
  total_value: number;
  average_sale_price: number;
};

export type AuctionClosure = {
  car_id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  auction_end_time: string;
  sale_status: 'sold' | 'unsold';
  final_price: number;
  total_bids: number;
  unique_bidders: number;
};
