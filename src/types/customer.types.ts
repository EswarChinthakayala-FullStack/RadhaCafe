export interface Customer {
  id: string;
  name: string;
  phone: string;
  notes?: string | null;
  credit_limit?: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  total_orders?: number;
  total_spent?: number;
  total_paid?: number;
  total_due?: number;
  last_order_at?: string | null;
}

export interface CustomerFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  hasDue?: boolean;
  sortBy?: 'name' | 'created_at' | 'due_amount';
}

export interface CreateCustomerPayload {
  name: string;
  phone: string;
  notes?: string | null;
  credit_limit?: number | null;
}
