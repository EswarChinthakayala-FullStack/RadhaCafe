import type { FormattedReceiptData, WaterOrder } from '../../types';
import { formatDate } from '../utils/formatDate';

export function formatWaterOrderReceipt(order: WaterOrder | any): FormattedReceiptData {
  const serviceName = 'RadhaWater';
  const address = '1A, Vellampalli Tallur Rd, opp. Pattu Office, Tallur 523264';
  const phone = '09966630913';
  const footerMessage = 'Thank You for choosing RadhaWater! Pure & Refreshing.';

  const rawItems = order?.items || order?.water_order_items || order?.waterOrderItems || [];

  const items = rawItems.map((item: any) => {
    const qty = Number(item.quantity ?? item.qty ?? 1) || 1;
    const unitPrice = Number(item.unit_price ?? item.unitPrice ?? item.price ?? 0) || 0;
    const rawTotal = item.total_price ?? item.totalPrice ?? item.amount;
    const amount = rawTotal !== undefined && rawTotal !== null && !isNaN(Number(rawTotal)) && Number(rawTotal) !== 0
      ? Number(rawTotal)
      : unitPrice * qty;
    const name = item.item_name || item.name || 'RadhaWater';

    return {
      name,
      quantity: qty,
      unitPrice,
      amount,
    };
  });

  const calculatedItemsSubtotal = items.reduce((sum: number, it: any) => sum + (it.amount || 0), 0);
  const rawSubtotal = order?.subtotal ?? order?.subTotal;
  const subtotal = rawSubtotal !== undefined && rawSubtotal !== null && !isNaN(Number(rawSubtotal)) && Number(rawSubtotal) !== 0
    ? Number(rawSubtotal)
    : calculatedItemsSubtotal;

  const discount = Number(order?.discount_amount ?? order?.discountAmount ?? order?.discount ?? 0) || 0;
  const rawTotal = order?.total_amount ?? order?.totalAmount ?? order?.total;
  let total = rawTotal !== undefined && rawTotal !== null && !isNaN(Number(rawTotal))
    ? Number(rawTotal)
    : 0;

  if (total === 0 && (subtotal > 0 || calculatedItemsSubtotal > 0)) {
    total = Math.max(0, (subtotal || calculatedItemsSubtotal) - discount);
  }

  const rawPaymentMethod = order?.payment_method || order?.paymentMethod || 'cash';
  const isPayLater = String(rawPaymentMethod).toLowerCase() === 'pay_later' || Boolean(order?.isPayLater);

  const rawDue = order?.amount_due ?? order?.due_amount ?? order?.dueAmount ?? order?.amountDue;
  const due = rawDue !== undefined && rawDue !== null && !isNaN(Number(rawDue))
    ? Number(rawDue)
    : (isPayLater ? total : 0);

  const rawPaid = order?.amount_paid ?? order?.paid_amount ?? order?.paidAmount ?? order?.amountPaid;
  const paid = rawPaid !== undefined && rawPaid !== null && !isNaN(Number(rawPaid))
    ? Number(rawPaid)
    : (due === 0 ? total : Math.max(0, total - due));

  const orderNum = order?.order_number || order?.orderNumber || (order?.id ? `RW-${String(order.id).slice(0, 6).toUpperCase()}` : 'RW-0001');
  const createdIso = order?.created_at || order?.createdAt || new Date().toISOString();

  return {
    cafeName: serviceName,
    address,
    phone,
    orderNumber: orderNum,
    dateTime: formatDate(createdIso),
    customerName: order?.customer_name || order?.customerName || 'Walk-in Customer',
    paymentMethod: isPayLater ? 'PAY LATER' : String(rawPaymentMethod).toUpperCase(),
    items,
    subtotal,
    tax: 0,
    discount,
    total,
    paidAmount: paid,
    dueAmount: due,
    footerMessage,
  };
}
