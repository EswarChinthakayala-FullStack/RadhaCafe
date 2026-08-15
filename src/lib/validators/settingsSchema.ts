import { z } from 'zod';

export const cafeProfileSchema = z.object({
  cafe_name: z.string().trim().min(1, 'Cafe Name is required').max(100, 'Cafe Name must be under 100 characters'),
  tagline: z.string().max(150, 'Tagline must be under 150 characters').nullable().optional(),
  about_text: z.string().max(1000, 'About text must be under 1000 characters').nullable().optional(),
  address: z.string().max(300, 'Address must be under 300 characters').nullable().optional(),
  phone: z.string().max(50, 'Phone number must be under 50 characters').nullable().optional(),
  email: z
    .string()
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: 'Please enter a valid email address',
    })
    .nullable()
    .optional(),
  opening_hours: z.string().max(150, 'Opening hours must be under 150 characters').nullable().optional(),
});

export type CafeProfileFormData = z.infer<typeof cafeProfileSchema>;

export const taxCurrencySchema = z.object({
  tax_percentage: z
    .number({ message: 'Tax percentage must be a number' })
    .min(0, 'Tax percentage cannot be negative')
    .max(100, 'Tax percentage cannot exceed 100%'),
  currency: z.string().min(1, 'Please select a currency'),
});

export type TaxCurrencyFormData = z.infer<typeof taxCurrencySchema>;
