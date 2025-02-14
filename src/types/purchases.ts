
export type Purchase = {
  id: string;
  dealer_id: string;
  car_id: string;
  amount: number;
  status: string;
  created_at: string;
  purchase_date: string;
  refund_date?: string | null;
  refund_reason?: string | null;
  refunded_by?: string | null;
  notes?: string | null;
  transaction_reference?: string | null;
  updated_at: string;
  dealer: {
    id: string;
    business_name: string;
  } | null;
  car: {
    id: string;
    title: string;
  } | null;
};
