import type { ReceiptTemplateConfig, ReceiptTemplate, Order } from '../../types';

/**
 * 1. CLASSIC PRESET
 * Traditional, time-tested thermal receipt design with centered branding and dashed dividers.
 */
export const CLASSIC_PRESET_CONFIG: ReceiptTemplateConfig = {
  paperWidth: 32,
  dividerStyle: 'dashed',
  previewFont: 'JetBrains Mono',
  feedLines: 3,
  header: {
    logoVisible: true,
    cafeNameVisible: true,
    cafeNameText: 'RadhaCafe',
    taglineVisible: true,
    taglineText: 'Fresh Sips & Bites',
    addressVisible: true,
    addressText: 'Near Bus Stand, Main Road',
    phoneVisible: true,
    phoneText: '+91 98765 43210',
    emailVisible: false,
    emailText: '',
    alignment: 'center',
    emphasis: 'bold',
  },
  orderInfo: {
    orderNumberVisible: true,
    dateVisible: true,
    timeVisible: true,
    cashierVisible: false,
    statusVisible: true,
    alignment: 'left',
    emphasis: 'normal',
  },
  customerInfo: {
    customerNameVisible: true,
    phoneVisible: true,
    paymentStatusVisible: true,
    alignment: 'left',
  },
  items: {
    showHeaders: true,
    showUnitPrice: false,
    itemWrapping: true,
    dividerBefore: true,
    dividerAfter: true,
  },
  summary: {
    subtotalVisible: true,
    taxVisible: false,
    discountVisible: true,
    grandTotalBold: true,
    doubleSizeTotal: false,
    dividerBeforeTotal: true,
  },
  payment: {
    paymentMethodVisible: true,
    amountPaidVisible: true,
    amountDueVisible: true,
    payLaterIndicator: true,
  },
  footer: {
    thankYouMessage: 'Thank you for visiting RadhaCafe!',
    secondaryMessage: 'Please visit us again.',
    contactMessage: 'For bulk & party orders: 9876543210',
    alignment: 'center',
    emphasis: 'normal',
  },
  sectionOrder: ['header', 'orderInfo', 'customerInfo', 'items', 'summary', 'payment', 'footer'],
};

/**
 * 2. MODERN PRESET
 * Contemporary cafe aesthetic with prominent typography hierarchy, clean section separation, and double-line accents.
 */
export const MODERN_PRESET_CONFIG: ReceiptTemplateConfig = {
  paperWidth: 32,
  dividerStyle: 'double',
  previewFont: 'JetBrains Mono',
  feedLines: 3,
  header: {
    logoVisible: true,
    cafeNameVisible: true,
    cafeNameText: 'RADHACAFE',
    taglineVisible: true,
    taglineText: 'Artisan Coffee & Snacks',
    addressVisible: true,
    addressText: 'Main Road, Opp. Municipal Complex',
    phoneVisible: true,
    phoneText: '+91 98765 43210',
    emailVisible: false,
    emailText: 'orders@radhacafe.com',
    alignment: 'center',
    emphasis: 'double_size',
  },
  orderInfo: {
    orderNumberVisible: true,
    dateVisible: true,
    timeVisible: true,
    cashierVisible: true,
    statusVisible: true,
    alignment: 'left',
    emphasis: 'normal',
  },
  customerInfo: {
    customerNameVisible: true,
    phoneVisible: true,
    paymentStatusVisible: true,
    alignment: 'left',
  },
  items: {
    showHeaders: true,
    showUnitPrice: true,
    itemWrapping: true,
    dividerBefore: true,
    dividerAfter: true,
  },
  summary: {
    subtotalVisible: true,
    taxVisible: true,
    discountVisible: true,
    grandTotalBold: true,
    doubleSizeTotal: true,
    dividerBeforeTotal: true,
  },
  payment: {
    paymentMethodVisible: true,
    amountPaidVisible: true,
    amountDueVisible: true,
    payLaterIndicator: true,
  },
  footer: {
    thankYouMessage: 'HAVE A WONDERFUL DAY!',
    secondaryMessage: 'Share your feedback with us.',
    contactMessage: 'Follow us @radhacafe',
    alignment: 'center',
    emphasis: 'bold',
  },
  sectionOrder: ['header', 'orderInfo', 'customerInfo', 'items', 'summary', 'payment', 'footer'],
};

/**
 * 3. COMPACT PRESET
 * Paper-efficient density designed for fast checkout counters, minimizing thermal roll waste.
 */
