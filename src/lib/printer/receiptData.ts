import type { NormalizedReceiptData, NormalizedReceiptItem } from '../../types';
import { formatDate } from '../utils/formatDate';

export function normalizeOrderToReceiptData(
  order: any,
  cafeSettings?: any
): NormalizedReceiptData {
  let cafeName = (cafeSettings?.cafe_name || 'RadhaCafe').trim();
  if (cafeName.toLowerCase() === 'radhacaf') {
    cafeName = 'RadhaCafe';
  }
  const tagline = cafeSettings?.tagline || 'Authentic Chai & Snacks';
  const address = cafeSettings?.address || '1A, Vellampalli Tallur Rd, opp. Pattu Office, Tallur 523264';
  const phone = cafeSettings?.phone || '09966630913';
  const email = cafeSettings?.email || 'support@radhacafe.com';

  const rawItems = order?.items || order?.order_items || [];

  const items: NormalizedReceiptItem[] = rawItems.map((item: any) => {
    const qty = item.quantity || 1;
    const unitPrice = Number(item.unit_price || 0);
    const amount = Number(item.total_price || (unitPrice * qty));
    const name = item.item_name || item.name || 'Item';

    return {
      name,
      quantity: qty,
      unitPrice,
      amount,
    };
  });

  const createdIso = order?.created_at || new Date().toISOString();
  const formattedDateTime = formatDate(createdIso);
  const dateParts = formattedDateTime.split(',');
  const dateStr = dateParts[0] || formattedDateTime;
  const timeStr = dateParts[1] ? dateParts[1].trim() : '';

  const orderNum = order?.order_number || (order?.id ? `RC-${order.id.slice(0, 6).toUpperCase()}` : 'RC-2026-0001');

  const subtotal = Number(order?.subtotal || 0);
  const tax = Number(order?.tax_amount || 0);
  const discount = Number(order?.discount_amount || 0);
  const total = Number(order?.total_amount || 0);

  const due = Number(order?.due_amount || 0);
  const paid = Number(order?.paid_amount || (due === 0 ? total : 0));
  const isPayLater = order?.payment_method === 'pay_later';

  const thankYouMessage = cafeSettings?.receipt_footer || 'Thank You! Visit RadhaCafe Again.';
  const logoUrl = cafeSettings?.receipt_logo_url || cafeSettings?.logo_url || null;

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
    },
    orderNumber: orderNum,
    dateTime: formattedDateTime,
    dateStr,
    timeStr,
    cashierName: order?.cashier_name || 'Admin Counter',
    status: (order?.status || 'completed').toUpperCase(),
    customerName: order?.customer_name || 'Walk-in Customer',
    customerPhone: order?.customer_phone || '',
    paymentMethod: isPayLater ? 'PAY LATER' : (order?.payment_method || 'CASH').toUpperCase(),
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
