import { ESC_POS_COMMANDS } from '../../constants/printerCommands';
import type { FormattedReceiptData, NormalizedReceiptItem } from '../../types';
import { formatReceiptFromTemplate, formatItemHeader, formatItemRow } from './receiptFormatter';

/**
 * Low-level ESC/POS byte generator functions operating on Uint8Array
 */

export function init(): Uint8Array {
  return new Uint8Array(ESC_POS_COMMANDS.INIT);
}

export function alignLeft(): Uint8Array {
  return new Uint8Array(ESC_POS_COMMANDS.ALIGN_LEFT);
}

export function alignCenter(): Uint8Array {
  return new Uint8Array(ESC_POS_COMMANDS.ALIGN_CENTER);
}

export function alignRight(): Uint8Array {
  return new Uint8Array(ESC_POS_COMMANDS.ALIGN_RIGHT);
}

export function boldOn(): Uint8Array {
  return new Uint8Array(ESC_POS_COMMANDS.TEXT_BOLD_ON);
}

export function boldOff(): Uint8Array {
  return new Uint8Array(ESC_POS_COMMANDS.TEXT_BOLD_OFF);
}

export function doubleHeight(): Uint8Array {
  return new Uint8Array(ESC_POS_COMMANDS.TEXT_DOUBLE_HEIGHT);
}

export function doubleWidth(): Uint8Array {
  return new Uint8Array(ESC_POS_COMMANDS.TEXT_DOUBLE_WIDTH);
}

export function textLarge(): Uint8Array {
  return new Uint8Array(ESC_POS_COMMANDS.TEXT_LARGE);
}

export function textNormal(): Uint8Array {
  return new Uint8Array(ESC_POS_COMMANDS.TEXT_NORMAL);
}

export function feedLine(lines = 1): Uint8Array {
  if (lines === 3) return new Uint8Array(ESC_POS_COMMANDS.FEED_PAPER_3_LINES);
  const bytes: number[] = [];
  for (let i = 0; i < lines; i++) {
    bytes.push(...ESC_POS_COMMANDS.FEED_LINE);
  }
  return new Uint8Array(bytes);
}

export function cut(): Uint8Array {
  return new Uint8Array(ESC_POS_COMMANDS.CUT_PAPER);
}

/**
 * Encodes text string into thermal-printer-compatible byte array.
 * Converts currency symbols (e.g. ₹ -> Rs. ) and filters unprintable control bytes.
 */
export function text(content: string): Uint8Array {
  const encoder = new TextEncoder();
  // Sanitize text for standard thermal printer encoding
  const sanitized = content
    .replace(/₹/g, 'Rs. ')
    .replace(/[^\x00-\x7F]/g, (char) => {
      // Keep basic ASCII, convert extended characters gracefully
      return char === '–' || char === '—' ? '-' : char;
    });
  return encoder.encode(sanitized);
}

/**
 * Formats a two-column item row with proper spacing and alignment.
 */
export function formatLine(left: string, right: string, width = 32): string {
  const availableWidth = width - right.length;
  if (left.length > availableWidth) {
    left = left.substring(0, Math.max(1, availableWidth - 1)) + ' ';
  }
  const spacesNeeded = width - left.length - right.length;
  return left + ' '.repeat(Math.max(1, spacesNeeded)) + right;
}

/**
 * Combines multiple Uint8Array byte chunks into a single Uint8Array payload.
 */
export function concatBuffers(...buffers: Uint8Array[]): Uint8Array {
  const totalLength = buffers.reduce((sum, buf) => sum + buf.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const buf of buffers) {
    result.set(buf, offset);
    offset += buf.length;
  }
  return result;
}

/**
 * Complete ESC/POS Encoder for Cafe Receipts
 */
