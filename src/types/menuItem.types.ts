export interface Category {
  id: string;
  name: string;
  slug?: string;
  icon?: string | null;
  display_order: number;
  created_at?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category_id: string;
  image_url: string | null;
  is_available: boolean;
  daily_special_date?: string | null;
  tags?: string[];
  display_order?: number;
  category?: Category;
  created_at?: string;
  updated_at?: string;
  // Computed dynamic properties for ordering presentation
  is_today_special?: boolean;
  is_best_seller?: boolean;
  best_seller_score?: number;
}

export interface BestSellerItemStat {
  menu_item_id: string;
  item_name: string;
  total_quantity: number;
  order_count: number;
  total_revenue: number;
  recent_quantity: number;
  best_seller_score: number;
}

export type CreateMenuItemInput = Omit<
  MenuItem,
  'id' | 'created_at' | 'updated_at' | 'is_today_special' | 'is_best_seller' | 'best_seller_score'
>;
export type UpdateMenuItemInput = Partial<CreateMenuItemInput>;
