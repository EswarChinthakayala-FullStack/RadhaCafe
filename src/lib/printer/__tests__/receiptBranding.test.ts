import { describe, it, expect } from 'vitest';
import { formatReceiptFromTemplate } from '../receiptFormatter';
import { encodeTemplateReceiptToEscPos } from '../escpos';
import { calculateTargetWidth } from '../rasterLogo';
import { receiptTemplateSchema } from '../../validators/receiptTemplateSchema';
import { CLASSIC_PRESET_CONFIG, MODERN_PRESET_CONFIG } from '../presetTemplates';

describe('Receipt Template Branding & Authenticity Engine', () => {
  const sampleOrder = {
    id: 'ord-branding-test-12345',
    order_number: 'RC-101',
    customer_name: 'Sita Ram',
    customer_phone: '9988776655',
    status: 'completed',
    subtotal: 250,
    tax_amount: 12.5,
    discount_amount: 0,
    total_amount: 262.5,
    payment_method: 'upi',
    items: [
      { name: 'Special Masala Chai', quantity: 2, unit_price: 25, total_price: 50 },
      { name: 'Paneer Cheese Toast', quantity: 1, unit_price: 200, total_price: 200 },
    ],
  };

  const sampleCafeSettings = {
    cafe_name: 'RadhaCafe',
    tagline: 'Authentic Chai & Bites',
    address: 'Near Bus Stand, Main Road',
    phone: '09966630913',
    logo_url: 'https://example.com/logo.png',
  };

  it('correctly normalizes legacy templates without branding configuration', () => {
    const legacyConfig: any = {
      paperWidth: 32,
      dividerStyle: 'dashed',
      previewFont: 'JetBrains Mono',
      feedLines: 1,
      header: CLASSIC_PRESET_CONFIG.header,
      orderInfo: CLASSIC_PRESET_CONFIG.orderInfo,
      customerInfo: CLASSIC_PRESET_CONFIG.customerInfo,
      items: CLASSIC_PRESET_CONFIG.items,
      summary: CLASSIC_PRESET_CONFIG.summary,
      payment: CLASSIC_PRESET_CONFIG.payment,
      footer: CLASSIC_PRESET_CONFIG.footer,
      sectionOrder: CLASSIC_PRESET_CONFIG.sectionOrder,
    };

    const { config, data } = formatReceiptFromTemplate(sampleOrder, legacyConfig, sampleCafeSettings);

    expect(config.branding).toBeDefined();
    expect(config.branding?.showLogo).toBe(true);
    expect(config.branding?.logoAlignment).toBe('center');
    expect(config.branding?.logoSize).toBe('medium');
    expect(config.branding?.showAuthenticityMark).toBe(true);
    expect(config.branding?.authenticityText).toBe('Official RadhaCafe Receipt');
    expect(config.branding?.showReceiptReference).toBe(true);
    expect(data.logoUrl).toBe('https://example.com/logo.png');
  });

  it('correctly formats ESC/POS bytes containing authenticity mark and order reference', () => {
    const customConfig = {
      ...MODERN_PRESET_CONFIG,
      branding: {
        showLogo: true,
        logoAlignment: 'center' as const,
        logoSize: 'medium' as const,
        showAuthenticityMark: true,
        authenticityText: 'AUTHENTIC RADHACAFE RECEIPT',
        showReceiptReference: true,
      },
    };

    const bytes = encodeTemplateReceiptToEscPos(sampleOrder, {
      templateConfig: customConfig,
      cafeSettings: sampleCafeSettings,
    });

    const decoded = new TextDecoder().decode(bytes);
    expect(decoded).toContain('AUTHENTIC RADHACAFE RECEIPT');
    expect(decoded).toContain('Order Ref: RC-101');
  });

  it('correctly computes raster target dot widths for 58mm and 80mm roll sizes', () => {
    // 58mm roll (384 dots max)
    const small58 = calculateTargetWidth(32, 'small');
    const medium58 = calculateTargetWidth(32, 'medium');
    const large58 = calculateTargetWidth(32, 'large');

    expect(small58).toBe(136); // multiple of 8
    expect(medium58).toBe(208); // multiple of 8 (26 * 8 = 208 dots)
    expect(large58).toBe(288); // multiple of 8
    expect(small58 % 8).toBe(0);
    expect(medium58 % 8).toBe(0);
    expect(large58 % 8).toBe(0);

    // 80mm roll (576 dots max)
    const small80 = calculateTargetWidth(48, 'small');
    const medium80 = calculateTargetWidth(48, 'medium');
    const large80 = calculateTargetWidth(48, 'large');

    expect(small80).toBe(200); // multiple of 8
    expect(medium80).toBe(320); // multiple of 8
    expect(large80).toBe(432); // multiple of 8
    expect(small80 % 8).toBe(0);
    expect(medium80 % 8).toBe(0);
    expect(large80 % 8).toBe(0);
  });

  it('validates template configuration with Zod schema', () => {
    const validFormData = {
      name: 'Counter Receipt',
      description: 'Daily counter thermal layout',
      is_active: true,
      paper_width: 32,
      template_config: CLASSIC_PRESET_CONFIG,
    };

    const parseResult = receiptTemplateSchema.safeParse(validFormData);
    expect(parseResult.success).toBe(true);
    if (parseResult.success) {
      expect(parseResult.data.template_config.branding.showLogo).toBe(true);
      expect(parseResult.data.template_config.branding.authenticityText).toBe('Official RadhaCafe Receipt');
    }
  });
});
