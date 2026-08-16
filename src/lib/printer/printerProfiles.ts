/**
 * RadhaCafe Centralized Verified Bluetooth Thermal Printer Profiles
 * 
 * Defines tested GATT service UUIDs, write characteristic UUIDs, MTU chunk sizes,
 * and command capabilities for ESC/POS BLE receipt printers.
 */

export interface PrinterProfile {
  key: string;
  name: string;
  description: string;
  serviceUuids: string[];
  characteristicUuids?: string[];
  defaultWriteMode: 'with-response' | 'without-response';
  defaultChunkSize: number;
  supportedPaperWidths: number[];
  supportsCut: boolean;
  supportsImages: boolean;
}

export const PRINTER_PROFILES: Record<string, PrinterProfile> = {
  'generic-ble-escpos': {
    key: 'generic-ble-escpos',
    name: 'Generic ESC/POS Thermal Printer',
    description: 'Standard Bluetooth Low Energy ESC/POS receipt printer profile supporting standard 58mm / 80mm printers.',
    serviceUuids: [
      '000018f0-0000-1000-8000-00805f9b34fb', // Standard ESC/POS Service
      '0000ff00-0000-1000-8000-00805f9b34fb', // General Thermal Printer Service
    ],
    characteristicUuids: [
      '00002af1-0000-1000-8000-00805f9b34fb',
      '0000ff01-0000-1000-8000-00805f9b34fb',
      '0000ff02-0000-1000-8000-00805f9b34fb',
    ],
    defaultWriteMode: 'without-response',
    defaultChunkSize: 20,
    supportedPaperWidths: [32, 48],
    supportsCut: true,
    supportsImages: true,
  },
  'issc-transparent': {
    key: 'issc-transparent',
    name: 'ISSC Transparent BLE Printer',
    description: 'ISSC proprietary serial bridge profile used by many portable 58mm Bluetooth receipt printers.',
    serviceUuids: [
      '49535343-fe7d-4ae5-8fa9-9fafd205e455', // ISSC Transparent Service
    ],
    characteristicUuids: [
      '49535343-8841-43f4-a8d4-ecbe34729bb3', // ISSC Transmit
      '49535343-1e4d-4bd9-ba61-23c647249616', // ISSC Receive
    ],
    defaultWriteMode: 'without-response',
    defaultChunkSize: 20,
    supportedPaperWidths: [32],
    supportsCut: false,
    supportsImages: true,
  },
  'munbyn-zjiang': {
    key: 'munbyn-zjiang',
    name: 'Munbyn / ZJiang POS Printer',
    description: 'Specialized profile for Munbyn, ZJiang, Netum, and similar high-speed commercial POS thermal printers.',
    serviceUuids: [
      '0000e7b0-0000-1000-8000-00805f9b34fb',
      'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
    ],
    characteristicUuids: [
      '0000e7b1-0000-1000-8000-00805f9b34fb',
      'bef8d6c9-9c21-4c9e-b632-bd58c1009f9f',
    ],
    defaultWriteMode: 'without-response',
    defaultChunkSize: 20,
    supportedPaperWidths: [32, 48],
    supportsCut: true,
    supportsImages: true,
  },
  'pos-5802': {
    key: 'pos-5802',
    name: 'POS-5802 / Milestone Portable',
    description: 'Compact 58mm portable battery-powered receipt printer.',
    serviceUuids: [
      '000018f0-0000-1000-8000-00805f9b34fb',
      'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
    ],
    defaultWriteMode: 'without-response',
    defaultChunkSize: 20,
    supportedPaperWidths: [32],
    supportsCut: false,
    supportsImages: false,
  },
};

/**
 * Returns all service UUIDs across all supported profiles for requestDevice optionalServices
 */
export function getAllSupportedServiceUuids(): string[] {
  const uuidSet = new Set<string>();
  Object.values(PRINTER_PROFILES).forEach((profile) => {
    profile.serviceUuids.forEach((uuid) => uuidSet.add(uuid.toLowerCase()));
  });
  return Array.from(uuidSet);
}

/**
 * Matches a discovered GATT service UUID to a registered profile key
 */
export function matchProfileByServiceUuid(serviceUuid: string): PrinterProfile {
  const normalized = serviceUuid.toLowerCase();
  for (const profile of Object.values(PRINTER_PROFILES)) {
    if (profile.serviceUuids.some((uuid) => uuid.toLowerCase() === normalized)) {
      return profile;
    }
  }
  return PRINTER_PROFILES['generic-ble-escpos'];
}

/**
 * Retrieves a printer profile by key, safely falling back to generic ESC/POS
 */
export function getPrinterProfile(key?: string | null): PrinterProfile {
  if (key && PRINTER_PROFILES[key]) {
    return PRINTER_PROFILES[key];
  }
  return PRINTER_PROFILES['generic-ble-escpos'];
}
