import { z } from 'zod';

export const waterProductSchema = z.object({
  name: z.string().trim().min(2, 'Product name must be at least 2 characters.'),
  water_type: z.enum(['normal', 'cooling', 'other'], { message: 'Please select a valid water type.' }),
  unit_name: z.enum(['can', 'jar', 'bottle', 'other'], { message: 'Please select a valid unit.' }),
  price: z.number({ message: 'Please enter a valid price' }).min(0, 'Price cannot be negative.'),
  description: z.string().trim().optional(),
  is_available: z.boolean(),
});

export type WaterProductFormData = z.infer<typeof waterProductSchema>;

export const waterCustomerSchema = z.object({
  name: z.string().trim().min(2, 'Customer name must be at least 2 characters.'),
  phone: z
    .string()
    .trim()
    .min(10, 'Phone number must be at least 10 digits.')
    .regex(/^[0-9+--\s()]+$/, 'Please enter a valid phone number.'),
  email: z.string().trim().email('Invalid email address.').optional().or(z.literal('')),
  address: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export type WaterCustomerFormData = z.infer<typeof waterCustomerSchema>;

export const waterPaymentSchema = z.object({
  amount: z.number({ message: 'Please enter a valid amount' }).positive('Payment amount must be greater than zero.'),
  payment_method: z.enum(['cash', 'card', 'upi', 'other'], {
    message: 'Please select a valid payment method.',
  }),
  notes: z.string().trim().optional(),
});

export type WaterPaymentFormData = z.infer<typeof waterPaymentSchema>;

export const waterEventInquirySchema = z.object({
  customer_name: z.string().trim().min(2, 'Your name must be at least 2 characters.'),
  phone: z
    .string()
    .trim()
    .min(10, 'Phone number must be at least 10 digits.')
    .regex(/^[0-9+--\s()]+$/, 'Please enter a valid phone number.'),
  event_type: z.string().trim().min(2, 'Please specify the event type (e.g. Wedding, Function, Party).'),
  event_date: z.string().trim().min(1, 'Please select the event date.'),
  estimated_quantity: z.number({ message: 'Please enter estimated cans quantity' }).positive('Quantity must be greater than zero.'),
  location: z.string().trim().min(3, 'Please enter the event delivery location.'),
  notes: z.string().trim().optional(),
});

export type WaterEventInquiryFormData = z.infer<typeof waterEventInquirySchema>;
