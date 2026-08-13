import { formatDate } from './formatDate';
import type { WaterOrder, WaterProductPerfItem, WaterPaymentStatusItem, WaterEventAnalyticsData } from '../../types/water.types';

export function downloadWaterOrdersCsv(orders: WaterOrder[]) {
  const headers = ['Order Number', 'Customer', 'Payment Method', 'Payment Status', 'Subtotal', 'Discount', 'Total Amount', 'Amount Paid', 'Amount Due', 'Date'];

  const rows = orders.map((o) => [
    `"${o.order_number}"`,
    `"${o.customer_name}"`,
    `"${o.payment_method}"`,
    `"${o.payment_status}"`,
    o.subtotal || 0,
    o.discount_amount || 0,
    o.total_amount || 0,
    o.amount_paid || 0,
    o.amount_due || 0,
    `"${formatDate(o.created_at)}"`,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `radhawater_orders_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadWaterProductsCsv(products: WaterProductPerfItem[]) {
  const headers = ['Product Name', 'Quantity Sold (Cans)', 'Revenue (INR)', 'Share (%)'];

  const rows = products.map((p) => [
    `"${p.product_name}"`,
    p.quantity,
    p.revenue,
    p.percentage,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `radhawater_products_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadWaterPaymentsCsv(payments: WaterPaymentStatusItem[]) {
  const headers = ['Payment Status', 'Orders Count', 'Total Amount (INR)', 'Share (%)'];

  const rows = payments.map((p) => [
    `"${p.label}"`,
    p.count,
    p.amount,
    p.percentage,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `radhawater_payments_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadWaterEventsCsv(eventsData: WaterEventAnalyticsData) {
  const headers = ['Event Type', 'Inquiries Count', 'Estimated Cans Required'];

  const rows = eventsData.typeData.map((e) => [
    `"${e.type}"`,
    e.count,
    e.estimated_cans,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `radhawater_events_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
