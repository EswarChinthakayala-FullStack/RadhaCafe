import { create } from 'zustand';
import type { PrinterConnectionStatus, PrinterDevice } from '../types';
import type { ConnectionStage } from '../lib/printer/bluetoothPrinter';

interface PrinterState {
  status: PrinterConnectionStatus;
  connectionStage: ConnectionStage;
  device: PrinterDevice | null;
  knownPrinters: { id: string; name: string }[];
  lastError: string | null;
  isSupported: boolean;
  paperWidth: number;
  autoConnect: boolean;
  setStatus: (status: PrinterConnectionStatus) => void;
  setConnectionStage: (stage: ConnectionStage) => void;
  setDevice: (device: PrinterDevice | null) => void;
  setKnownPrinters: (printers: { id: string; name: string }[]) => void;
  setError: (error: string | null) => void;
  setIsSupported: (isSupported: boolean) => void;
  setPaperWidth: (width: number) => void;
  setAutoConnect: (autoConnect: boolean) => void;
  reset: () => void;
}

export const usePrinterStore = create<PrinterState>((set) => ({
  status: 'disconnected',
  connectionStage: 'idle',
  device: null,
  knownPrinters: [],
  lastError: null,
  isSupported: typeof window !== 'undefined' && 'navigator' in window && 'bluetooth' in navigator,
  paperWidth: 32,
  autoConnect: true,
  setStatus: (status) => set({ status }),
  setConnectionStage: (connectionStage) => set({ connectionStage }),
  setDevice: (device) => set({ device }),
  setKnownPrinters: (knownPrinters) => set({ knownPrinters }),
  setError: (error) => set({ lastError: error }),
  setIsSupported: (isSupported) => set({ isSupported }),
  setPaperWidth: (paperWidth) => set({ paperWidth }),
  setAutoConnect: (autoConnect) => set({ autoConnect }),
  reset: () => set({ status: 'disconnected', connectionStage: 'idle', device: null, lastError: null }),
}));

