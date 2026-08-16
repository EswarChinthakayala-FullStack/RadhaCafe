import type { Order } from '../../types';
import { formatReceiptFromTemplate } from './receiptFormatter';

/**
 * Generates formatted HTML string for browser receipt printing
 */
function buildReceiptHtml(order: Order, cafeSettings?: any, templateConfig?: any): string {
  const { data: receipt } = formatReceiptFromTemplate(order, templateConfig, cafeSettings);

  const itemsHtml = receipt.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 2px 0; font-weight: 600; word-break: break-word;">${item.name} x${item.quantity}</td>
      <td style="padding: 2px 0; text-align: right; font-weight: 700; white-space: nowrap;">Rs. ${item.amount.toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt - ${receipt.orderNumber}</title>
        <meta charset="utf-8" />
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          html, body {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
            width: 280px;
            margin: 0 auto;
            padding: 4px 6px 0 6px;
            font-size: 11px;
            color: #000;
            background: #fff;
            line-height: 1.35;
          }
          @media print {
            html, body {
              width: 100%;
              margin: 0 !important;
              padding: 2px 4px 0 4px !important;
            }
          }
          .center { text-align: center; }
          .right { text-align: right; }
          .bold { font-weight: bold; }
          .divider { border-top: 1px dashed #000; margin: 4px 0; }
          table { width: 100%; border-collapse: collapse; }
          h2 { margin: 0 0 2px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
          p { margin: 1.5px 0; }
        </style>
      </head>
      <body>
        <div class="center">
          <h2>${receipt.cafeName}</h2>
          ${receipt.tagline ? `<p style="font-size: 9.5px;">${receipt.tagline}</p>` : ''}
          ${receipt.address ? `<p style="font-size: 9.5px;">${receipt.address}</p>` : ''}
          ${receipt.phone ? `<p style="font-size: 9.5px;">Tel: ${receipt.phone}</p>` : ''}
        </div>
        <div class="divider"></div>
        <div>
          <p><strong>Order #:</strong> ${receipt.orderNumber}</p>
          <p><strong>Date:</strong> ${receipt.dateTime}</p>
          ${receipt.customerName && receipt.customerName !== 'Walk-in Customer' ? `<p><strong>Guest:</strong> ${receipt.customerName}</p>` : ''}
        </div>
        <div class="divider"></div>
        <table>
          <thead>
            <tr style="border-bottom: 1px solid #000;">
              <th style="text-align: left; padding-bottom: 2px;">Item (Qty)</th>
              <th style="text-align: right; padding-bottom: 2px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <div class="divider"></div>
        <table>
          <tr>
            <td>Subtotal</td>
            <td class="right">Rs. ${receipt.subtotal.toFixed(2)}</td>
          </tr>
          ${receipt.tax > 0 ? `<tr><td>GST Tax</td><td class="right">Rs. ${receipt.tax.toFixed(2)}</td></tr>` : ''}
          ${receipt.discount > 0 ? `<tr><td>Discount</td><td class="right">-Rs. ${receipt.discount.toFixed(2)}</td></tr>` : ''}
          <tr class="bold" style="font-size: 12.5px;">
            <td style="padding-top: 4px;">TOTAL</td>
            <td class="right" style="padding-top: 4px;">Rs. ${receipt.total.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding-top: 2px;">Payment</td>
            <td class="right" style="padding-top: 2px;">${(receipt.paymentMethod || 'cash').toUpperCase()}</td>
          </tr>
        </table>
        <div class="divider"></div>
        <div class="center" style="margin-top: 4px; margin-bottom: 0; padding-bottom: 0; font-size: 10px;">
          <p style="margin: 0; padding: 0;">${receipt.footerMessage || 'Thank You For Your Visit!'}</p>
          ${receipt.secondaryFooter ? `<p style="margin: 1px 0 0 0; font-size: 9px;">${receipt.secondaryFooter}</p>` : ''}
          ${receipt.contactFooter ? `<p style="margin: 1px 0 0 0; font-size: 9px;">${receipt.contactFooter}</p>` : ''}
        </div>
      </body>
    </html>
  `;
}

/**
 * Safe, zero-crash browser receipt printing using a hidden iframe.
 * Avoids opening `about:blank` popup windows and never triggers popup blocker alerts.
 */
export function printOrderViaBrowser(
  order: Order,
  cafeSettings?: any,
  templateConfig?: any
): boolean {
  try {
    const htmlContent = buildReceiptHtml(order, cafeSettings, templateConfig);

    // Remove any previously existing print iframe
    const existingIframe = document.getElementById('radhacafe-print-frame');
    if (existingIframe) {
      existingIframe.remove();
    }

    // Create a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.id = 'radhacafe-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    iframe.style.zIndex = '-9999';

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) {
      iframe.remove();
      return false;
    }

    doc.open();
    doc.write(htmlContent);
    doc.close();

    // Trigger print safely after content has rendered
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (printErr) {
        console.error('Error invoking iframe print:', printErr);
      } finally {
        // Automatically cleanup iframe from DOM after print dialog is closed
        setTimeout(() => {
          iframe.remove();
        }, 1500);
      }
    }, 200);

    return true;
  } catch (err) {
    console.error('Browser printing error:', err);
    return false;
  }
}
