import { z } from 'zod';

export const orderItemSchema = z.object({
  menu_item_id: z.string().min(1),
  item_name: z.string().min(1),
  unit_price: z.number().positive(),
  quantity: z.number().int().positive(),
  subtotal: z.number().nonnegative(),
});

export const orderSchema = z.object({
  payment_method: z.enum(['cash', 'card', 'upi']),
  payment_status: z.enum(['pending', 'paid', 'failed']).default('paid'),
  subtotal: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  discount: z.number().nonnegative(),
  total: z.number().positive(),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).min(1, 'Order must contain at least one item'),
});

export type OrderFormData = z.infer<typeof orderSchema>;
