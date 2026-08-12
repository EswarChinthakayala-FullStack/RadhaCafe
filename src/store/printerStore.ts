import { create } from 'zustand';
import type { PrinterConnectionStatus, PrinterDevice } from '../types';

interface PrinterState {
  status: PrinterConnectionStatus;
  device: PrinterDevice | null;
  lastError: string | null;
  isSupported: boolean;
  paperWidth: number;
  autoConnect: boolean;
  setStatus: (status: PrinterConnectionStatus) => void;
  setDevice: (device: PrinterDevice | null) => void;
  setError: (error: string | null) => void;
  setIsSupported: (isSupported: boolean) => void;
  setPaperWidth: (width: number) => void;
  setAutoConnect: (autoConnect: boolean) => void;
  reset: () => void;
}

export const usePrinterStore = create<PrinterState>((set) => ({
  status: 'disconnected',
  device: null,
  lastError: null,
  isSupported: typeof window !== 'undefined' && 'navigator' in window && 'bluetooth' in navigator,
  paperWidth: 32,
  autoConnect: true,
  setStatus: (status) => set({ status }),
  setDevice: (device) => set({ device }),
  setError: (error) => set({ lastError: error }),
  setIsSupported: (isSupported) => set({ isSupported }),
  setPaperWidth: (paperWidth) => set({ paperWidth }),
  setAutoConnect: (autoConnect) => set({ autoConnect }),
  reset: () => set({ status: 'disconnected', device: null, lastError: null }),
}));
