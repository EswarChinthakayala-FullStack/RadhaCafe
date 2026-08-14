export type CustomerSort =
  | 'highest_due'
  | 'most_orders'
  | 'highest_spent'
  | 'newest'
  | 'oldest'
  | 'name_asc'
  | 'name_desc'
  | 'recent_order';

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
  statusFilter?: 'all' | 'due' | 'paid';
  hasDue?: boolean;
  sortBy?: CustomerSort;
}

export interface CreateCustomerPayload {
  name: string;
  phone: string;
  notes?: string | null;
  credit_limit?: number | null;
}

export interface UpdateCustomerPayload {
  name?: string;
  phone?: string;
  notes?: string | null;
  credit_limit?: number | null;
  is_active?: boolean;
}

export interface CustomerOperationalSummary {
  totalCustomers: number;
  customersWithDue: number;
  totalOutstanding: number;
  collectedToday: number;
}

export interface CustomerLedgerEntry {
  id: string;
  date: string;
  type: 'order' | 'payment';
  reference: string;
  description: string;
  paymentMethod?: string | null;
  debit: number; // Added to Due (order amount)
  credit: number; // Payment Received
  runningBalance: number; // Cumulative balance after this entry
  orderId?: string | null;
  paymentId?: string | null;
}
