import { BLE_CHUNK_SIZE } from '../../constants/printerCommands';

/**
 * Common Bluetooth Thermal Printer GATT Service UUIDs
 */
export const DEFAULT_PRINTER_SERVICE_UUIDS = [
  '000018f0-0000-1000-8000-00805f9b34fb', // Standard ESC/POS BLE Service
  '49535343-fe7d-4ae5-8fa9-9fafd205e455', // ISSC Transparent Service
  '0000ff00-0000-1000-8000-00805f9b34fb', // General Thermal Printer Service
  '0000e7b0-0000-1000-8000-00805f9b34fb', // Munbyn / ZJiang Printer Service
];

export type ConnectionStage =
  | 'idle'
  | 'requesting'
  | 'connecting_gatt'
  | 'discovering_service'
  | 'preparing_channel'
  | 'ready';

let connectedDevice: any = null;
let writeCharacteristic: any = null;
let disconnectListener: (() => void) | null = null;
let isWriteLocked = false; // BLE Write Mutex Lock to protect from concurrent write collisions
const eventLog: { timestamp: string; message: string }[] = [];

function logEvent(message: string) {
  const time = new Date().toLocaleTimeString('en-US', { hour12: false });
  eventLog.unshift({ timestamp: time, message });
  if (eventLog.length > 50) eventLog.pop();
}

export function getPrinterEventLog() {
  return [...eventLog];
}

export type PrinterErrorCode =
  | 'BLUETOOTH_UNSUPPORTED'
  | 'NOT_SECURE_CONTEXT'
  | 'PERMISSION_DENIED'
  | 'DEVICE_NOT_FOUND'
  | 'GATT_CONNECTION_FAILED'
  | 'CHARACTERISTIC_NOT_FOUND'
  | 'WRITE_FAILED'
  | 'PRINT_LOCKED'
  | 'TIMEOUT'
  | 'UNKNOWN';

export interface NormalizedPrinterError {
  code: PrinterErrorCode;
  message: string;
}

/**
 * Normalizes raw DOM/Bluetooth exceptions into user-friendly application error messages.
 */
export function normalizePrinterError(err: any): NormalizedPrinterError {
  const msg = err?.message || String(err || '');

  if (msg.includes('not supported') || msg.includes('navigator.bluetooth')) {
    return {
      code: 'BLUETOOTH_UNSUPPORTED',
      message: 'Web Bluetooth API is not supported in this browser. Please use Google Chrome or Microsoft Edge.',
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
  if (msg.includes('locked') || msg.includes('concurrent')) {
    return {
      code: 'PRINT_LOCKED',
      message: 'A receipt print operation is currently in progress. Please wait a moment.',
    };
  }
  if (msg.includes('characteristic') || msg.includes('service') || msg.includes('writable')) {
    return {
      code: 'CHARACTERISTIC_NOT_FOUND',
      message: 'The selected device is not a compatible ESC/POS thermal printer with writable print service.',
    };
  }
  if (msg.includes('timeout') || msg.includes('timed out')) {
    return {
      code: 'TIMEOUT',
      message: 'The printer took too long to respond. Ensure it is powered on and within Bluetooth range.',
    };
  }

  return {
    code: 'WRITE_FAILED',
    message: msg || 'Printing failed. Check printer connection and try again.',
  };
}

/**
 * Feature-detection helper verifying browser & window environment safely
 */
export function isBluetoothSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    'bluetooth' in navigator
  );
}

/**
 * Checks if getDevices API is supported to retrieve previously authorized devices
 */
export function isGetDevicesSupported(): boolean {
  return (
    isBluetoothSupported() &&
    typeof (navigator as any).bluetooth.getDevices === 'function'
  );
}

/**
 * Checks if current context is secure (HTTPS or localhost) required for Web Bluetooth
 */
export function isSecureContext(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.isSecureContext ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );
}

/**
 * Retrieves previously granted Bluetooth devices (without prompting device picker)
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

/**
 * Connects and configures a BluetoothDevice object (GATT -> Services -> Writable Characteristic)
 */
