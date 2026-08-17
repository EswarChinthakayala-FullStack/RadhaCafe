import type { NormalizedReceiptData, NormalizedReceiptItem } from '../../types';
import { formatDate } from '../utils/formatDate';

export function normalizeOrderToReceiptData(
  order: any,
  cafeSettings?: any
): NormalizedReceiptData {
  let cafeName = (cafeSettings?.cafe_name || cafeSettings?.cafeName || 'RadhaCafe').trim();
  if (cafeName.toLowerCase() === 'radhacaf') {
    cafeName = 'RadhaCafe';
  }
  const tagline = cafeSettings?.tagline || 'Authentic Chai & Snacks';
  const address = cafeSettings?.address || '1A, Vellampalli Tallur Rd, opp. Pattu Office, Tallur 523264';
  const phone = cafeSettings?.phone || '09966630913';
  const email = cafeSettings?.email || 'support@radhacafe.com';

  const rawItems = order?.items || order?.order_items || order?.orderItems || [];

  const items: NormalizedReceiptItem[] = rawItems.map((item: any) => {
    const qty = Number(item.quantity ?? item.qty ?? 1) || 1;
    const unitPrice = Number(item.unit_price ?? item.unitPrice ?? item.price ?? 0) || 0;
    const rawTotal = item.total_price ?? item.totalPrice ?? item.amount;
    const amount = rawTotal !== undefined && rawTotal !== null && !isNaN(Number(rawTotal)) && Number(rawTotal) !== 0
      ? Number(rawTotal)
      : unitPrice * qty;
    const name = item.item_name || item.name || item.itemName || 'Item';

    return {
      name,
      quantity: qty,
      unitPrice,
      amount,
    };
  });

  const createdIso =
    order?.created_at ||
    order?.createdAt ||
    order?.offline_created_at ||
    order?.offlineCreatedAt ||
    new Date().toISOString();
  const formattedDateTime = formatDate(createdIso);
  const dateParts = formattedDateTime.split(',');
  const dateStr = dateParts[0] || formattedDateTime;
  const timeStr = dateParts[1] ? dateParts[1].trim() : '';

  const orderNum =
    order?.order_number ||
    order?.orderNumber ||
    order?.offline_reference ||
    order?.offlineReference ||
    (order?.id ? `RC-${String(order.id).slice(0, 6).toUpperCase()}` : 'RC-2026-0001');

  const calculatedItemsSubtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);

  const rawSubtotal = order?.subtotal ?? order?.subTotal;
  const subtotal = rawSubtotal !== undefined && rawSubtotal !== null && !isNaN(Number(rawSubtotal)) && Number(rawSubtotal) !== 0
    ? Number(rawSubtotal)
    : calculatedItemsSubtotal;

  const tax = Number(order?.tax_amount ?? order?.taxAmount ?? order?.tax ?? 0) || 0;
  const discount = Number(order?.discount_amount ?? order?.discountAmount ?? order?.discount ?? 0) || 0;

  const rawTotal = order?.total_amount ?? order?.totalAmount ?? order?.total;
  let total = rawTotal !== undefined && rawTotal !== null && !isNaN(Number(rawTotal))
    ? Number(rawTotal)
    : 0;

  if (total === 0 && (subtotal > 0 || calculatedItemsSubtotal > 0)) {
    total = Math.max(0, (subtotal || calculatedItemsSubtotal) - discount + tax);
  }

  const rawPaymentMethod = order?.payment_method || order?.paymentMethod || 'cash';
  const isPayLater = String(rawPaymentMethod).toLowerCase() === 'pay_later' || Boolean(order?.isPayLater);

  const rawDue = order?.due_amount ?? order?.dueAmount ?? order?.amount_due ?? order?.amountDue;
  const due = rawDue !== undefined && rawDue !== null && !isNaN(Number(rawDue))
    ? Number(rawDue)
    : (isPayLater ? total : 0);

  const rawPaid = order?.paid_amount ?? order?.paidAmount ?? order?.amount_paid ?? order?.amountPaid;
  const paid = rawPaid !== undefined && rawPaid !== null && !isNaN(Number(rawPaid))
    ? Number(rawPaid)
    : (due === 0 ? total : Math.max(0, total - due));

  const thankYouMessage = cafeSettings?.receipt_footer || cafeSettings?.receiptFooter || 'Thank You! Visit RadhaCafe Again.';
  const logoUrl = cafeSettings?.receipt_logo_url || cafeSettings?.receiptLogoUrl || cafeSettings?.logo_url || cafeSettings?.logoUrl || null;

  return {
    cafeName,
    tagline,
    address,
    phone,
    email,
    logoUrl,
    branding: {
      showLogo: true,
      logoAlignment: 'center',
      logoSize: 'medium',
      showAuthenticityMark: true,
      authenticityText: 'Official RadhaCafe Receipt',
      showReceiptReference: true,
      watermark: {
        enabled: true,
        type: 'logo_text',
        position: 'center',
        intensity: 'light',
        repeat: false,
        text: 'RADHACAFE • OFFICIAL',
      },
    },
    orderNumber: orderNum,
    dateTime: formattedDateTime,
    dateStr,
    timeStr,
    cashierName: order?.cashier_name || order?.cashierName || 'Admin Counter',
    status: String(order?.status || 'completed').toUpperCase(),
    customerName: order?.customer_name || order?.customerName || order?.customer?.name || 'Walk-in Customer',
    customerPhone: order?.customer_phone || order?.customerPhone || order?.customer?.phone || '',
    paymentMethod: isPayLater ? 'PAY LATER' : String(rawPaymentMethod).toUpperCase(),
    isPayLater,
    items,
    subtotal,
    tax,
    discount,
    total,
    paidAmount: paid,
    dueAmount: due,
    footerMessage: thankYouMessage,
    secondaryFooter: 'Please check items before leaving counter.',
    contactFooter: 'For catering or bulk orders call 09966630913',
  };
}
