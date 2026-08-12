import { usePrinterStore } from '../store/printerStore';
import {
  disconnectBluetoothPrinter,
  requestBluetoothPrinter,
  sendEscPosData,
  isBluetoothSupported,
  isSecureContext,
  normalizePrinterError,
} from '../lib/printer/bluetoothPrinter';
import { formatOrderReceipt } from '../lib/printer/receiptFormatter';
import { encodeReceiptToEscPos, encodeTestReceiptToEscPos } from '../lib/printer/escpos';
import { printOrderViaBrowser } from '../lib/printer/browserPrint';
import { markOrderAsPrinted, fetchPrinterSettings, updatePrinterSettings } from '../lib/supabase/queries/printer';
import { useQueryClient } from '@tanstack/react-query';
import type { Order } from '../types';

export function useBluetoothPrinter() {
  const queryClient = useQueryClient();

  const status = usePrinterStore((state) => state.status);
  const device = usePrinterStore((state) => state.device);
  const lastError = usePrinterStore((state) => state.lastError);
  const setStatus = usePrinterStore((state) => state.setStatus);
  const setDevice = usePrinterStore((state) => state.setDevice);
  const setError = usePrinterStore((state) => state.setError);
  const resetStore = usePrinterStore((state) => state.reset);

  /**
   * Connect to Bluetooth thermal printer.
   * MUST originate from explicit user gesture (e.g. click event).
   */
  const connect = async () => {
    try {
      setError(null);
      setStatus('connecting');

      const btDevice = await requestBluetoothPrinter(() => {
        setDevice(null);
        setStatus('disconnected');
      });

      const printerDevice = {
        id: btDevice.id,
        name: btDevice.name || 'Thermal Printer',
        connected: true,
      };

      setDevice(printerDevice);
      setStatus('connected');

      // Persist printer metadata to Supabase in background
      await updatePrinterSettings({
        printer_name: printerDevice.name,
        device_id: printerDevice.id,
      }).catch(() => null);

      queryClient.invalidateQueries({ queryKey: ['printerSettings'] });
    } catch (err: any) {
      const normalized = normalizePrinterError(err);
      setError(normalized.message);
      setStatus('error');
    }
  };

  /**
   * Disconnect GATT server and reset runtime printer status
   */
  const disconnect = () => {
    disconnectBluetoothPrinter();
    setDevice(null);
    setStatus('disconnected');
  };

  /**
   * Forget printer: Disconnect GATT, clear runtime references, and reset saved settings
   */
  const forgetPrinter = async () => {
    disconnectBluetoothPrinter();
    resetStore();
    try {
      await updatePrinterSettings({
        printer_name: null,
        device_id: null,
      });
      queryClient.invalidateQueries({ queryKey: ['printerSettings'] });
    } catch {
      // Ignore database cleanup errors
    }
  };

  /**
   * Encodes order data to ESC/POS bytes and prints via BLE connection
   */
  const printOrder = async (order: Order, cafeSettings?: any): Promise<boolean> => {
    try {
      if (status !== 'connected') {
        await connect();
      }

      setStatus('printing');
      setError(null);

      const printerSettings = await fetchPrinterSettings().catch(() => null);
      const paperWidth = printerSettings?.paper_width || 32;

      const formatted = formatOrderReceipt(order, cafeSettings);
      const escposBytes = encodeReceiptToEscPos(formatted, paperWidth);

      await sendEscPosData(escposBytes);

      // Update is_printed state in Supabase on confirmed print success
      if (order.id) {
        await markOrderAsPrinted(order.id).catch(() => null);
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      }

      setStatus('connected');
      return true;
    } catch (err: any) {
      const normalized = normalizePrinterError(err);
      setError(normalized.message);
      setStatus('error');
      return false;
    }
  };

  /**
   * Prints test receipt byte stream to verify ESC/POS formatting & paper cut
   */
  const printTestReceipt = async (cafeName = 'RadhaCafe'): Promise<boolean> => {
    try {
      if (status !== 'connected') {
        await connect();
      }

      setStatus('printing');
      setError(null);

      const printerSettings = await fetchPrinterSettings().catch(() => null);
      const paperWidth = printerSettings?.paper_width || 32;

      const testBytes = encodeTestReceiptToEscPos(paperWidth, cafeName);
      await sendEscPosData(testBytes);

      setStatus('connected');
      return true;
    } catch (err: any) {
      const normalized = normalizePrinterError(err);
      setError(normalized.message);
      setStatus('error');
      return false;
    }
  };

  /**
   * Browser fallback printing using HTML receipt window dialog
   */
  const printBrowserFallback = (order: Order, cafeSettings?: any) => {
    printOrderViaBrowser(order, cafeSettings);
  };

  return {
    status,
    device,
    lastError,
    isSupported: isBluetoothSupported(),
    isSecure: isSecureContext(),
    isConnected: status === 'connected',
    isPrinting: status === 'printing',
    connect,
    disconnect,
    forgetPrinter,
    printOrder,
    printTestReceipt,
    printBrowserFallback,
  };
}
