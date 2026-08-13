export type PrinterConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'printing'
  | 'reconnecting'
  | 'error'
  | 'unsupported';

export interface PrinterDevice {
  id: string;
  name: string;
  connected: boolean;
}

export interface FormattedReceiptData {
  cafeName: string;
  address: string;
  phone: string;
  orderNumber: string;
  dateTime: string;
  customerName?: string | null;
  paymentMethod?: string | null;
  items: {
    name: string;
    quantity: number;
    amount: number;
  }[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paidAmount?: number;
  dueAmount?: number;
  footerMessage: string;
}