async function setupDeviceConnection(
  device: any,
  onDisconnect?: () => void,
  onStageChange?: (stage: ConnectionStage) => void
): Promise<any> {
  // Clean up previous event listener
  if (disconnectListener && connectedDevice) {
    try {
      connectedDevice.removeEventListener('gattserverdisconnected', disconnectListener);
    } catch {
      // Ignore cleanup error
    }
  }

  onStageChange?.('connecting_gatt');
  logEvent(`Connecting GATT server to ${device.name || device.id}...`);

  const server = await device.gatt.connect();
  connectedDevice = device;

  if (onDisconnect) {
    disconnectListener = () => {
      connectedDevice = null;
      writeCharacteristic = null;
      isWriteLocked = false;
      logEvent(`Printer ${device.name || device.id} disconnected.`);
      onDisconnect();
    };
    device.addEventListener('gattserverdisconnected', disconnectListener);
  }

  onStageChange?.('discovering_service');
  logEvent('Discovering thermal printer GATT services...');

  const services = await server.getPrimaryServices();
  writeCharacteristic = null;

  onStageChange?.('preparing_channel');
  logEvent('Locating writable ESC/POS printing characteristic...');

  for (const service of services) {
    try {
      const characteristics = await service.getCharacteristics();
      for (const char of characteristics) {
        if (char.properties.write || char.properties.writeWithoutResponse) {
          writeCharacteristic = char;
          break;
        }
      }
      if (writeCharacteristic) break;
    } catch {
      // Inspect next service
    }
  }

  if (!writeCharacteristic) {
    throw new Error('The selected printer does not expose a writable thermal printing service.');
  }

  onStageChange?.('ready');
  logEvent(`Printer ${device.name || device.id} ready for receipt printing.`);
  return device;
}

/**
 * Initiates Bluetooth device selection (MUST originate from user click handler)
 */
export async function requestBluetoothPrinter(
  onDisconnect?: () => void,
  onStageChange?: (stage: ConnectionStage) => void
): Promise<any> {
  if (!isBluetoothSupported()) {
    throw new Error('Web Bluetooth API is not supported in this browser.');
  }

  if (!isSecureContext()) {
    throw new Error('Web Bluetooth requires a secure HTTPS or localhost context.');
  }

  onStageChange?.('requesting');
  logEvent('Opening Web Bluetooth device chooser...');

  // 1. Prompt browser device picker dialog (Triggered by user gesture)
  const device = await (navigator as any).bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: DEFAULT_PRINTER_SERVICE_UUIDS,
  });

  if (!device) {
    throw new Error('User cancelled printer selection.');
  }

  logEvent(`Device selected: ${device.name || device.id}`);
  return setupDeviceConnection(device, onDisconnect, onStageChange);
}

/**
 * Attempts direct reconnection to a previously granted Bluetooth device by ID (without opening chooser)
 */
export async function reconnectKnownPrinter(
  deviceId: string,
  onDisconnect?: () => void,
  onStageChange?: (stage: ConnectionStage) => void
): Promise<any> {
  if (!isGetDevicesSupported()) {
    throw new Error('Direct device reconnection is not supported in this browser.');
  }

  const devices = await (navigator as any).bluetooth.getDevices();
  const targetDevice = devices.find((d: any) => d.id === deviceId);

  if (!targetDevice) {
    throw new Error('Previously paired printer was not found. Please scan and pair again.');
  }

  logEvent(`Attempting direct reconnect to ${targetDevice.name || targetDevice.id}...`);
  return setupDeviceConnection(targetDevice, onDisconnect, onStageChange);
}

/**
 * Sends ESC/POS byte payload using sequential BLE chunking & flow control
 */
export async function sendEscPosData(data: Uint8Array, chunkSize = BLE_CHUNK_SIZE): Promise<void> {
  if (!writeCharacteristic) {
    throw new Error('Printer is disconnected. Please connect thermal printer first.');
  }

  if (isWriteLocked) {
    throw new Error('A receipt print operation is currently in progress.');
  }

  try {
    isWriteLocked = true;
    logEvent(`Transmitting ${data.length} bytes to thermal printer...`);
    const useWithoutResponse = Boolean(writeCharacteristic.properties.writeWithoutResponse);

    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);

      if (useWithoutResponse) {
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
 * Safely disconnects GATT server and clears runtime Bluetooth references
 */
export function disconnectBluetoothPrinter(): void {
  if (connectedDevice && connectedDevice.gatt && connectedDevice.gatt.connected) {
    try {
      connectedDevice.gatt.disconnect();
    } catch {
      // Ignore disconnect errors
    }
  }
  logEvent('Printer disconnected by user.');
  connectedDevice = null;
  writeCharacteristic = null;
  isWriteLocked = false;
}

export function getCurrentConnectedDevice() {
  return connectedDevice;
}

export function getWriteCharacteristic() {
  return writeCharacteristic;
}
