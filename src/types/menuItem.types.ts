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
  display_order?: number;
  category?: Category;
  created_at?: string;
  updated_at?: string;
}

export type CreateMenuItemInput = Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>;
export type UpdateMenuItemInput = Partial<CreateMenuItemInput>;
