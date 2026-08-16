import { create } from 'zustand';
import type {
  PrinterConnectionStatus,
  PrinterDevice,
  ConnectionStage,
  SavedPrinter,
  PrinterErrorCode,
  DisconnectReason,
} from '../types/printer.types';
import type { PrinterProfile } from '../lib/printer/printerProfiles';
import { PRINTER_PROFILES } from '../lib/printer/printerProfiles';

interface PrinterState {
  status: PrinterConnectionStatus;
  connectionStage: ConnectionStage;
  device: PrinterDevice | null;
  connectedPrinter: SavedPrinter | null;
  activeProfile: PrinterProfile;
  disconnectReason: DisconnectReason;
  manualDisconnect: boolean;
  lastError: string | null;
  lastErrorCode: PrinterErrorCode | null;
  reconnectAttempts: number;
  totalReconnectsThisSession: number;
  lastConnectedAt: string | null;
  lastDisconnectedAt: string | null;
  isSupported: boolean;
  isGetDevicesSupported: boolean;
  isSecure: boolean;
  paperWidth: number;
  autoConnect: boolean;
  
  setStatus: (status: PrinterConnectionStatus) => void;
  setConnectionStage: (stage: ConnectionStage) => void;
  setConnectedDevice: (
    device: PrinterDevice | null,
    connectedPrinter?: SavedPrinter | null,
    profile?: PrinterProfile | null
  ) => void;
  setDisconnectReason: (reason: DisconnectReason) => void;
  setManualDisconnect: (manual: boolean) => void;
  setError: (error: string | null, code?: PrinterErrorCode | null) => void;
  setPaperWidth: (width: number) => void;
  setAutoConnect: (autoConnect: boolean) => void;
  incrementReconnectAttempts: () => number;
  resetReconnectAttempts: () => void;
  recordSuccessfulConnection: () => void;
  recordDisconnection: (reason: DisconnectReason) => void;
  resetForNewSession: () => void;
  reset: () => void;
}

const checkBluetoothSupported = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    'bluetooth' in navigator
  );
};

const checkGetDevicesSupported = (): boolean => {
  return (
    checkBluetoothSupported() &&
    typeof (navigator as any).bluetooth.getDevices === 'function'
  );
};

const checkSecureContext = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    window.isSecureContext ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );
};

export const usePrinterStore = create<PrinterState>((set, get) => ({
  status: checkBluetoothSupported() ? 'idle' : 'unsupported',
  connectionStage: 'idle',
  device: null,
  connectedPrinter: null,
  activeProfile: PRINTER_PROFILES['generic-ble-escpos'],
  disconnectReason: null,
  manualDisconnect: false,
  lastError: null,
  lastErrorCode: null,
  reconnectAttempts: 0,
  totalReconnectsThisSession: 0,
  lastConnectedAt: null,
  lastDisconnectedAt: null,
  isSupported: checkBluetoothSupported(),
  isGetDevicesSupported: checkGetDevicesSupported(),
  isSecure: checkSecureContext(),
  paperWidth: 32,
  autoConnect: true,

  setStatus: (status) => set({ status }),
  setConnectionStage: (connectionStage) => set({ connectionStage }),
  setConnectedDevice: (device, connectedPrinter = null, profile = null) =>
    set({
      device,
      connectedPrinter: connectedPrinter ?? get().connectedPrinter,
      activeProfile: profile ?? get().activeProfile,
      disconnectReason: null,
      manualDisconnect: false,
      lastError: null,
      lastErrorCode: null,
      reconnectAttempts: 0,
      lastConnectedAt: new Date().toISOString(),
    }),
  setDisconnectReason: (disconnectReason) => set({ disconnectReason }),
  setManualDisconnect: (manualDisconnect) => set({ manualDisconnect }),
  setError: (error, code = null) => set({ lastError: error, lastErrorCode: code }),
  setPaperWidth: (paperWidth) => set({ paperWidth }),
  setAutoConnect: (autoConnect) => set({ autoConnect }),
  incrementReconnectAttempts: () => {
    const next = get().reconnectAttempts + 1;
    set({ reconnectAttempts: next });
    return next;
  },
  resetReconnectAttempts: () => set({ reconnectAttempts: 0 }),
  recordSuccessfulConnection: () => {
    const total = get().totalReconnectsThisSession + 1;
    set({
      totalReconnectsThisSession: total,
      lastConnectedAt: new Date().toISOString(),
      reconnectAttempts: 0,
      lastError: null,
      lastErrorCode: null,
    });
  },
  recordDisconnection: (reason) => {
    set({
      disconnectReason: reason,
      lastDisconnectedAt: new Date().toISOString(),
    });
  },
  resetForNewSession: () => {
    set({
      status: checkBluetoothSupported() ? 'idle' : 'unsupported',
      connectionStage: 'idle',
      device: null,
      connectedPrinter: null,
      disconnectReason: null,
      manualDisconnect: false,
      lastError: null,
      lastErrorCode: null,
      reconnectAttempts: 0,
    });
  },
  reset: () =>
    set({
      status: checkBluetoothSupported() ? 'disconnected' : 'unsupported',
      connectionStage: 'idle',
      device: null,
      connectedPrinter: null,
      disconnectReason: 'user',
      manualDisconnect: true,
      lastError: null,
      lastErrorCode: null,
      reconnectAttempts: 0,
    }),
}));
