import { BLE_CHUNK_SIZE } from '../../constants/printerCommands';
import type { ConnectionStage, NormalizedPrinterError } from '../../types/printer.types';
import {
  getAllSupportedServiceUuids,
  matchProfileByServiceUuid,
  getPrinterProfile,
  type PrinterProfile,
} from './printerProfiles';

export type { ConnectionStage };
export const DEFAULT_PRINTER_SERVICE_UUIDS = getAllSupportedServiceUuids();

let connectedDevice: any = null;
let writeCharacteristic: any = null;
let activeGattServer: any = null;
let disconnectListener: (() => void) | null = null;
let isWriteLocked = false;
let activeConnectionPromise: Promise<any> | null = null;

const eventLog: { timestamp: string; message: string }[] = [];

export function logEvent(message: string) {
  const time = new Date().toLocaleTimeString('en-US', { hour12: false });
  eventLog.unshift({ timestamp: time, message });
  if (eventLog.length > 50) eventLog.pop();
}

export function getPrinterEventLog() {
  return [...eventLog];
}

/**
 * Normalizes raw DOM / Web Bluetooth exceptions into structured application error codes
 */
export function normalizePrinterError(err: any): NormalizedPrinterError {
  const msg = err?.message || String(err || '');

  if (msg.includes('not supported') || msg.includes('navigator.bluetooth')) {
    return {
      code: 'BLUETOOTH_UNSUPPORTED',
      message: 'Web Bluetooth API is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Opera.',
    };
  }
  if (msg.includes('secure') || msg.includes('HTTPS')) {
    return {
      code: 'NOT_SECURE_CONTEXT',
      message: 'Bluetooth printing requires a secure HTTPS connection or localhost development environment.',
    };
  }
  if (
    msg.includes('cancelled') ||
    msg.includes('denied') ||
    msg.includes('User cancelled') ||
    err?.name === 'NotAllowedError'
  ) {
    return {
      code: 'PERMISSION_DENIED',
      message: 'Printer selection was cancelled.',
    };
  }
  if (msg.includes('permission_required') || msg.includes('permission-required')) {
    return {
      code: 'PERMISSION_REQUIRED',
      message: 'This printer needs browser permission. Click Reconnect or Authorize to grant access.',
    };
  }
  if (msg.includes('locked') || msg.includes('concurrent')) {
    return {
      code: 'PRINT_LOCKED',
      message: 'A receipt print operation is currently in progress. Please wait a moment.',
    };
  }
  if (msg.includes('characteristic') || msg.includes('service') || msg.includes('writable')) {
    return {
      code: 'CHARACTERISTIC_NOT_FOUND',
      message: 'The device connected, but does not expose a writable ESC/POS thermal printing service.',
    };
  }
  if (msg.includes('not found') || msg.includes('device-not-found')) {
    return {
      code: 'DEVICE_NOT_FOUND',
      message: 'The Bluetooth printer was not found. Make sure it is powered on, charged, and in range.',
    };
  }
  if (msg.includes('timeout') || msg.includes('timed out')) {
    return {
      code: 'TIMEOUT',
      message: 'The printer took too long to respond. Ensure it is powered on and within Bluetooth range.',
    };
  }
  if (msg.includes('gatt') || msg.includes('GATT')) {
    return {
      code: 'GATT_CONNECTION_FAILED',
      message: "RadhaCafe couldn't reach the printer. Make sure it's powered on and nearby.",
    };
  }

  return {
    code: 'WRITE_FAILED',
    message: msg || 'Printing failed. Check printer connection and try again.',
  };
}

export function isBluetoothSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    'bluetooth' in navigator
  );
}

export function isGetDevicesSupported(): boolean {
  return (
    isBluetoothSupported() &&
    typeof (navigator as any).bluetooth.getDevices === 'function'
  );
}

export function isSecureContext(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.isSecureContext ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );
}

/**
 * Retrieves previously granted Bluetooth devices from the browser origin
 */
export async function getPreviouslyGrantedPrinters(): Promise<{ id: string; name: string }[]> {
  if (!isGetDevicesSupported()) return [];
  try {
    const devices = await (navigator as any).bluetooth.getDevices();
    return (devices || []).map((d: any) => ({
      id: d.id,
      name: d.name || 'Bluetooth Printer',
    }));
  } catch (err) {
    return [];
  }
}