export function encodeReceiptToEscPos(
  data: FormattedReceiptData,
  paperWidth = 32
): Uint8Array {
  const encoder = new TextEncoder();
  const buffer: number[] = [];

  const addBytes = (bytes: readonly number[] | Uint8Array | number[]) => {
    if (bytes instanceof Uint8Array) {
      buffer.push(...Array.from(bytes));
    } else {
      buffer.push(...bytes);
    }
  };

  const addText = (str: string) => {
    const sanitized = str.replace(/₹/g, 'Rs. ');
    buffer.push(...Array.from(encoder.encode(sanitized)));
  };

  const divider = '-'.repeat(paperWidth) + '\n';

  // 1. Initialize Printer
  addBytes(ESC_POS_COMMANDS.INIT);

  // 2. Header (Centered Cafe Branding)
  addBytes(ESC_POS_COMMANDS.ALIGN_CENTER);
  addBytes(ESC_POS_COMMANDS.TEXT_BOLD_ON);
  addBytes(ESC_POS_COMMANDS.TEXT_LARGE);
  addText(`${data.cafeName}\n`);
  addBytes(ESC_POS_COMMANDS.TEXT_NORMAL);
  addBytes(ESC_POS_COMMANDS.TEXT_BOLD_OFF);

  if (data.address) addText(`${data.address}\n`);
  if (data.phone) addText(`Tel: ${data.phone}\n`);
  addText(divider);

  // 3. Order Metadata (Left Align)
  addBytes(ESC_POS_COMMANDS.ALIGN_LEFT);
  addText(`Order #: ${data.orderNumber}\n`);
  addText(`Date   : ${data.dateTime}\n`);
  if (data.customerName) addText(`Guest  : ${data.customerName}\n`);
  addText(divider);

  // 4. Items Table Header
  addBytes(ESC_POS_COMMANDS.TEXT_BOLD_ON);
  if (paperWidth === 48) {
    addText(formatLine('Item Description (Qty)', 'Amount', paperWidth) + '\n');
  } else {
    addText(formatLine('Item (Qty)', 'Amount', paperWidth) + '\n');
  }
  addBytes(ESC_POS_COMMANDS.TEXT_BOLD_OFF);
  addText(divider);

  // 5. Item Rows
  data.items.forEach((item) => {
    const itemLabel = `${item.name} x${item.quantity}`;
    const amountLabel = `Rs. ${item.amount.toFixed(2)}`;
    addText(formatLine(itemLabel, amountLabel, paperWidth) + '\n');
  });

  addText(divider);

  // 6. Totals Breakdown
  addText(formatLine('Subtotal', `Rs. ${data.subtotal.toFixed(2)}`, paperWidth) + '\n');
  if (data.tax > 0) {
    addText(formatLine('GST Tax', `Rs. ${data.tax.toFixed(2)}`, paperWidth) + '\n');
  }
  if (data.discount > 0) {
    addText(formatLine('Discount', `-Rs. ${data.discount.toFixed(2)}`, paperWidth) + '\n');
  }

  addBytes(ESC_POS_COMMANDS.TEXT_BOLD_ON);
  addText(formatLine('TOTAL', `Rs. ${data.total.toFixed(2)}`, paperWidth) + '\n');
  addBytes(ESC_POS_COMMANDS.TEXT_BOLD_OFF);

  if (data.paymentMethod) {
    addText(formatLine('Payment', data.paymentMethod.toUpperCase(), paperWidth) + '\n');
  }
  if (data.dueAmount && data.dueAmount > 0) {
    addBytes(ESC_POS_COMMANDS.TEXT_BOLD_ON);
    addText(formatLine('Amount Due', `Rs. ${data.dueAmount.toFixed(2)}`, paperWidth) + '\n');
    addBytes(ESC_POS_COMMANDS.TEXT_BOLD_OFF);
  }
  addText(divider);

  // 7. Footer & Paper Cut
  addBytes(ESC_POS_COMMANDS.ALIGN_CENTER);
  addText(`${data.footerMessage || 'Thank You! Visit RadhaCafe Again.'}\n`);
  return new Uint8Array(buffer);
}

export interface TemplateReceiptPrintOptions {
  templateConfig?: any;
  cafeSettings?: any;
  finishingMode?: 'continuous' | 'manual-tear' | 'auto-cut';
  tearGap?: 'compact' | 'normal' | 'extra';
  supportsCut?: boolean;
  supportsImages?: boolean;
  rasterLogoBuffer?: Uint8Array | null;
}

