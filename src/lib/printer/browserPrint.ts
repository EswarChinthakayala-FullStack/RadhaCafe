import type { Order } from '../../types';
import { formatReceiptFromTemplate } from './receiptFormatter';
import { toast } from '../../components/ui/toast';

/**
 * Fallback browser printing handler generating a clean print window when Web Bluetooth is unavailable.
 * Returns true if the popup window opened successfully, or false if blocked by browser.
 */
export function printOrderViaBrowser(order: Order, cafeSettings?: any, templateConfig?: any): boolean {
  const { data: receipt } = formatReceiptFromTemplate(order, templateConfig, cafeSettings);

  const printWindow = window.open('', '_blank', 'width=420,height=650');
  if (!printWindow) {
    toast.add({
      title: 'Browser Popup Blocked',
      description: 'Please allow popups in your browser settings to enable receipt printing fallback.',
      type: 'warning',
    });
    return false;
  }

  const itemsHtml = receipt.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 4px 0; font-weight: 600; word-break: break-word;">${item.name} x${item.quantity}</td>
      <td style="padding: 4px 0; text-align: right; font-weight: 700; white-space: nowrap;">Rs. ${item.amount.toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt - ${receipt.orderNumber}</title>
        <meta charset="utf-8" />
        <style>
          @page { size: 80mm auto; margin: 0; }
          body {
            font-family: monospace, Courier, sans-serif;
            width: 290px;
            margin: 0 auto;
            padding: 16px 10px;
            font-size: 12px;
            color: #000;
            background: #fff;
            line-height: 1.35;
          }
          .center { text-align: center; }
          .right { text-align: right; }
          .bold { font-weight: bold; }
          .divider { border-top: 1px dashed #000; margin: 8px 0; }
          table { width: 100%; border-collapse: collapse; }
          h2 { margin: 0 0 4px 0; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px; }
          p { margin: 2px 0; }
        </style>
      </head>
      <body>
        <div class="center">
          <h2>${receipt.cafeName}</h2>
          <p>${receipt.address}</p>
          <p>Tel: ${receipt.phone}</p>
        </div>
        <div class="divider"></div>
        <div>
          <p><strong>Order #:</strong> ${receipt.orderNumber}</p>
          <p><strong>Date:</strong> ${receipt.dateTime}</p>
          ${receipt.customerName ? `<p><strong>Guest:</strong> ${receipt.customerName}</p>` : ''}
        </div>
        <div class="divider"></div>
        <table>
          <thead>
            <tr style="border-bottom: 1px solid #000;">
              <th style="text-align: left; padding-bottom: 4px;">Item (Qty)</th>
              <th style="text-align: right; padding-bottom: 4px;">Amount</th>
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
          <tr class="bold" style="font-size: 14px;">
            <td style="padding-top: 6px;">TOTAL</td>
            <td class="right" style="padding-top: 6px;">Rs. ${receipt.total.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding-top: 2px;">Payment</td>
            <td class="right" style="padding-top: 2px;">${(receipt.paymentMethod || 'cash').toUpperCase()}</td>
          </tr>
        </table>
        <div class="divider"></div>
        <div class="center" style="margin-top: 12px;">
          <p>${receipt.footerMessage}</p>
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  return true;
}
