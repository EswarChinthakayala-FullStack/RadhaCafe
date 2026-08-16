import { useQueryClient } from '@tanstack/react-query';
import { usePrinterStore } from '../store/printerStore';
import { printerSessionManager } from '../lib/printer/printerSessionManager';
import { executePrintJob } from '../lib/printer/printQueue';
import { encodeTestReceiptToEscPos, encodeTemplateReceiptToEscPos } from '../lib/printer/escpos';
import { printOrderViaBrowser } from '../lib/printer/browserPrint';
import { markOrderAsPrinted } from '../lib/supabase/queries/printer';
import { fetchActiveReceiptTemplate } from '../lib/supabase/queries/receiptTemplates';
import { PRINTER_QUERY_KEYS } from './useSavedPrinters';
import type { Order, SavedPrinter, PrintExecutionResult } from '../types';

export function useBluetoothPrinter() {
  const queryClient = useQueryClient();

  const status = usePrinterStore((state) => state.status);
  const connectionStage = usePrinterStore((state) => state.connectionStage);
  const device = usePrinterStore((state) => state.device);
  const connectedPrinter = usePrinterStore((state) => state.connectedPrinter);
  const activeProfile = usePrinterStore((state) => state.activeProfile);
  const disconnectReason = usePrinterStore((state) => state.disconnectReason);
  const manualDisconnect = usePrinterStore((state) => state.manualDisconnect);
  const lastError = usePrinterStore((state) => state.lastError);
  const lastErrorCode = usePrinterStore((state) => state.lastErrorCode);
  const reconnectAttempts = usePrinterStore((state) => state.reconnectAttempts);
  const totalReconnectsThisSession = usePrinterStore((state) => state.totalReconnectsThisSession);
  const lastConnectedAt = usePrinterStore((state) => state.lastConnectedAt);
  const lastDisconnectedAt = usePrinterStore((state) => state.lastDisconnectedAt);
  const paperWidth = usePrinterStore((state) => state.paperWidth);
  const autoConnect = usePrinterStore((state) => state.autoConnect);
  const isSupported = usePrinterStore((state) => state.isSupported);
  const isGetDevicesSupported = usePrinterStore((state) => state.isGetDevicesSupported);
  const isSecure = usePrinterStore((state) => state.isSecure);

  const isConnected = status === 'ready' || status === 'connected';
  const isPrinting = status === 'printing';
  const isConnecting = status === 'connecting' || status === 'restoring';
  const isReconnecting = status === 'reconnecting';
  const isOffline = status === 'offline';
  const isPermissionRequired = status === 'permission-required';

  const savedPrinterName =
    connectedPrinter?.friendly_name ||
    connectedPrinter?.device_name ||
    device?.name ||
    null;

  /**
   * User-gesture triggered scan and pairing dialog
   */
  const scanAndConnect = async (customFriendlyName?: string): Promise<boolean> => {
    const success = await printerSessionManager.scanAndConnectNewPrinter(customFriendlyName);
    if (success) {
      queryClient.invalidateQueries({ queryKey: PRINTER_QUERY_KEYS.savedPrinters });
      queryClient.invalidateQueries({ queryKey: PRINTER_QUERY_KEYS.preferred });
      queryClient.invalidateQueries({ queryKey: PRINTER_QUERY_KEYS.settings });
    }
    return success;
  };

  /**
   * Connect to a specific previously saved printer
   */
  const connectSaved = async (savedPrinter: SavedPrinter): Promise<boolean> => {
    const success = await printerSessionManager.connectSaved(savedPrinter);
    if (success) {
      queryClient.invalidateQueries({ queryKey: PRINTER_QUERY_KEYS.savedPrinters });
    }
    return success;
  };

  /**
   * Immediate reconnection to preferred printer
   */
  const reconnectNow = async (): Promise<boolean> => {
    return printerSessionManager.reconnectNow();
  };

  /**
   * Manual user disconnect (suppresses auto-reconnect for this session)
   */
  const disconnect = (): void => {
    printerSessionManager.userDisconnect();
  };

  /**
   * Forgets a saved printer
   */
  const forgetPrinter = async (savedPrinterId: string, deviceId?: string): Promise<void> => {
    await printerSessionManager.forgetSavedPrinter(savedPrinterId, deviceId);
    queryClient.invalidateQueries({ queryKey: PRINTER_QUERY_KEYS.savedPrinters });
    queryClient.invalidateQueries({ queryKey: PRINTER_QUERY_KEYS.preferred });
    queryClient.invalidateQueries({ queryKey: PRINTER_QUERY_KEYS.settings });
  };

  /**
   * Renames a saved printer label
   */
  const renamePrinter = async (savedPrinterId: string, friendlyName: string): Promise<void> => {
    await printerSessionManager.renameSavedPrinter(savedPrinterId, friendlyName);
    queryClient.invalidateQueries({ queryKey: PRINTER_QUERY_KEYS.savedPrinters });
    queryClient.invalidateQueries({ queryKey: PRINTER_QUERY_KEYS.preferred });
  };

  /**
   * Sets a saved printer as preferred
   */
  const setAsPreferred = async (savedPrinterId: string): Promise<void> => {
    await printerSessionManager.setSavedPrinterPreferred(savedPrinterId);
    queryClient.invalidateQueries({ queryKey: PRINTER_QUERY_KEYS.savedPrinters });
    queryClient.invalidateQueries({ queryKey: PRINTER_QUERY_KEYS.preferred });
    queryClient.invalidateQueries({ queryKey: PRINTER_QUERY_KEYS.settings });
  };

  /**
   * Health check / Pre-flight check
   */
  const ensurePrinterReady = async (timeoutMs?: number): Promise<{ ready: boolean; reason?: string }> => {
    return printerSessionManager.ensurePrinterReady(timeoutMs);
  };

  /**
   * Safe order printing with pre-flight recovery and partial-write protection
   */
  const printOrder = async (order: Order, cafeSettings?: any): Promise<PrintExecutionResult> => {
    const store = usePrinterStore.getState();

    // 1. Ensure printer is ready or recover transient drop
    const readyCheck = await printerSessionManager.ensurePrinterReady();
    if (!readyCheck.ready) {
      return {
        status:
          readyCheck.reason === 'permission-required'
            ? 'permission-required'
            : 'not-started-printer-offline',
        message:
          readyCheck.reason === 'permission-required'
            ? 'Printer permission required. Click Authorize & Reconnect.'
            : 'Printer is offline. Order saved successfully.',
        orderId: order.id,
      };
    }

    store.setStatus('printing');
    store.setError(null);

    try {
      const activeTemplate = await fetchActiveReceiptTemplate().catch(() => null);
      const targetWidth = store.connectedPrinter?.paper_width || store.paperWidth || 32;

      const escposBytes = encodeTemplateReceiptToEscPos(
        order,
        activeTemplate?.template_config
          ? { ...activeTemplate.template_config, paperWidth: targetWidth }
          : { paperWidth: targetWidth },
        cafeSettings
      );

      const chunkSize = store.activeProfile?.defaultChunkSize || 20;
      const writeMode = store.activeProfile?.defaultWriteMode || 'without-response';

      const result = await executePrintJob({
        data: escposBytes,
        chunkSize,
        writeMode,
        orderId: order.id,
      });

      if (result.status === 'printed-sent' && order.id) {
        await markOrderAsPrinted(order.id).catch(() => null);
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      }

      usePrinterStore.getState().setStatus('ready');
      return result;
    } catch (err: any) {
      usePrinterStore.getState().setStatus('ready');
      return {
        status: 'error',
        message: err?.message || 'Printing failed.',
        orderId: order.id,
      };
    }
  };

  /**
   * Prints ESC/POS test receipt
   */
  const printTestReceipt = async (cafeName = 'RadhaCafe'): Promise<boolean> => {
    const store = usePrinterStore.getState();
    const readyCheck = await printerSessionManager.ensurePrinterReady();
    if (!readyCheck.ready) return false;

    store.setStatus('printing');
    try {
      const width = store.connectedPrinter?.paper_width || store.paperWidth || 32;
      const testBytes = encodeTestReceiptToEscPos(width, cafeName);
      const chunkSize = store.activeProfile?.defaultChunkSize || 20;
      const writeMode = store.activeProfile?.defaultWriteMode || 'without-response';

      const result = await executePrintJob({
        data: testBytes,
        chunkSize,
        writeMode,
      });

      usePrinterStore.getState().setStatus('ready');
      return result.status === 'printed-sent';
    } catch {
      usePrinterStore.getState().setStatus('ready');
      return false;
    }
  };

  /**
   * Prints sample order using active receipt template
   */
  const printTemplateTest = async (cafeName = 'RadhaCafe'): Promise<boolean> => {
    const store = usePrinterStore.getState();
    const readyCheck = await printerSessionManager.ensurePrinterReady();
    if (!readyCheck.ready) return false;

    store.setStatus('printing');
    try {
      const activeTemplate = await fetchActiveReceiptTemplate().catch(() => null);
      const targetWidth = store.connectedPrinter?.paper_width || store.paperWidth || 32;

      const sampleOrder: Order = {
        id: 'sample-test-01',
        order_number: 'TEST-001',
        customer_name: 'Sample Customer',
        customer_phone: '9876543210',
        status: 'completed',
        subtotal: 350,
        tax: 18,
        discount: 0,
        total: 368,
        payment_method: 'upi',
        created_at: new Date().toISOString(),
        items: [
          { name: 'Cold Coffee with Ice Cream', quantity: 2, unit_price: 120, total_price: 240 },
          { name: 'Veg Grilled Cheese Sandwich', quantity: 1, unit_price: 110, total_price: 110 },
        ],
      } as any;

      const escposBytes = encodeTemplateReceiptToEscPos(
        sampleOrder,
        activeTemplate?.template_config
          ? { ...activeTemplate.template_config, paperWidth: targetWidth }
          : { paperWidth: targetWidth },
        { cafe_name: cafeName }
      );

      const chunkSize = store.activeProfile?.defaultChunkSize || 20;
      const writeMode = store.activeProfile?.defaultWriteMode || 'without-response';

      const result = await executePrintJob({
        data: escposBytes,
        chunkSize,
        writeMode,
      });

      usePrinterStore.getState().setStatus('ready');
      return result.status === 'printed-sent';
    } catch {
      usePrinterStore.getState().setStatus('ready');
      return false;
    }
  };

  /**
   * Custom template test print
   */
  const printCustomReceipt = async (
    order: Order,
    templateConfig: any,
    cafeSettings?: any
  ): Promise<boolean> => {
    const store = usePrinterStore.getState();
    const readyCheck = await printerSessionManager.ensurePrinterReady();
    if (!readyCheck.ready) return false;

    store.setStatus('printing');
    try {
      const escposBytes = encodeTemplateReceiptToEscPos(order, templateConfig, cafeSettings);
      const chunkSize = store.activeProfile?.defaultChunkSize || 20;
      const writeMode = store.activeProfile?.defaultWriteMode || 'without-response';

      const result = await executePrintJob({
        data: escposBytes,
        chunkSize,
        writeMode,
      });

      usePrinterStore.getState().setStatus('ready');
      return result.status === 'printed-sent';
    } catch {
      usePrinterStore.getState().setStatus('ready');
      return false;
    }
  };

  /**
   * Browser fallback printing
   */
  const printBrowserFallback = (order: Order, cafeSettings?: any): boolean => {
    return printOrderViaBrowser(order, cafeSettings);
  };

  return {
    status,
    connectionStage,
    device,
    connectedPrinter,
    activeProfile,
    savedPrinterName,
    disconnectReason,
    manualDisconnect,
    lastError,
    lastErrorCode,
    reconnectAttempts,
    totalReconnectsThisSession,
    lastConnectedAt,
    lastDisconnectedAt,
    isSupported,
    isGetDevicesSupported,
    isSecure,
    isConnected,
    isPrinting,
    isConnecting,
    isReconnecting,
    isOffline,
    isPermissionRequired,
    isManuallyDisconnected: manualDisconnect,
    paperWidth,
    autoConnect,
    connect: () => scanAndConnect(),
    scanAndConnect,
    connectSaved,
    reconnectNow,
    reconnectPreferred: reconnectNow,
    disconnect,
    forgetPrinter,
    renamePrinter,
    setAsPreferred,
    ensurePrinterReady,
    printOrder,
    printTestReceipt,
    printTemplateTest,
    printCustomReceipt,
    printBrowserFallback,
  };
}
