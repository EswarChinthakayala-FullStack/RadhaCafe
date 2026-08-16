import type { PrinterErrorCode } from '../../types/printer.types';

/**
 * Reconnection policy constants for RadhaCafe POS
 */

// Phase 1: Fast progressive recovery attempts for momentary radio/GATT drops (approx 15.5s total)
export const FAST_RETRY_DELAYS = [500, 1000, 2000, 4000, 8000] as const;

// Phase 2: Low-frequency background recovery interval while admin is signed in (every 30s)
export const BACKGROUND_RETRY_INTERVAL_MS = 30000;

// Maximum time to await automatic reconnection during order checkout before falling back gracefully
export const PRINT_RECOVERY_TIMEOUT_MS = 6000;

// Application-level connection health watchdog interval
export const WATCHDOG_INTERVAL_MS = 20000;

// Debounce delay for window focus / visibility resumption health checks
export const FOCUS_DEBOUNCE_MS = 1000;

/**
 * Determines whether a printer error code is retryable automatically without user gesture
 */
export function isRetryablePrinterError(code: PrinterErrorCode | string | null | undefined): boolean {
  if (!code) return true;

  switch (code) {
    case 'PERMISSION_REQUIRED':
    case 'PERMISSION_DENIED':
    case 'BLUETOOTH_UNSUPPORTED':
    case 'NOT_SECURE_CONTEXT':
    case 'UNSUPPORTED_PRINTER':
      return false;
    default:
      return true;
  }
}

/**
 * Calculates retry delay based on current attempt sequence
 */
export function getReconnectDelay(attemptIndex: number): number {
  if (attemptIndex < FAST_RETRY_DELAYS.length) {
    return FAST_RETRY_DELAYS[attemptIndex];
  }
  return BACKGROUND_RETRY_INTERVAL_MS;
}

/**
 * Checks if the retry attempt index is within the fast recovery phase
 */
export function isFastRecoveryPhase(attemptIndex: number): boolean {
  return attemptIndex < FAST_RETRY_DELAYS.length;
}