/**
 * Advanced Template-Driven ESC/POS Byte Encoder
 * Formats printer byte commands according to active ReceiptTemplateConfig
 */
export function encodeTemplateReceiptToEscPos(
  rawOrder: any,
  templateConfigOrOptions?: any,
  cafeSettings?: any
): Uint8Array {
  const options: TemplateReceiptPrintOptions =
    templateConfigOrOptions && ('finishingMode' in templateConfigOrOptions || 'templateConfig' in templateConfigOrOptions)
      ? templateConfigOrOptions
      : { templateConfig: templateConfigOrOptions, cafeSettings };

  const effectiveConfig = options.templateConfig;
  const effectiveSettings = options.cafeSettings || cafeSettings;
  const finishingMode = options.finishingMode || 'continuous';
  const tearGap = options.tearGap || 'extra';
  const supportsCut = options.supportsCut ?? false;

  const { data, config, dividerLine } = formatReceiptFromTemplate(rawOrder, effectiveConfig, effectiveSettings);
  const encoder = new TextEncoder();
  const buffer: number[] = [];

  const addBytes = (bytes: readonly number[] | Uint8Array | number[]) => {
    if (bytes instanceof Uint8Array) {
      buffer.push(...Array.from(bytes));
    } else {
      buffer.push(...bytes);
    }
  };

  const addText = (str: string) => {
    const sanitized = str.replace(/₹/g, 'Rs. ');
    buffer.push(...Array.from(encoder.encode(sanitized)));
  };

  const applyAlignment = (align: 'left' | 'center' | 'right') => {
    if (align === 'center') addBytes(ESC_POS_COMMANDS.ALIGN_CENTER);
    else if (align === 'right') addBytes(ESC_POS_COMMANDS.ALIGN_RIGHT);
    else addBytes(ESC_POS_COMMANDS.ALIGN_LEFT);
  };

  const applyEmphasis = (emphasis: 'normal' | 'bold' | 'double_size') => {
    if (emphasis === 'bold') {
      addBytes(ESC_POS_COMMANDS.TEXT_NORMAL);
      addBytes(ESC_POS_COMMANDS.TEXT_BOLD_ON);
    } else if (emphasis === 'double_size') {
      addBytes(ESC_POS_COMMANDS.TEXT_LARGE);
      addBytes(ESC_POS_COMMANDS.TEXT_BOLD_ON);
    } else {
      addBytes(ESC_POS_COMMANDS.TEXT_NORMAL);
      addBytes(ESC_POS_COMMANDS.TEXT_BOLD_OFF);
    }
  };

  const resetEmphasis = () => {
    addBytes(ESC_POS_COMMANDS.TEXT_NORMAL);
    addBytes(ESC_POS_COMMANDS.TEXT_BOLD_OFF);
  };

  const width = config.paperWidth || 32;

  // 1. Initialize Printer
  addBytes(ESC_POS_COMMANDS.INIT);

  // Render Sections based on configured sectionOrder
  const sections = config.sectionOrder || ['header', 'orderInfo', 'customerInfo', 'items', 'summary', 'payment', 'footer'];

  sections.forEach((sec: string) => {
    if (sec === 'header') {
      // 1. Raster Logo Bit Image (if supported and provided)
      if (
        options.rasterLogoBuffer &&
        options.rasterLogoBuffer.length > 0 &&
        options.supportsImages !== false &&
        config.branding?.showLogo
      ) {
        addBytes(options.rasterLogoBuffer);
      }

      applyAlignment(config.header.alignment);
      applyEmphasis(config.header.emphasis);

      if (config.header.cafeNameVisible && config.header.cafeNameText) {
        addText(`${config.header.cafeNameText}\n`);
      }
      resetEmphasis();

      // 2. Official Authenticity Mark
      if (config.branding?.showAuthenticityMark) {
        applyAlignment(config.header.alignment);
        addBytes(ESC_POS_COMMANDS.TEXT_BOLD_ON);
        addText(`${config.branding.authenticityText || 'OFFICIAL RADHACAFE RECEIPT'}\n`);
        resetEmphasis();
      }

      if (config.header.taglineVisible && config.header.taglineText) {
        addText(`${config.header.taglineText}\n`);
      }
      if (config.header.addressVisible && config.header.addressText) {
        addText(`${config.header.addressText}\n`);
      }
      if (config.header.phoneVisible && config.header.phoneText) {
        addText(`Tel: ${config.header.phoneText}\n`);
      }
      if (config.header.emailVisible && config.header.emailText) {
        addText(`Email: ${config.header.emailText}\n`);
      }
      if (dividerLine) addText(`${dividerLine}\n`);
    } else if (sec === 'orderInfo') {
      applyAlignment(config.orderInfo.alignment);
      applyEmphasis(config.orderInfo.emphasis);

      if (config.branding?.showReceiptReference && config.orderInfo.orderNumberVisible) {
        addText(`Order Ref: ${data.orderNumber}\n`);
      } else if (config.orderInfo.orderNumberVisible) {
        addText(`Order #: ${data.orderNumber}\n`);
      }
      if (config.orderInfo.dateVisible) {
        addText(`Date   : ${data.dateTime}\n`);
      }
      if (config.orderInfo.cashierVisible && data.cashierName) {
        addText(`Cashier: ${data.cashierName}\n`);
      }
      if (config.orderInfo.statusVisible) {
        addText(`Status : ${data.status}\n`);
      }
      resetEmphasis();
      if (dividerLine) addText(`${dividerLine}\n`);
    } else if (sec === 'customerInfo') {
      applyAlignment(config.customerInfo.alignment);
      let customerHasInfo = false;

      if (config.customerInfo.customerNameVisible && data.customerName && data.customerName !== 'Walk-in Customer') {
        addText(`Customer: ${data.customerName}\n`);
        customerHasInfo = true;
      }
      if (config.customerInfo.phoneVisible && data.customerPhone) {
        addText(`Phone   : ${data.customerPhone}\n`);
        customerHasInfo = true;
      }
      if (config.customerInfo.paymentStatusVisible && data.isPayLater) {
        addText(`Account : CREDIT CUSTOMER\n`);
        customerHasInfo = true;
      }

      if (customerHasInfo && dividerLine) {
        addText(`${dividerLine}\n`);
      }
    } else if (sec === 'items') {
      applyAlignment('left');

      if (config.items.showHeaders) {
        addBytes(ESC_POS_COMMANDS.TEXT_BOLD_ON);
        addText(formatItemHeader(config.items.showUnitPrice, width) + '\n');
        resetEmphasis();
      }

      if (config.items.dividerBefore && dividerLine) {
        addText(`${dividerLine}\n`);
      }

      data.items.forEach((item: NormalizedReceiptItem) => {
        const rowLines = formatItemRow(
          item.name,
          item.quantity,
          item.unitPrice,
          item.amount,
          config.items.showUnitPrice,
          width
        );
        rowLines.forEach((l: string) => addText(`${l}\n`));
      });

      if (config.items.dividerAfter && dividerLine) {
        addText(`${dividerLine}\n`);
      }
    } else if (sec === 'summary') {
      applyAlignment('left');

      if (config.summary.dividerBeforeTotal && dividerLine) {
        addText(`${dividerLine}\n`);
      }

      if (config.summary.subtotalVisible) {
        addText(formatLine('Subtotal', `Rs. ${data.subtotal.toFixed(2)}`, width) + '\n');
      }
      if (config.summary.taxVisible && data.tax > 0) {
        addText(formatLine('GST Tax', `Rs. ${data.tax.toFixed(2)}`, width) + '\n');
      }
      if (config.summary.discountVisible && data.discount > 0) {
        addText(formatLine('Discount', `-Rs. ${data.discount.toFixed(2)}`, width) + '\n');
      }

      if (config.summary.grandTotalBold || config.summary.doubleSizeTotal) {
        applyEmphasis(config.summary.doubleSizeTotal ? 'double_size' : 'bold');
      }
      addText(formatLine('TOTAL', `Rs. ${data.total.toFixed(2)}`, width) + '\n');
      resetEmphasis();
    } else if (sec === 'payment') {
      applyAlignment('left');

      if (config.payment.paymentMethodVisible) {
        addText(formatLine('Payment', data.paymentMethod, width) + '\n');
      }
      if (config.payment.amountPaidVisible) {
        addText(formatLine('Paid', `Rs. ${data.paidAmount.toFixed(2)}`, width) + '\n');
      }
      if (config.payment.amountDueVisible && data.dueAmount > 0) {
        addBytes(ESC_POS_COMMANDS.TEXT_BOLD_ON);
        addText(formatLine('Amount Due', `Rs. ${data.dueAmount.toFixed(2)}`, width) + '\n');
        resetEmphasis();
      }

      if (dividerLine) addText(`${dividerLine}\n`);
    } else if (sec === 'footer') {
      applyAlignment(config.footer.alignment);
      applyEmphasis(config.footer.emphasis);

      if (config.footer.thankYouMessage) {
        addText(`${config.footer.thankYouMessage}\n`);
      }
      resetEmphasis();

      if (config.footer.secondaryMessage) {
        addText(`${config.footer.secondaryMessage}\n`);
      }
      if (config.footer.contactMessage) {
        addText(`${config.footer.contactMessage}\n`);
      }
    }
  });

  // Paper finishing: Auto Cut vs Manual Tear Feed Gap
  if (finishingMode === 'auto-cut' && supportsCut) {
    addBytes(ESC_POS_COMMANDS.FEED_LINE);
    addBytes(ESC_POS_COMMANDS.FEED_LINE);
    addBytes(ESC_POS_COMMANDS.CUT_PAPER);
  } else {
    // Manual tear or continuous queue: provide blank feed lines so operator can comfortably grasp and tear
    const gapLines = tearGap === 'compact' ? 2 : tearGap === 'normal' ? 3 : 5;
    if (gapLines === 3) {
      addBytes(ESC_POS_COMMANDS.FEED_PAPER_3_LINES);
    } else {
      for (let i = 0; i < gapLines; i++) {
        addBytes(ESC_POS_COMMANDS.FEED_LINE);
      }
    }
  }

  return new Uint8Array(buffer);
}

