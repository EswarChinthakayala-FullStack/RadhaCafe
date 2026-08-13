export interface Payment {
  id: string;
  order_id: string;
  customer_id?: string | null;
  amount: number;
  payment_method: 'cash' | 'card' | 'upi' | 'other';
  notes?: string | null;
  created_at: string;
  order_number?: string;
  customer_name?: string;
}

export interface RecordPaymentPayload {
  customer_id: string;
  amount: number;
  payment_method: 'cash' | 'card' | 'upi' | 'other';
  notes?: string | null;
  order_id?: string | null;
}
