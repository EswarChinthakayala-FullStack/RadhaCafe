import { z } from 'zod';

export const customerSchema = z.object({
  name: z.string().trim().min(2, 'Customer name must be at least 2 characters.'),
  phone: z
    .string()
    .trim()
    .min(10, 'Phone number must be at least 10 digits.')
    .regex(/^[0-9+--\s()]+$/, 'Please enter a valid phone number.'),
  notes: z.string().trim().optional(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;
