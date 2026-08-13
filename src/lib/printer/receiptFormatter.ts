import type {
  NormalizedReceiptData,
  ReceiptTemplateConfig,
  DividerStyleType,
} from '../../types';
import { normalizeOrderToReceiptData } from './receiptData';

/**
 * Returns dynamic divider line matching configured paper width and style
 */
export function generateDivider(style: DividerStyleType, width = 32): string {
  if (style === 'none') return '';
  if (style === 'double') return '='.repeat(width);
  if (style === 'dotted') return '.'.repeat(width);
  if (style === 'solid') return '─'.repeat(width);
  // Default dashed
  return '-'.repeat(width);
}

/**
 * Formats a two-column line with proper spacing and right alignment according to paper width
 */
export function formatTwoColumnLine(left: string, right: string, width = 32): string {
  const availableLeft = width - right.length - 1;
  let leftText = left;
  if (leftText.length > availableLeft && availableLeft > 2) {
    leftText = leftText.substring(0, availableLeft - 1) + ' ';
  }
  const spacesNeeded = Math.max(1, width - leftText.length - right.length);
  return leftText + ' '.repeat(spacesNeeded) + right;
}

/**
 * Formats item table row with wrapping and column spacing
 */
export function formatItemRow(
  name: string,
  qty: number,
  unitPrice: number,
  amount: number,
  showUnitPrice: boolean,
  width = 32
): string[] {
  const amountStr = `Rs. ${amount.toFixed(2)}`;
  const qtyStr = `x${qty}`;
  const lines: string[] = [];

  if (width >= 48) {
    // 80mm wide paper (48 cols): Item (24) | Qty (5) | Unit (9) | Amount (10)
    const unitStr = showUnitPrice ? `Rs.${unitPrice.toFixed(0)}` : '';
    const colNameWidth = 22;
    const nameTruncated = name.length > colNameWidth ? name.substring(0, colNameWidth - 1) + '.' : name;
    
    const line = 
      nameTruncated.padEnd(23) + 
      qtyStr.padStart(4) + 
      unitStr.padStart(10) + 
      amountStr.padStart(11);
    
    lines.push(line);
  } else {
    // 58mm standard paper (32 cols)
    const rightCol = amountStr;
    const leftMax = width - rightCol.length - 1;
    const itemTitle = `${name} ${qtyStr}`;

    if (itemTitle.length <= leftMax) {
      lines.push(formatTwoColumnLine(itemTitle, rightCol, width));
    } else {
      // Wrap long item name onto 2 lines
      const truncatedName = name.length > leftMax ? name.substring(0, leftMax - 1) + '.' : name;
      lines.push(truncatedName);
      lines.push(formatTwoColumnLine(`  ${qtyStr}`, rightCol, width));
    }
  }

  return lines;
}

/**
 * Main Template Receipt Formatter
 * Takes raw/normalized order data + template config -> returns formatted lines & data model
 */
export function formatReceiptFromTemplate(
  rawOrder: any,
  templateConfig?: ReceiptTemplateConfig | null,
  cafeSettings?: any
): {
  data: NormalizedReceiptData;
  config: ReceiptTemplateConfig;
  dividerLine: string;
} {
  const data = normalizeOrderToReceiptData(rawOrder, cafeSettings);

  // Default Template Config Fallback
  const config: ReceiptTemplateConfig = templateConfig || {
    paperWidth: 32,
    dividerStyle: 'dashed',
    previewFont: 'JetBrains Mono',
    feedLines: 3,
    header: {
      logoVisible: true,
      cafeNameVisible: true,
      cafeNameText: data.cafeName,
      taglineVisible: true,
      taglineText: data.tagline,
      addressVisible: true,
      addressText: data.address,
      phoneVisible: true,
      phoneText: data.phone,
      emailVisible: false,
      emailText: data.email,
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
      thankYouMessage: data.footerMessage,
      secondaryMessage: data.secondaryFooter,
      contactMessage: data.contactFooter,
      alignment: 'center',
      emphasis: 'normal',
    },
    sectionOrder: ['header', 'orderInfo', 'customerInfo', 'items', 'summary', 'payment', 'footer'],
  };

  const dividerLine = generateDivider(config.dividerStyle, config.paperWidth);

  return {
    data,
    config,
    dividerLine,
  };
}

/**
 * Backward Compatibility Wrapper
 */
export function formatOrderReceipt(order: any, cafeSettings?: any) {
  const result = formatReceiptFromTemplate(order, null, cafeSettings);
  return {
    ...result.data,
    dividerLine: result.dividerLine,
  };
}
