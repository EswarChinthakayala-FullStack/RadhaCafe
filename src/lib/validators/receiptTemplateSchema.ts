import { z } from 'zod';

export const receiptTemplateSchema = z.object({
  name: z.string().min(2, 'Template name must be at least 2 characters'),
  description: z.string().nullable().optional(),
  is_active: z.boolean().default(false),
  paper_width: z.number().refine((val) => [32, 42, 48].includes(val), {
    message: 'Paper width must be 32, 42, or 48 columns',
  }),
  template_config: z.object({
    paperWidth: z.number(),
    dividerStyle: z.enum(['solid', 'double', 'dashed', 'dotted', 'none']),
    previewFont: z.enum(['JetBrains Mono', 'Consolas', 'Inter', 'System Mono']),
    feedLines: z.number().min(1).max(10),
    header: z.object({
      logoVisible: z.boolean(),
      cafeNameVisible: z.boolean(),
      cafeNameText: z.string(),
      taglineVisible: z.boolean(),
      taglineText: z.string(),
      addressVisible: z.boolean(),
      addressText: z.string(),
      phoneVisible: z.boolean(),
      phoneText: z.string(),
      emailVisible: z.boolean(),
      emailText: z.string(),
      alignment: z.enum(['left', 'center', 'right']),
      emphasis: z.enum(['normal', 'bold', 'double_size']),
    }),
    orderInfo: z.object({
      orderNumberVisible: z.boolean(),
      dateVisible: z.boolean(),
      timeVisible: z.boolean(),
      cashierVisible: z.boolean(),
      statusVisible: z.boolean(),
      alignment: z.enum(['left', 'center', 'right']),
      emphasis: z.enum(['normal', 'bold', 'double_size']),
    }),
    customerInfo: z.object({
      customerNameVisible: z.boolean(),
      phoneVisible: z.boolean(),
      paymentStatusVisible: z.boolean(),
      alignment: z.enum(['left', 'center', 'right']),
    }),
    items: z.object({
      showHeaders: z.boolean(),
      showUnitPrice: z.boolean(),
      itemWrapping: z.boolean(),
      dividerBefore: z.boolean(),
      dividerAfter: z.boolean(),
    }),
    summary: z.object({
      subtotalVisible: z.boolean(),
      taxVisible: z.boolean(),
      discountVisible: z.boolean(),
      grandTotalBold: z.boolean(),
      doubleSizeTotal: z.boolean(),
      dividerBeforeTotal: z.boolean(),
    }),
    payment: z.object({
      paymentMethodVisible: z.boolean(),
      amountPaidVisible: z.boolean(),
      amountDueVisible: z.boolean(),
      payLaterIndicator: z.boolean(),
    }),
    footer: z.object({
      thankYouMessage: z.string(),
      secondaryMessage: z.string(),
      contactMessage: z.string(),
      alignment: z.enum(['left', 'center', 'right']),
      emphasis: z.enum(['normal', 'bold', 'double_size']),
    }),
    sectionOrder: z.array(z.string()),
  }),
});

export type ReceiptTemplateFormData = z.infer<typeof receiptTemplateSchema>;
