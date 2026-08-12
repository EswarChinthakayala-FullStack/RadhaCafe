import { z } from 'zod';

export const menuItemSchema = z.object({
  name: z.string().min(2, 'Item name must be at least 2 characters'),
  description: z.string().nullable().optional(),
  price: z.number({ message: 'Valid numeric price is required' }).min(0, 'Price cannot be negative'),
  category_id: z.string().min(1, 'Please select a category'),
  image_url: z.string().nullable().optional(),
  is_available: z.boolean().default(true),
  display_order: z.number().optional(),
});

export type MenuItemFormData = z.infer<typeof menuItemSchema>;