export function buildPrinterRequestOptions() {
  return {
    acceptAllDevices: true,
    optionalServices: getAllSupportedServiceUuids(),
  };
}

export interface VerifiedConnectionResult {
  device: any;
  gattServer: any;
  service: any;
  characteristic: any;
  profile: PrinterProfile;
  serviceUuid: string;
  characteristicUuid: string;
  writeMode: 'with-response' | 'without-response';
  chunkSize: number;
}

/**
 * Connects GATT server, discovers services, locates writable characteristic, and verifies profile
 */
async function setupDeviceConnection(
  device: any,
  onDisconnect?: () => void,
  onStageChange?: (stage: ConnectionStage) => void,
  preferredServiceUuid?: string | null,
  preferredCharacteristicUuid?: string | null
): Promise<VerifiedConnectionResult> {
  // Clean up previous disconnect listener
  if (disconnectListener && connectedDevice) {
    try {
      connectedDevice.removeEventListener('gattserverdisconnected', disconnectListener);
    } catch {
      // Ignore cleanup error
    }
  }

  onStageChange?.('connecting_gatt');
  logEvent(`Connecting GATT server to ${device.name || device.id}...`);

  let server = device.gatt;
  if (!server) {
    throw new Error('Selected Bluetooth device does not expose GATT server.');
  }

  if (!server.connected) {
    server = await device.gatt.connect();
  }
  connectedDevice = device;
  activeGattServer = server;

  if (onDisconnect) {
    disconnectListener = () => {
      connectedDevice = null;
      writeCharacteristic = null;
      activeGattServer = null;
      isWriteLocked = false;
      logEvent(`Printer ${device.name || device.id} disconnected.`);
      onDisconnect();
    };
    device.addEventListener('gattserverdisconnected', disconnectListener);
  }

  onStageChange?.('discovering_service');
  logEvent('Discovering thermal printer GATT services...');

  let foundCharacteristic: any = null;
  let foundService: any = null;
  let detectedProfile: PrinterProfile = getPrinterProfile('generic-ble-escpos');

  onStageChange?.('preparing_channel');
  logEvent('Locating writable ESC/POS printing characteristic...');

  // Strategy 1: If preferred/saved service UUID is known, attempt direct resolution
  if (preferredServiceUuid) {
    try {
      const directService = await server.getPrimaryService(preferredServiceUuid.toLowerCase());
      if (directService) {
        const chars = await directService.getCharacteristics();
        for (const char of chars) {
          if (
            preferredCharacteristicUuid &&
            char.uuid.toLowerCase() === preferredCharacteristicUuid.toLowerCase() &&
            (char.properties.write || char.properties.writeWithoutResponse)
          ) {
            foundCharacteristic = char;
            foundService = directService;
            detectedProfile = matchProfileByServiceUuid(directService.uuid);
            break;
          }
          if (char.properties.write || char.properties.writeWithoutResponse) {
            foundCharacteristic = char;
            foundService = directService;
            detectedProfile = matchProfileByServiceUuid(directService.uuid);
            break;
          }
        }
      }
    } catch {
      // Fallback to broader discovery
    }
  }

  // Strategy 2: Call getPrimaryServices() to inspect all authorized services
  if (!foundCharacteristic || !foundService) {
    try {
      const services = await server.getPrimaryServices();
      for (const service of services) {
        try {
          const chars = await service.getCharacteristics();
          for (const char of chars) {
            if (char.properties.write || char.properties.writeWithoutResponse) {
              foundCharacteristic = char;
              foundService = service;
              detectedProfile = matchProfileByServiceUuid(service.uuid);
              break;
            }
          }
          if (foundCharacteristic) break;
        } catch {
          // Inspect next service
        }
      }
    } catch {
      // Fallback to individual service probe
    }
  }

  // Strategy 3: Iterate through registered supported service UUIDs individually
  if (!foundCharacteristic || !foundService) {
    const allKnownUuids = getAllSupportedServiceUuids();
    for (const uuid of allKnownUuids) {
      try {
        const directService = await server.getPrimaryService(uuid);
        if (directService) {
          const chars = await directService.getCharacteristics();
          for (const char of chars) {
            if (char.properties.write || char.properties.writeWithoutResponse) {
              foundCharacteristic = char;
              foundService = directService;
              detectedProfile = matchProfileByServiceUuid(directService.uuid);
              break;
            }
          }
          if (foundCharacteristic) break;
        }
      } catch {
        // Continue searching next profile UUID
      }
    }
  }

  if (!foundCharacteristic || !foundService) {
    throw new Error('The selected printer does not expose a writable ESC/POS printing service.');
  }

  writeCharacteristic = foundCharacteristic;

  const writeMode = foundCharacteristic.properties.writeWithoutResponse
    ? 'without-response'
    : 'with-response';

  onStageChange?.('ready');
  logEvent(`Printer ${device.name || device.id} ready (${detectedProfile.name}, ${writeMode}).`);

  return {
    device,
    gattServer: server,
    service: foundService,
    characteristic: foundCharacteristic,
    profile: detectedProfile,
    serviceUuid: foundService.uuid,
    characteristicUuid: foundCharacteristic.uuid,
    writeMode,
    chunkSize: detectedProfile.defaultChunkSize || BLE_CHUNK_SIZE,
  };
}

