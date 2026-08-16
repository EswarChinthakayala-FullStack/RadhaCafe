export type PrinterConnectionStatus =
  | 'unsupported'
  | 'idle'
  | 'restoring'
  | 'permission-required'
  | 'connecting'
  | 'discovering'
  | 'ready'
  | 'connected'
  | 'printing'
  | 'reconnecting'
  | 'disconnected'
  | 'offline'
  | 'error';

export type ConnectionStage =
  | 'idle'
  | 'requesting'
  | 'connecting_gatt'
  | 'discovering_service'
  | 'preparing_channel'
  | 'ready';

export type DisconnectReason =
  | 'user'
  | 'switch'
  | 'logout'
  | 'unexpected'
  | 'printer-power-loss'
  | 'connection-error'
  | null;

export interface PrinterDevice {
  id: string;
  name: string;
  connected: boolean;
}

export interface SavedPrinter {
  id: string;
  device_id: string;
  device_name: string | null;
  friendly_name: string | null;
  profile_key: string;
  service_uuid: string | null;
  characteristic_uuid: string | null;
  write_mode: 'with-response' | 'without-response' | null;
  chunk_size: number | null;
  paper_width: number;
  is_enabled: boolean;
  is_preferred?: boolean;
  last_connected_at: string | null;
  last_connection_failed_at: string | null;
  last_error_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface SavedPrinterInsert {
  id?: string;
  device_id: string;
  device_name?: string | null;
  friendly_name?: string | null;
  profile_key?: string;
  service_uuid?: string | null;
  characteristic_uuid?: string | null;
  write_mode?: 'with-response' | 'without-response' | null;
  chunk_size?: number | null;
  paper_width?: number;
  is_enabled?: boolean;
  last_connected_at?: string | null;
  last_connection_failed_at?: string | null;
  last_error_code?: string | null;
}

export interface SavedPrinterUpdate {
  device_id?: string;
  device_name?: string | null;
  friendly_name?: string | null;
  profile_key?: string;
  service_uuid?: string | null;
  characteristic_uuid?: string | null;
  write_mode?: 'with-response' | 'without-response' | null;
  chunk_size?: number | null;
  paper_width?: number;
  is_enabled?: boolean;
  last_connected_at?: string | null;
  last_connection_failed_at?: string | null;
  last_error_code?: string | null;
}

export type PrinterErrorCode =
  | 'BLUETOOTH_UNSUPPORTED'
  | 'NOT_SECURE_CONTEXT'
  | 'PERMISSION_DENIED'
  | 'PERMISSION_REQUIRED'
  | 'DEVICE_NOT_FOUND'
  | 'GATT_CONNECTION_FAILED'
  | 'SERVICE_NOT_FOUND'
  | 'CHARACTERISTIC_NOT_FOUND'
  | 'UNSUPPORTED_PRINTER'
  | 'WRITE_FAILED'
  | 'PRINT_LOCKED'
  | 'TIMEOUT'
  | 'DISCONNECTED'
  | 'UNKNOWN';

export interface NormalizedPrinterError {
  code: PrinterErrorCode;
  message: string;
}

export type PrintStatusResult =
  | 'printed-sent'
  | 'connection-recovered-and-sent'
  | 'not-started-printer-offline'
  | 'write-interrupted'
  | 'unsupported'
  | 'permission-required'
  | 'error';

export interface PrintExecutionResult {
  status: PrintStatusResult;
  message: string;
  orderId?: string;
  bytesWritten?: number;
  totalBytes?: number;
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
