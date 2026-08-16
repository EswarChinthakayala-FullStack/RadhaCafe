import type { MenuItem } from './menuItem.types';

export type OrderStatus = 'pending' | 'preparing' | 'completed' | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'upi' | 'other' | 'pay_later';
export type PaymentStatus = 'paid' | 'partial' | 'unpaid';
export type OrderSort = 'newest' | 'oldest' | 'highest' | 'lowest' | 'largest_due';

export interface OrderOperationalSummary {
  ordersToday: number;
  completedOrders: number;
  outstandingOrders: number;
  totalSales: number;
}

export interface OrderListFilters {
  search?: string;
  status?: OrderStatus | 'all';
  paymentMethod?: PaymentMethod | 'all';
  paymentStatus?: PaymentStatus | 'all' | 'outstanding';
  datePreset?: 'all' | 'today' | 'yesterday' | 'week' | 'month' | 'custom';
  startDate?: string;
  endDate?: string;
  customDate?: string;
  sort?: OrderSort;
  page?: number;
  limit?: number;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  menu_item_id?: string | null;
  item_name: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  menu_item?: MenuItem;
}

export interface Order {
  id: string;
  order_number: string;
  client_order_id?: string | null;
  created_offline?: boolean;
  offline_reference?: string | null;
  offline_created_at?: string | null;
  synced_at?: string | null;
  customer_id?: string | null;
  customer_name?: string | null;
  status: OrderStatus;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status?: PaymentStatus;
  paid_amount?: number;
  due_amount?: number;
  paid_at?: string | null;
  is_printed: boolean;
  created_at: string;
  completed_at?: string | null;
  items: OrderItem[];
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export interface CreateOrderPayload {
  customer_id?: string | null;
  customer_name?: string | null;
  payment_method: PaymentMethod;
  tax_amount: number;
  discount_amount: number;
  client_order_id?: string | null;
  items: {
    menu_item_id: string;
    item_name: string;
    unit_price: number;
    quantity: number;
  }[];
}
