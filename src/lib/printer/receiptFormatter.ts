import type { FormattedReceiptData, Order } from '../../types';
import { formatDate } from '../utils/formatDate';

export interface CafeSettingsInput {
  cafe_name?: string | null;
  address?: string | null;
  phone?: string | null;
  receipt_footer?: string | null;
}

/**
 * Creates a deterministic, shared receipt representation used by both:
 * 1. ESC/POS binary thermal printer byte generation
 * 2. Visual HTML browser receipt previews
 */
export function formatOrderReceipt(
  order: Order,
  cafeSettings?: CafeSettingsInput | null
): FormattedReceiptData {
  let cafeName = (cafeSettings?.cafe_name || 'RadhaCafe').trim();
  if (cafeName.toLowerCase() === 'radhacaf') {
    cafeName = 'RadhaCafe';
  }
  const address = cafeSettings?.address || '1A, Vellampalli Tallur Rd, opp. Pattu Office, Tallur 523264';
  const phone = cafeSettings?.phone || '09966630913';
  const footerMessage = cafeSettings?.receipt_footer || 'Thank You! Visit RadhaCafe Again.';

  const rawItems = order.items || (order as any).order_items || [];

  const items = rawItems.map((item: any) => {
    const qty = item.quantity || 1;
    const unitPrice = Number(item.unit_price || 0);
    const amount = Number(item.total_price || (unitPrice * qty));
    const name = item.item_name || item.name || 'Item';

    return {
      name,
      quantity: qty,
      amount,
    };
  });

  const due = Number(order.due_amount || 0);
  const paid = Number(order.paid_amount || (due === 0 ? order.total_amount : 0));

  return {
    cafeName,
    address,
    phone,
    orderNumber: order.order_number || `RC-${order.id.slice(0, 6).toUpperCase()}`,
    dateTime: formatDate(order.created_at),
    customerName: order.customer_name || 'Walk-in Customer',
    paymentMethod: order.payment_method === 'pay_later' ? 'PAY LATER' : order.payment_method || 'cash',
    items,
    subtotal: Number(order.subtotal || 0),
    tax: Number(order.tax_amount || 0),
    discount: Number(order.discount_amount || 0),
    total: Number(order.total_amount || 0),
    paidAmount: paid,
    dueAmount: due,
    footerMessage,
  };
}
