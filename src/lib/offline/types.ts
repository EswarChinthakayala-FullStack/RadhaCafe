import type { PaymentMethod } from '../../types';

export type OfflineSyncStatus = 'pending' | 'syncing' | 'synced' | 'failed';

export type ConnectivityStatus = 'online' | 'checking' | 'offline' | 'recovering';

export interface OfflineOrderItem {
  menu_item_id: string | null;
  item_name: string;
  unit_price: number;
  quantity: number;
  total_price: number;
}

export interface OfflineOrder {
  client_order_id: string; // Idempotency UUID
  offline_reference: string; // e.g. RC-OFF-20260817-A7F2
  customer_id: string | null;
  customer_name: string;
  items: OfflineOrderItem[];
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: 'paid' | 'unpaid' | 'partial';
  status: 'completed' | 'cancelled';
  is_printed: boolean;
  offline_created_at: string; // Device ISO timestamp
  sync_status: OfflineSyncStatus;
  sync_attempts?: number;
  last_sync_error?: string | null;
  synced_at?: string | null;
  canonical_order_id?: string | null;
  canonical_order_number?: string | null;
}

export interface OfflineCatalogItem {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  category_name?: string;
  is_best_seller?: boolean;
  is_today_special?: boolean;
  is_popular?: boolean;
}

export interface OfflineCategory {
  id: string;
  name: string;
  icon: string | null;
  display_order: number;
}

export interface OfflineCafeSettings {
  cafe_name: string;
  tagline?: string | null;
  address?: string | null;
  phone?: string | null;
  tax_percentage: number;
  currency: string;
  last_synced_at: string;
}

export interface OfflineReceiptTemplateConfig {
  id: string;
  name: string;
  template_config: any;
  last_synced_at: string;
}

export interface OfflineCustomer {
  id: string;
  name: string;
  phone: string;
  total_due: number;
  last_synced_at: string;
}

export interface SyncProgressUpdate {
  total: number;
  completed: number;
  currentReference?: string;
  failedCount: number;
}

export interface OfflineReadinessStatus {
  isReady: boolean;
  catalogItemsCount: number;
  categoriesCount: number;
  hasCafeSettings: boolean;
  hasReceiptTemplate: boolean;
  lastSnapshotAt: string | null;
}
