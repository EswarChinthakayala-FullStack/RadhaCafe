import { BLE_CHUNK_SIZE } from '../../constants/printerCommands';
import type { PrintExecutionResult } from '../../types/printer.types';
import { getWriteCharacteristic, logEvent } from './bluetoothPrinter';

let isPrintLocked = false;

export interface PrintJobOptions {
  data: Uint8Array;
  chunkSize?: number;
  writeMode?: 'with-response' | 'without-response';
  orderId?: string;
}

/**
 * Serialized ESC/POS print transmitter with byte progress tracking and partial-write protection.
 */
export async function executePrintJob(options: PrintJobOptions): Promise<PrintExecutionResult> {
  const { data, chunkSize = BLE_CHUNK_SIZE, writeMode, orderId } = options;

  if (isPrintLocked) {
    return {
      status: 'error',
      message: 'A receipt is currently printing. Please wait a moment.',
      orderId,
    };
  }

  const characteristic = getWriteCharacteristic();
  if (!characteristic) {
    return {
      status: 'not-started-printer-offline',
      message: 'Printer is disconnected. Please ensure it is powered on and within range.',
      orderId,
      bytesWritten: 0,
      totalBytes: data.length,
    };
  }

  isPrintLocked = true;
  let bytesWritten = 0;
  const totalBytes = data.length;

  try {
    logEvent(`Starting receipt transmission: ${totalBytes} bytes (${Math.ceil(totalBytes / chunkSize)} chunks)...`);

    const useWithoutResponse =
      writeMode === 'without-response' ||
      (!writeMode && Boolean(characteristic.properties.writeWithoutResponse));

    for (let i = 0; i < totalBytes; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);

      try {
        if (useWithoutResponse && typeof characteristic.writeValueWithoutResponse === 'function') {
          await characteristic.writeValueWithoutResponse(chunk);
        } else {
          await characteristic.writeValue(chunk);
        }
        bytesWritten += chunk.length;
      } catch (chunkErr: any) {
        logEvent(`BLE write interrupted at byte ${bytesWritten}/${totalBytes}: ${chunkErr?.message || ''}`);

        if (bytesWritten === 0) {
          // Failure before any byte was sent -> safe for immediate retry
          return {
            status: 'not-started-printer-offline',
            message: 'Printer connection dropped before printing started.',
            orderId,
            bytesWritten: 0,
            totalBytes,
          };
        }

        // Failure during multi-chunk write -> Do NOT duplicate automatically
        return {
          status: 'write-interrupted',
          message: 'Printing was interrupted. Check the physical receipt before reprinting.',
          orderId,
          bytesWritten,
          totalBytes,
        };
      }

      // 15ms flow control delay between BLE chunks
      await new Promise((resolve) => setTimeout(resolve, 15));
    }

    logEvent(`Successfully printed receipt: ${totalBytes} bytes sent.`);
    return {
      status: 'printed-sent',
      message: 'Receipt printed successfully.',
      orderId,
      bytesWritten: totalBytes,
      totalBytes,
    };
  } catch (err: any) {
    logEvent(`Print job failed: ${err?.message || 'Unknown error'}`);
    return {
      status: bytesWritten > 0 ? 'write-interrupted' : 'error',
      message: err?.message || 'Printing failed.',
      orderId,
      bytesWritten,
      totalBytes,
    };
  } finally {
    isPrintLocked = false;
  }
}

export function isPrintQueueBusy(): boolean {
  return isPrintLocked;
}
