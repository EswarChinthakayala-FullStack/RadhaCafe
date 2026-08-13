export type WaterType = 'normal' | 'cooling' | 'other';
export type WaterUnit = 'can' | 'jar' | 'bottle' | 'other';

export interface WaterProduct {
  id: string;
  name: string;
  description?: string | null;
  water_type: WaterType;
  unit_name: WaterUnit;
  price: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface WaterCustomer {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  total_orders?: number;
  total_spent?: number;
  total_paid?: number;
  total_due?: number;
  last_order_at?: string | null;
}

export type WaterOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled';

export type WaterPaymentStatus = 'paid' | 'partial' | 'pending';
export type WaterPaymentMethod = 'cash' | 'card' | 'upi' | 'other' | 'pay_later';

export interface WaterOrderItem {
  id?: string;
  water_order_id?: string;
  water_product_id?: string | null;
  item_name: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  water_product?: WaterProduct;
}

export interface WaterOrder {
  id: string;
  order_number: string;
  customer_id?: string | null;
  customer_name: string;
  order_status: WaterOrderStatus;
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  amount_paid: number;
  amount_due: number;
  payment_status: WaterPaymentStatus;
  payment_method: WaterPaymentMethod;
  order_source: 'pos' | 'public_request' | 'admin';
  notes?: string | null;
  is_printed: boolean;
  created_at: string;
  completed_at?: string | null;
  items: WaterOrderItem[];
}

export interface WaterPayment {
  id: string;
  water_order_id: string;
  water_customer_id?: string | null;
  amount: number;
  payment_method: 'cash' | 'card' | 'upi' | 'other';
  notes?: string | null;
  created_at: string;
  order_number?: string;
  customer_name?: string;
}

export type WaterEventStatus = 'new' | 'contacted' | 'confirmed' | 'completed' | 'cancelled';

export interface WaterEventRequest {
  id: string;
  customer_id?: string | null;
  customer_name: string;
  phone: string;
  event_type: string;
  event_date: string;
  estimated_quantity: number;
  location: string;
  notes?: string | null;
  status: WaterEventStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateWaterProductPayload {
  name: string;
  description?: string | null;
  water_type: WaterType;
  unit_name: WaterUnit;
  price: number;
  is_available?: boolean;
}

export interface CreateWaterCustomerPayload {
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
}

export interface CreateWaterOrderPayload {
  customer_id?: string | null;
  customer_name?: string | null;
  payment_method: WaterPaymentMethod;
  discount_amount: number;
  order_source?: 'pos' | 'public_request' | 'admin';
  notes?: string | null;
  items: {
    water_product_id: string;
    item_name: string;
    unit_price: number;
    quantity: number;
  }[];
}

export interface RecordWaterPaymentPayload {
  customer_id: string;
  water_order_id?: string | null;
  amount: number;
  payment_method: 'cash' | 'card' | 'upi' | 'other';
  notes?: string | null;
}

export interface CreateWaterEventPayload {
  customer_name: string;
  phone: string;
  event_type: string;
  event_date: string;
  estimated_quantity: number;
  location: string;
  notes?: string | null;
}

export interface WaterCartItem {
  product: WaterProduct;
  quantity: number;
}
