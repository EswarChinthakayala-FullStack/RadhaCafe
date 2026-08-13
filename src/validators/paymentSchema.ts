import { z } from 'zod';

export const paymentSchema = z.object({
  amount: z.number({ message: 'Please enter a valid amount' }).positive('Payment amount must be greater than zero.'),
  payment_method: z.enum(['cash', 'card', 'upi', 'other'], {
    message: 'Please select a valid payment method.',
  }),
  notes: z.string().trim().optional(),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;