/**
 * Encodes a Test Receipt stream to verify ESC/POS initialization & paper cut
 */
export function encodeTestReceiptToEscPos(paperWidth = 32, cafeName = 'RadhaCafe'): Uint8Array {
  const encoder = new TextEncoder();
  const buffer: number[] = [];

  const addBytes = (bytes: readonly number[] | number[]) => buffer.push(...bytes);
  const addText = (str: string) => buffer.push(...Array.from(encoder.encode(str)));

  const divider = '-'.repeat(paperWidth) + '\n';
  const now = new Date().toLocaleString();

  addBytes(ESC_POS_COMMANDS.INIT);
  addBytes(ESC_POS_COMMANDS.ALIGN_CENTER);
  addBytes(ESC_POS_COMMANDS.TEXT_BOLD_ON);
  addBytes(ESC_POS_COMMANDS.TEXT_LARGE);
  addText(`${cafeName}\n`);
  addBytes(ESC_POS_COMMANDS.TEXT_NORMAL);
  addBytes(ESC_POS_COMMANDS.TEXT_BOLD_OFF);
  addText('THERMAL PRINTER TEST\n');
  addText(divider);
  addBytes(ESC_POS_COMMANDS.ALIGN_LEFT);
  addText(`Status : Connection OK\n`);
  addText(`Time   : ${now}\n`);
  addText(`Width  : ${paperWidth} Columns\n`);
  addText(divider);
  addBytes(ESC_POS_COMMANDS.ALIGN_CENTER);
  addText('Bluetooth BLE Receipt System Ready!\n');
  addBytes(ESC_POS_COMMANDS.FEED_LINE);
  addBytes(ESC_POS_COMMANDS.CUT_PAPER);

  return new Uint8Array(buffer);
}
