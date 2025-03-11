export interface Dispute {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  type: 'payment' | 'vehicle_condition' | 'listing_accuracy' | 'auction_process' | 'other';
  submitted_by: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  assigned_to?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  car_id?: {
    id: string;
    title: string | null;
    make: string | null;
    model: string | null;
    year: number | null;
    images: string[] | null;
  } | null;
  attachments: any[] | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  resolution: string | null;
}

export interface DisputeComment {
  id: string;
  content: string;
  author_id: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  dispute_id: string;
  attachments: any[] | null;
  created_at: string;
  updated_at: string;
}
