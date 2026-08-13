import type { FormattedReceiptData, WaterOrder } from '../../types';
import { formatDate } from '../utils/formatDate';

export function formatWaterOrderReceipt(order: WaterOrder): FormattedReceiptData {
  const serviceName = 'RadhaWater';
  const address = '1A, Vellampalli Tallur Rd, opp. Pattu Office, Tallur 523264';
  const phone = '09966630913';
  const footerMessage = 'Thank You for choosing RadhaWater! Pure & Refreshing.';

  const rawItems = order.items || (order as any).water_order_items || [];

  const items = rawItems.map((item: any) => {
    const qty = item.quantity || 1;
    const unitPrice = Number(item.unit_price || 0);
    const amount = Number(item.total_price || unitPrice * qty);
    const name = item.item_name || 'RadhaWater';

    return {
      name,
      quantity: qty,
      amount,
    };
  });

  const due = Number(order.amount_due || 0);
  const paid = Number(order.amount_paid || (due === 0 ? order.total_amount : 0));

  return {
    cafeName: serviceName,
    address,
    phone,
    orderNumber: order.order_number || `RW-${order.id.slice(0, 6).toUpperCase()}`,
    dateTime: formatDate(order.created_at),
    customerName: order.customer_name || 'Walk-in Customer',
    paymentMethod: order.payment_method === 'pay_later' ? 'PAY LATER' : order.payment_method || 'cash',
    items,
    subtotal: Number(order.subtotal || 0),
    tax: 0,
    discount: Number(order.discount_amount || 0),
    total: Number(order.total_amount || 0),
    paidAmount: paid,
    dueAmount: due,
    footerMessage,
  };
}
