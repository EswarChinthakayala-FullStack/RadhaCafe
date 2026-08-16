export type SectionType =
  | 'header'
  | 'orderInfo'
  | 'customerInfo'
  | 'items'
  | 'summary'
  | 'payment'
  | 'footer';

export type AlignmentType = 'left' | 'center' | 'right';
export type EmphasisType = 'normal' | 'bold' | 'double_size';
export type DividerStyleType = 'solid' | 'double' | 'dashed' | 'dotted' | 'none';
export type PreviewFontType = 'JetBrains Mono' | 'Consolas' | 'Inter' | 'System Mono';

export type LogoAlignment = 'left' | 'center' | 'right';
export type LogoSize = 'small' | 'medium' | 'large';

export type WatermarkType = 'logo' | 'text' | 'logo_text' | 'authenticity_band';
export type WatermarkPosition = 'upper' | 'center' | 'lower';
export type WatermarkIntensity = 'light' | 'medium' | 'strong';

export interface ReceiptWatermarkConfig {
  enabled: boolean;
  type: WatermarkType;
  position: WatermarkPosition;
  intensity: WatermarkIntensity;
  repeat: boolean;
  text: string;
}

export const DEFAULT_WATERMARK_CONFIG: ReceiptWatermarkConfig = {
  enabled: true,
  type: 'logo_text',
  position: 'center',
  intensity: 'light',
  repeat: false,
  text: 'RADHACAFE • OFFICIAL',
};

export interface BrandingConfig {
  showLogo: boolean;
  logoAlignment: LogoAlignment;
  logoSize: LogoSize;
  showAuthenticityMark: boolean;
  authenticityText: string;
  showReceiptReference: boolean;
  watermark?: ReceiptWatermarkConfig;
}

export const DEFAULT_BRANDING_CONFIG: BrandingConfig = {
  showLogo: true,
  logoAlignment: 'center',
  logoSize: 'medium',
  showAuthenticityMark: true,
  authenticityText: 'Official RadhaCafe Receipt',
  showReceiptReference: true,
  watermark: DEFAULT_WATERMARK_CONFIG,
};

export interface HeaderConfig {
  logoVisible: boolean;
  cafeNameVisible: boolean;
  cafeNameText: string;
  taglineVisible: boolean;
  taglineText: string;
  addressVisible: boolean;
  addressText: string;
  phoneVisible: boolean;
  phoneText: string;
  emailVisible: boolean;
  emailText: string;
  alignment: AlignmentType;
  emphasis: EmphasisType;
}

export interface OrderInfoConfig {
  orderNumberVisible: boolean;
  dateVisible: boolean;
  timeVisible: boolean;
  cashierVisible: boolean;
  statusVisible: boolean;
  alignment: AlignmentType;
  emphasis: EmphasisType;
}

export interface CustomerInfoConfig {
  customerNameVisible: boolean;
  phoneVisible: boolean;
  paymentStatusVisible: boolean;
  alignment: AlignmentType;
}

export interface ItemsConfig {
  showHeaders: boolean;
  showUnitPrice: boolean;
  itemWrapping: boolean;
  dividerBefore: boolean;
  dividerAfter: boolean;
}

export interface SummaryConfig {
  subtotalVisible: boolean;
  taxVisible: boolean;
  discountVisible: boolean;
  grandTotalBold: boolean;
  doubleSizeTotal: boolean;
  dividerBeforeTotal: boolean;
}

export interface PaymentConfig {
  paymentMethodVisible: boolean;
  amountPaidVisible: boolean;
  amountDueVisible: boolean;
  payLaterIndicator: boolean;
}

export interface FooterConfig {
  thankYouMessage: string;
  secondaryMessage: string;
  contactMessage: string;
  alignment: AlignmentType;
  emphasis: EmphasisType;
}

export interface ReceiptTemplateConfig {
  paperWidth: number; // 32 = 58mm, 48 = 80mm
  dividerStyle: DividerStyleType;
  previewFont: PreviewFontType;
  feedLines: number;
  branding?: BrandingConfig;
  header: HeaderConfig;
  orderInfo: OrderInfoConfig;
  customerInfo: CustomerInfoConfig;
  items: ItemsConfig;
  summary: SummaryConfig;
  payment: PaymentConfig;
  footer: FooterConfig;
  sectionOrder: SectionType[];
}

export interface ReceiptTemplate {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  paper_width: number;
  template_config: ReceiptTemplateConfig;
  created_at?: string;
  updated_at?: string;
}

export interface NormalizedReceiptItem {
  name: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface NormalizedReceiptData {
  cafeName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  logoUrl?: string | null;
  branding: BrandingConfig;
  orderNumber: string;
  dateTime: string;
  dateStr: string;
  timeStr: string;
  cashierName: string;
  status: string;
  customerName: string;
  customerPhone: string;
  paymentMethod: string;
  isPayLater: boolean;
  items: NormalizedReceiptItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paidAmount: number;
  dueAmount: number;
  footerMessage: string;
  secondaryFooter: string;
  contactFooter: string;
}

export type CreateReceiptTemplateInput = Omit<ReceiptTemplate, 'id' | 'created_at' | 'updated_at'>;
export type UpdateReceiptTemplateInput = Partial<CreateReceiptTemplateInput>;