/**
 * User-gesture triggered printer scan and pairing dialog
 */
export async function requestAndVerifyPrinter(
  onDisconnect?: () => void,
  onStageChange?: (stage: ConnectionStage) => void
): Promise<VerifiedConnectionResult> {
  if (!isBluetoothSupported()) {
    throw new Error('Web Bluetooth API is not supported in this browser.');
  }

  if (!isSecureContext()) {
    throw new Error('Web Bluetooth requires a secure HTTPS or localhost context.');
  }

  if (activeConnectionPromise) {
    return activeConnectionPromise;
  }

  const connectTask = async () => {
    onStageChange?.('requesting');
    logEvent('Opening Web Bluetooth device chooser with verified options...');

    const requestOptions = buildPrinterRequestOptions();

    const device = await (navigator as any).bluetooth.requestDevice(requestOptions);

    if (!device) {
      throw new Error('User cancelled printer selection.');
    }

    logEvent(`Device selected: ${device.name || device.id}`);
    return setupDeviceConnection(device, onDisconnect, onStageChange);
  };

  try {
    activeConnectionPromise = connectTask();
    const result = await activeConnectionPromise;
    return result;
  } finally {
    activeConnectionPromise = null;
  }
}

/**
 * Connects a previously saved printer without opening the native device chooser.
 * Uses navigator.bluetooth.getDevices() to find the browser-authorized device.
 */
export async function connectSavedPrinter(
  deviceId: string,
  onDisconnect?: () => void,
  onStageChange?: (stage: ConnectionStage) => void,
  preferredServiceUuid?: string | null,
  preferredCharacteristicUuid?: string | null
): Promise<VerifiedConnectionResult> {
  if (!isGetDevicesSupported()) {
    throw new Error('Direct device reconnection is not supported in this browser.');
  }

  if (activeConnectionPromise) {
    return activeConnectionPromise;
  }

  const connectTask = async () => {
    logEvent(`Looking for granted device ID: ${deviceId}...`);
    const devices = await (navigator as any).bluetooth.getDevices();
    const targetDevice = (devices || []).find((d: any) => d.id === deviceId);

    if (!targetDevice) {
      logEvent(`Device ID ${deviceId} not found in granted devices. Permission required.`);
      const err: any = new Error('permission-required');
      err.code = 'PERMISSION_REQUIRED';
      throw err;
    }

    logEvent(`Found granted device ${targetDevice.name || targetDevice.id}. Connecting GATT...`);
    return setupDeviceConnection(
      targetDevice,
      onDisconnect,
      onStageChange,
      preferredServiceUuid,
      preferredCharacteristicUuid
    );
  };

  try {
    activeConnectionPromise = connectTask();
    const result = await activeConnectionPromise;
    return result;
  } finally {
    activeConnectionPromise = null;
  }
}

/**
 * Probes the state of a device connection without disturbing ongoing print queues or emitting user errors
 */
export interface PrinterProbeResult {
  isSupported: boolean;
  isSecure: boolean;
  isGetDevicesSupported: boolean;
  deviceFoundInBrowser: boolean;
  deviceName?: string;
  isGattConnected: boolean;
  serviceFound: boolean;
  serviceUuid?: string;
  characteristicFound: boolean;
  characteristicUuid?: string;
  writeMode?: 'with-response' | 'without-response';
  profileKey?: string;
  error?: string;
}

