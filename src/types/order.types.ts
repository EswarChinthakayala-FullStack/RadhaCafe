import type { MenuItem } from './menuItem.types';

export type OrderStatus = 'pending' | 'preparing' | 'completed' | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'upi' | 'other';

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
  customer_name?: string | null;
  status: OrderStatus;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_method: PaymentMethod;
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
  customer_name?: string | null;
  payment_method: PaymentMethod;
  tax_amount: number;
  discount_amount: number;
  items: {
    menu_item_id: string;
    item_name: string;
    unit_price: number;
    quantity: number;
  }[];
}
