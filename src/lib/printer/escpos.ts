import { ESC_POS_COMMANDS } from '../../constants/printerCommands';
import type { FormattedReceiptData } from '../../types';

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
  addText(divider);

  // 7. Footer & Paper Cut
  addBytes(ESC_POS_COMMANDS.ALIGN_CENTER);
  addText(`${data.footerMessage || 'Thank You! Visit RadhaCafe Again.'}\n`);
  addBytes(ESC_POS_COMMANDS.FEED_PAPER_3_LINES);
  addBytes(ESC_POS_COMMANDS.CUT_PAPER);

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
  addBytes(ESC_POS_COMMANDS.FEED_PAPER_3_LINES);
  addBytes(ESC_POS_COMMANDS.CUT_PAPER);

  return new Uint8Array(buffer);
}