export async function probeDeviceConnection(
  deviceId: string,
  preferredServiceUuid?: string | null
): Promise<PrinterProbeResult> {
  const result: PrinterProbeResult = {
    isSupported: isBluetoothSupported(),
    isSecure: isSecureContext(),
    isGetDevicesSupported: isGetDevicesSupported(),
    deviceFoundInBrowser: false,
    isGattConnected: false,
    serviceFound: false,
    characteristicFound: false,
  };

  if (!result.isSupported || !result.isGetDevicesSupported) {
    return result;
  }

  try {
    const devices = await (navigator as any).bluetooth.getDevices();
    const target = (devices || []).find((d: any) => d.id === deviceId);

    if (!target) {
      return result;
    }

    result.deviceFoundInBrowser = true;
    result.deviceName = target.name || 'Bluetooth Printer';
    result.isGattConnected = Boolean(target.gatt?.connected);

    // If already connected at browser runtime, probe services
    if (target.gatt?.connected) {
      if (writeCharacteristic && target.id === connectedDevice?.id) {
        result.serviceFound = true;
        result.serviceUuid = writeCharacteristic.service?.uuid;
        result.characteristicFound = true;
        result.characteristicUuid = writeCharacteristic.uuid;
        result.writeMode = writeCharacteristic.properties.writeWithoutResponse ? 'without-response' : 'with-response';
      }
    }
  } catch (err: any) {
    result.error = err?.message;
  }

  return result;
}

/**
 * Attempts to revoke browser permission via BluetoothDevice.forget() if supported
 */
export async function forgetBrowserDevice(deviceId: string): Promise<boolean> {
  if (!isGetDevicesSupported()) return false;
  try {
    const devices = await (navigator as any).bluetooth.getDevices();
    const targetDevice = (devices || []).find((d: any) => d.id === deviceId);
    if (targetDevice && typeof targetDevice.forget === 'function') {
      await targetDevice.forget();
      logEvent(`Browser permission forgotten for device: ${targetDevice.name || deviceId}`);
      return true;
    }
  } catch (err) {
    logEvent(`Failed to forget browser device: ${(err as any)?.message}`);
  }
  return false;
}

/**
 * Transmits ESC/POS byte payload using sequential BLE chunking and flow control
 */
export async function sendEscPosData(
  data: Uint8Array,
  chunkSize = BLE_CHUNK_SIZE,
  writeMode?: 'with-response' | 'without-response'
): Promise<void> {
  if (!writeCharacteristic) {
    throw new Error('Printer is disconnected. Please connect thermal printer first.');
  }

  if (isWriteLocked) {
    throw new Error('A receipt print operation is currently in progress.');
  }

  try {
    isWriteLocked = true;
    logEvent(`Transmitting ${data.length} bytes to thermal printer...`);

    const useWithoutResponse =
      writeMode === 'without-response' ||
      (!writeMode && Boolean(writeCharacteristic.properties.writeWithoutResponse));

    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);

      if (useWithoutResponse && typeof writeCharacteristic.writeValueWithoutResponse === 'function') {
        await writeCharacteristic.writeValueWithoutResponse(chunk);
      } else {
        await writeCharacteristic.writeValue(chunk);
      }

      // 15ms flow control delay between BLE transmission chunks
      await new Promise((resolve) => setTimeout(resolve, 15));
    }
    logEvent('Receipt byte stream successfully transmitted.');
  } catch (err) {
    logEvent(`Transmission failed: ${(err as any)?.message || 'Unknown error'}`);
    throw err;
  } finally {
    isWriteLocked = false;
  }
}

/**
 * Safely disconnects GATT server and resets runtime references
 */
export function disconnectBluetoothPrinter(): void {
  if (connectedDevice && connectedDevice.gatt && connectedDevice.gatt.connected) {
    try {
      connectedDevice.gatt.disconnect();
    } catch {
      // Ignore disconnect errors
    }
  }
  logEvent('Printer disconnected.');
  connectedDevice = null;
  writeCharacteristic = null;
  activeGattServer = null;
  isWriteLocked = false;
}

export function getCurrentConnectedDevice() {
  return connectedDevice;
}

export function getWriteCharacteristic() {
  return writeCharacteristic;
}

export function getActiveGattServer() {
  return activeGattServer;
}
