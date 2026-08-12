import { BLE_CHUNK_SIZE } from '../../constants/printerCommands';

/**
 * Common Bluetooth Thermal Printer GATT Service UUIDs
 * Note: These can be customized for specific hardware vendors.
 */
export const DEFAULT_PRINTER_SERVICE_UUIDS = [
  '000018f0-0000-1000-8000-00805f9b34fb', // Standard ESC/POS BLE Service
  '49535343-fe7d-4ae5-8fa9-9fafd205e455', // ISSC Transparent Service
  '0000ff00-0000-1000-8000-00805f9b34fb', // General Thermal Printer Service
  '0000e7b0-0000-1000-8000-00805f9b34fb', // Munbyn / ZJiang Printer Service
];

let connectedDevice: any = null;
let writeCharacteristic: any = null;
let disconnectListener: (() => void) | null = null;
let isWriteLocked = false; // BLE Write Mutex Lock to protect from concurrent write collisions

export type PrinterErrorCode =
  | 'BLUETOOTH_UNSUPPORTED'
  | 'NOT_SECURE_CONTEXT'
  | 'PERMISSION_DENIED'
  | 'DEVICE_NOT_FOUND'
  | 'GATT_CONNECTION_FAILED'
  | 'CHARACTERISTIC_NOT_FOUND'
  | 'WRITE_FAILED'
  | 'PRINT_LOCKED'
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
      message: 'Web Bluetooth API is not supported in this browser. Please use Chrome, Edge, or Bluefy on iOS.',
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
      message: 'Printer connection was cancelled by user.',
    };
  }
  if (msg.includes('locked') || msg.includes('concurrent')) {
    return {
      code: 'PRINT_LOCKED',
      message: 'A receipt print operation is currently in progress. Please wait.',
    };
  }
  if (msg.includes('characteristic') || msg.includes('service')) {
    return {
      code: 'CHARACTERISTIC_NOT_FOUND',
      message: 'The selected printer does not expose the configured ESC/POS Bluetooth service or characteristic.',
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
 * Initiates Bluetooth device selection (MUST originate from user click handler)
 */
export async function requestBluetoothPrinter(onDisconnect?: () => void): Promise<any> {
  if (!isBluetoothSupported()) {
    throw new Error('Web Bluetooth API is not supported in this browser.');
  }

  if (!isSecureContext()) {
    throw new Error('Web Bluetooth requires a secure HTTPS or localhost context.');
  }

  // 1. Prompt browser device picker dialog (Triggered by user gesture)
  const device = await (navigator as any).bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: DEFAULT_PRINTER_SERVICE_UUIDS,
  });

  if (!device) {
    throw new Error('User cancelled printer selection.');
  }

  // Clean up previous event listener
  if (disconnectListener && connectedDevice) {
    try {
      connectedDevice.removeEventListener('gattserverdisconnected', disconnectListener);
    } catch {
      // Ignore cleanup error
    }
  }

  // 2. Connect GATT Server
  const server = await device.gatt.connect();
  connectedDevice = device;

  // 3. Register disconnect listener
  if (onDisconnect) {
    disconnectListener = () => {
      connectedDevice = null;
      writeCharacteristic = null;
      isWriteLocked = false;
      onDisconnect();
    };
    device.addEventListener('gattserverdisconnected', disconnectListener);
  }

  // 4. Discover Primary Services and Writable Characteristic
  const services = await server.getPrimaryServices();
  writeCharacteristic = null;

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
      // Continue inspecting next service
    }
  }

  if (!writeCharacteristic) {
    throw new Error('The selected printer does not expose a writable thermal printing service.');
  }

  return device;
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
  } catch (err) {
    // Terminate write on error immediately
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
  connectedDevice = null;
  writeCharacteristic = null;
  isWriteLocked = false;
}