export const COMPACT_PRESET_CONFIG: ReceiptTemplateConfig = {
  paperWidth: 32,
  dividerStyle: 'solid',
  previewFont: 'JetBrains Mono',
  feedLines: 2,
  header: {
    logoVisible: false,
    cafeNameVisible: true,
    cafeNameText: 'RadhaCafe',
    taglineVisible: false,
    taglineText: '',
    addressVisible: false,
    addressText: '',
    phoneVisible: true,
    phoneText: 'Ph: 9876543210',
    emailVisible: false,
    emailText: '',
    alignment: 'center',
    emphasis: 'bold',
  },
  orderInfo: {
    orderNumberVisible: true,
    dateVisible: true,
    timeVisible: true,
    cashierVisible: false,
    statusVisible: false,
    alignment: 'left',
    emphasis: 'normal',
  },
  customerInfo: {
    customerNameVisible: true,
    phoneVisible: false,
    paymentStatusVisible: true,
    alignment: 'left',
  },
  items: {
    showHeaders: false,
    showUnitPrice: false,
    itemWrapping: false,
    dividerBefore: true,
    dividerAfter: true,
  },
  summary: {
    subtotalVisible: false,
    taxVisible: false,
    discountVisible: true,
    grandTotalBold: true,
    doubleSizeTotal: false,
    dividerBeforeTotal: false,
  },
  payment: {
    paymentMethodVisible: true,
    amountPaidVisible: true,
    amountDueVisible: true,
    payLaterIndicator: true,
  },
  footer: {
    thankYouMessage: 'Thank You! Visit Again.',
    secondaryMessage: '',
    contactMessage: '',
    alignment: 'center',
    emphasis: 'normal',
  },
  sectionOrder: ['header', 'orderInfo', 'customerInfo', 'items', 'summary', 'payment', 'footer'],
};

/**
 * 4. DETAILED PRESET
 * Comprehensive receipt layout with full customer profile, cashier tag, unit pricing breakdown, and credit ledger.
 */
export const DETAILED_PRESET_CONFIG: ReceiptTemplateConfig = {
  paperWidth: 48,
  dividerStyle: 'dashed',
  previewFont: 'JetBrains Mono',
  feedLines: 3,
  header: {
    logoVisible: true,
    cafeNameVisible: true,
    cafeNameText: 'RadhaCafe & Water Works',
    taglineVisible: true,
    taglineText: 'Speciality Tea, Coffee, Snacks & Pure Water',
    addressVisible: true,
    addressText: 'Shop #4-12, Main Road, Municipal Market',
    phoneVisible: true,
    phoneText: 'Tel: +91 98765 43210 / 94400 12345',
    emailVisible: true,
    emailText: 'support@radhacafe.com',
    alignment: 'center',
    emphasis: 'bold',
  },
  orderInfo: {
    orderNumberVisible: true,
    dateVisible: true,
    timeVisible: true,
    cashierVisible: true,
    statusVisible: true,
    alignment: 'left',
    emphasis: 'normal',
  },
  customerInfo: {
    customerNameVisible: true,
    phoneVisible: true,
    paymentStatusVisible: true,
    alignment: 'left',
  },
  items: {
    showHeaders: true,
    showUnitPrice: true,
    itemWrapping: true,
    dividerBefore: true,
    dividerAfter: true,
  },
  summary: {
    subtotalVisible: true,
    taxVisible: true,
    discountVisible: true,
    grandTotalBold: true,
    doubleSizeTotal: true,
    dividerBeforeTotal: true,
  },
  payment: {
    paymentMethodVisible: true,
    amountPaidVisible: true,
    amountDueVisible: true,
    payLaterIndicator: true,
  },
  footer: {
    thankYouMessage: 'Thank you for choosing RadhaCafe!',
    secondaryMessage: 'GST No: 37AAAAA0000A1Z5 | FSSAI: 12345678901234',
    contactMessage: 'For Catering & 20L Water Bulk Orders: 9876543210',
    alignment: 'center',
    emphasis: 'normal',
  },
  sectionOrder: ['header', 'orderInfo', 'customerInfo', 'items', 'summary', 'payment', 'footer'],
};

/**
 * Built-In Presets List
 */
export interface PresetTemplateItem {
  id: string;
  presetKey: 'classic' | 'modern' | 'compact' | 'detailed';
  name: string;
  tagline: string;
  description: string;
  defaultWidth: number;
  recommendedWidthLabel: string;
  config: ReceiptTemplateConfig;
}

