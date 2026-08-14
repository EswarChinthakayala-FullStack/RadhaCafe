import { useEffect, useCallback } from 'react';
import { usePrinterStore } from '../store/printerStore';
import {
  disconnectBluetoothPrinter,
  requestBluetoothPrinter,
  reconnectKnownPrinter,
  getPreviouslyGrantedPrinters,
  sendEscPosData,
  isBluetoothSupported,
  isSecureContext,
  isGetDevicesSupported,
  normalizePrinterError,
  type ConnectionStage,
} from '../lib/printer/bluetoothPrinter';
import { encodeTestReceiptToEscPos, encodeTemplateReceiptToEscPos } from '../lib/printer/escpos';
import { printOrderViaBrowser } from '../lib/printer/browserPrint';
import { markOrderAsPrinted, fetchPrinterSettings, updatePrinterSettings } from '../lib/supabase/queries/printer';
import { fetchActiveReceiptTemplate } from '../lib/supabase/queries/receiptTemplates';
import { useQueryClient } from '@tanstack/react-query';
import type { Order } from '../types';

export function useBluetoothPrinter() {
  const queryClient = useQueryClient();

  const status = usePrinterStore((state) => state.status);
  const connectionStage = usePrinterStore((state) => state.connectionStage);
  const device = usePrinterStore((state) => state.device);
  const knownPrinters = usePrinterStore((state) => state.knownPrinters);
  const lastError = usePrinterStore((state) => state.lastError);

  /**
   * Refreshes list of previously authorized Bluetooth devices
   */
  const refreshKnownPrinters = useCallback(async () => {
    try {
      const granted = await getPreviouslyGrantedPrinters();
      usePrinterStore.getState().setKnownPrinters(granted);
    } catch {
      // Ignore
    }
  }, []);

  // Load known devices on mount
  useEffect(() => {
    refreshKnownPrinters();
  }, [refreshKnownPrinters]);

  /**
   * Scan for new thermal printer and connect via native browser chooser
   * MUST originate from explicit user click.
   */
  const scanAndConnect = async () => {
    const store = usePrinterStore.getState();
    try {
      store.setError(null);
      store.setStatus('connecting');
      store.setConnectionStage('requesting');

      const btDevice = await requestBluetoothPrinter(
        () => {
          usePrinterStore.getState().setDevice(null);
          usePrinterStore.getState().setStatus('disconnected');
          usePrinterStore.getState().setConnectionStage('idle');
        },
        (stage: ConnectionStage) => {
          usePrinterStore.getState().setConnectionStage(stage);
        }
      );

      const printerDevice = {
        id: btDevice.id,
        name: btDevice.name || 'Bluetooth Thermal Printer',
        connected: true,
      };

      store.setDevice(printerDevice);
      store.setStatus('connected');
      store.setConnectionStage('ready');

      // Persist preferred printer metadata to Supabase
      await updatePrinterSettings({
        printer_name: printerDevice.name,
        device_id: printerDevice.id,
      }).catch(() => null);

      queryClient.invalidateQueries({ queryKey: ['printerSettings'] });
      refreshKnownPrinters();
      return true;
    } catch (err: any) {
      const normalized = normalizePrinterError(err);
      if (normalized.code === 'PERMISSION_DENIED') {
        store.setStatus('disconnected');
        store.setConnectionStage('idle');
        store.setError(null); // Clean cancel without aggressive red error
      } else {
        store.setError(normalized.message);
        store.setStatus('error');
        store.setConnectionStage('idle');
      }
      return false;
    }
  };

  /**
   * Reconnects to a previously authorized Bluetooth device by ID (without opening chooser)
   */
  const reconnectKnownDevice = async (deviceId: string) => {
    const store = usePrinterStore.getState();
    try {
      store.setError(null);
      store.setStatus('connecting');

      const btDevice = await reconnectKnownPrinter(
        deviceId,
        () => {
          usePrinterStore.getState().setDevice(null);
          usePrinterStore.getState().setStatus('disconnected');
          usePrinterStore.getState().setConnectionStage('idle');
        },
        (stage: ConnectionStage) => {
          usePrinterStore.getState().setConnectionStage(stage);
        }
      );

      const printerDevice = {
        id: btDevice.id,
        name: btDevice.name || 'Bluetooth Thermal Printer',
        connected: true,
      };

      store.setDevice(printerDevice);
      store.setStatus('connected');
      store.setConnectionStage('ready');

      queryClient.invalidateQueries({ queryKey: ['printerSettings'] });
      return true;
    } catch (err: any) {
      const normalized = normalizePrinterError(err);
      store.setError(normalized.message);
      store.setStatus('error');
      store.setConnectionStage('idle');
      return false;
    }
  };

  /**
   * Disconnect GATT server and reset runtime printer status
   */
  const disconnect = () => {
    disconnectBluetoothPrinter();
    const store = usePrinterStore.getState();
    store.setDevice(null);
    store.setStatus('disconnected');
    store.setConnectionStage('idle');
  };

  /**
   * Forget printer: Disconnect GATT, clear runtime references, and reset saved settings
   */
  const forgetPrinter = async () => {
    disconnectBluetoothPrinter();
    usePrinterStore.getState().reset();
    try {
      await updatePrinterSettings({
        printer_name: null,
        device_id: null,
      });
      queryClient.invalidateQueries({ queryKey: ['printerSettings'] });
      refreshKnownPrinters();
    } catch {
      // Ignore database cleanup errors
    }
  };

  /**
   * Encodes order data to ESC/POS bytes and prints via BLE connection
   */
  const printOrder = async (order: Order, cafeSettings?: any): Promise<boolean> => {
    const store = usePrinterStore.getState();
    try {
      if (store.status !== 'connected') {
        const connected = await scanAndConnect();
        if (!connected) return false;
      }

      store.setStatus('printing');
      store.setError(null);

      const activeTemplate = await fetchActiveReceiptTemplate().catch(() => null);
      const escposBytes = encodeTemplateReceiptToEscPos(order, activeTemplate?.template_config, cafeSettings);

      await sendEscPosData(escposBytes);

      // Update is_printed state in Supabase on confirmed print success
      if (order.id) {
        await markOrderAsPrinted(order.id).catch(() => null);
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      }

      usePrinterStore.getState().setStatus('connected');
      return true;
    } catch (err: any) {
      const normalized = normalizePrinterError(err);
      usePrinterStore.getState().setError(normalized.message);
      usePrinterStore.getState().setStatus('error');
      return false;
    }
  };

  /**
   * Prints test receipt byte stream to verify ESC/POS formatting & paper cut
   */
  const printTestReceipt = async (cafeName = 'RadhaCafe'): Promise<boolean> => {
    const store = usePrinterStore.getState();
    try {
      if (store.status !== 'connected') {
        const connected = await scanAndConnect();
        if (!connected) return false;
      }

      store.setStatus('printing');
      store.setError(null);

      const printerSettings = await fetchPrinterSettings().catch(() => null);
      const paperWidth = printerSettings?.paper_width || 32;

      const testBytes = encodeTestReceiptToEscPos(paperWidth, cafeName);
      await sendEscPosData(testBytes);

      usePrinterStore.getState().setStatus('connected');
      return true;
    } catch (err: any) {
      const normalized = normalizePrinterError(err);
      usePrinterStore.getState().setError(normalized.message);
      usePrinterStore.getState().setStatus('error');
      return false;
    }
  };

  /**
   * Prints sample receipt using active receipt template
   */
  const printTemplateTest = async (cafeName = 'RadhaCafe'): Promise<boolean> => {
    const store = usePrinterStore.getState();
    try {
      if (store.status !== 'connected') {
        const connected = await scanAndConnect();
        if (!connected) return false;
      }

      store.setStatus('printing');
      store.setError(null);

      const activeTemplate = await fetchActiveReceiptTemplate().catch(() => null);

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
        activeTemplate?.template_config,
        { cafe_name: cafeName }
      );

      await sendEscPosData(escposBytes);
      usePrinterStore.getState().setStatus('connected');
      return true;
    } catch (err: any) {
      const normalized = normalizePrinterError(err);
      usePrinterStore.getState().setError(normalized.message);
      usePrinterStore.getState().setStatus('error');
      return false;
    }
  };

  /**
   * Browser fallback printing using HTML receipt window dialog
   */
  const printBrowserFallback = (order: Order, cafeSettings?: any): boolean => {
    return printOrderViaBrowser(order, cafeSettings);
  };

  /**
   * Encodes custom receipt template configuration and prints sample order via BLE
   */
  const printCustomReceipt = async (
    order: Order,
    templateConfig: any,
    cafeSettings?: any
  ): Promise<boolean> => {
    const store = usePrinterStore.getState();
    try {
      if (store.status !== 'connected') {
        const connected = await scanAndConnect();
        if (!connected) return false;
      }

      store.setStatus('printing');
      store.setError(null);

      const escposBytes = encodeTemplateReceiptToEscPos(
        order,
        templateConfig,
        cafeSettings
      );

      await sendEscPosData(escposBytes);
      usePrinterStore.getState().setStatus('connected');
      return true;
    } catch (err: any) {
      const normalized = normalizePrinterError(err);
      usePrinterStore.getState().setError(normalized.message);
      usePrinterStore.getState().setStatus('error');
      return false;
    }
  };

  return {
    status,
    connectionStage,
    device,
    savedPrinterName: device?.name || null,
    knownPrinters,
    lastError,
    isSupported: isBluetoothSupported(),
    isGetDevicesSupported: isGetDevicesSupported(),
    isSecure: isSecureContext(),
    isConnected: status === 'connected',
    isPrinting: status === 'printing',
    isConnecting: status === 'connecting',
    connect: scanAndConnect,
    scanAndConnect,
    reconnectKnownDevice,
    refreshKnownPrinters,
    disconnect,
    forgetPrinter,
    printOrder,
    printTestReceipt,
    printTemplateTest,
    printCustomReceipt,
    printBrowserFallback,
  };
}