export const BUILT_IN_PRESETS: PresetTemplateItem[] = [
  {
    id: 'preset-classic',
    presetKey: 'classic',
    name: 'Classic Receipt',
    tagline: 'Standard Thermal Layout',
    description: 'Traditional centered cafe branding, clean dashed separators, and straightforward totals.',
    defaultWidth: 32,
    recommendedWidthLabel: '58mm / 80mm',
    config: CLASSIC_PRESET_CONFIG,
  },
  {
    id: 'preset-modern',
    presetKey: 'modern',
    name: 'Modern Cafe',
    tagline: 'Premium Typography & Accents',
    description: 'Contemporary header emphasis, double-line dividers, item unit pricing, and bold totals.',
    defaultWidth: 32,
    recommendedWidthLabel: '58mm / 80mm',
    config: MODERN_PRESET_CONFIG,
  },
  {
    id: 'preset-compact',
    presetKey: 'compact',
    name: 'Compact Eco',
    tagline: 'Paper-Saving Short Slip',
    description: 'Ultra-condensed lines, minimal blank feeds, and tight spacing to reduce thermal paper usage.',
    defaultWidth: 32,
    recommendedWidthLabel: '58mm (32 cols)',
    config: COMPACT_PRESET_CONFIG,
  },
  {
    id: 'preset-detailed',
    presetKey: 'detailed',
    name: 'Detailed & Credit',
    tagline: 'Full Item & Ledger Breakdown',
    description: 'Displays cashier, customer phone, Pay Later credit balance, unit rates, and GST tax lines.',
    defaultWidth: 48,
    recommendedWidthLabel: '80mm (48 cols)',
    config: DETAILED_PRESET_CONFIG,
  },
];

/**
 * Converts a preset into a synthetic ReceiptTemplate object
 */
export function presetToReceiptTemplate(preset: PresetTemplateItem, isActive = false): ReceiptTemplate {
  return {
    id: preset.id,
    name: preset.name,
    description: preset.description,
    is_active: isActive,
    paper_width: preset.defaultWidth,
    template_config: JSON.parse(JSON.stringify(preset.config)),
  };
}

/**
 * Realistic Sample Datasets for Interactive Previewing
 */
export const SAMPLE_DATASETS: Record<'paid' | 'payLater' | 'walkIn', Order> = {
  paid: {
    id: 'sample-paid-001',
    order_number: 'RC-20260814-0042',
    created_at: new Date().toISOString(),
    status: 'completed',
    customer_name: 'Rahul Sharma',
    payment_method: 'upi',
    payment_status: 'paid',
    is_printed: false,
    items: [
      { item_name: 'Special Bellam Tea', quantity: 2, unit_price: 20, total_price: 40 },
      { item_name: 'Filter Coffee', quantity: 1, unit_price: 30, total_price: 30 },
      { item_name: 'Crispy Veg Sandwich', quantity: 1, unit_price: 80, total_price: 80 },
    ],
    subtotal: 150,
    tax_amount: 0,
    discount_amount: 10,
    total_amount: 140,
    paid_amount: 140,
    due_amount: 0,
  },
  payLater: {
    id: 'sample-paylater-002',
    order_number: 'RC-20260814-0056',
    created_at: new Date().toISOString(),
    status: 'completed',
    customer_name: 'Eswar Chinthakayala',
    payment_method: 'pay_later',
    payment_status: 'partial',
    is_printed: false,
    items: [
      { item_name: 'Special Bellam Tea', quantity: 5, unit_price: 20, total_price: 100 },
      { item_name: 'Badam Milk (Hot)', quantity: 2, unit_price: 35, total_price: 70 },
      { item_name: 'Paneer Cheese Burger', quantity: 2, unit_price: 120, total_price: 240 },
      { item_name: '20L RadhaWater Can', quantity: 2, unit_price: 45, total_price: 90 },
    ],
    subtotal: 500,
    tax_amount: 0,
    discount_amount: 0,
    total_amount: 500,
    paid_amount: 200,
    due_amount: 300,
  },
  walkIn: {
    id: 'sample-walkin-003',
    order_number: 'RC-20260814-0012',
    created_at: new Date().toISOString(),
    status: 'completed',
    customer_name: 'Walk-in Customer',
    payment_method: 'cash',
    payment_status: 'paid',
    is_printed: false,
    items: [
      { item_name: 'Ginger Cardamom Tea', quantity: 2, unit_price: 20, total_price: 40 },
      { item_name: 'Samosa (2 pcs)', quantity: 1, unit_price: 30, total_price: 30 },
    ],
    subtotal: 70,
    tax_amount: 0,
    discount_amount: 0,
    total_amount: 70,
    paid_amount: 70,
    due_amount: 0,
  },
};

