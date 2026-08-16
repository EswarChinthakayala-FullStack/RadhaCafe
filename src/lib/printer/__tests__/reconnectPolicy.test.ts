import { describe, it, expect } from 'vitest';
import {
  FAST_RETRY_DELAYS,
  BACKGROUND_RETRY_INTERVAL_MS,
  getReconnectDelay,
  isFastRecoveryPhase,
  isRetryablePrinterError,
} from '../reconnectPolicy';

describe('Printer Reconnection Policy', () => {
  it('should return progressive backoff delays during fast recovery phase', () => {
    expect(getReconnectDelay(0)).toBe(500);
    expect(getReconnectDelay(1)).toBe(1000);
    expect(getReconnectDelay(2)).toBe(2000);
    expect(getReconnectDelay(3)).toBe(4000);
    expect(getReconnectDelay(4)).toBe(8000);
  });

  it('should return background interval once fast recovery phase is exhausted', () => {
    expect(getReconnectDelay(5)).toBe(BACKGROUND_RETRY_INTERVAL_MS);
    expect(getReconnectDelay(6)).toBe(BACKGROUND_RETRY_INTERVAL_MS);
    expect(getReconnectDelay(20)).toBe(BACKGROUND_RETRY_INTERVAL_MS);
  });

  it('should correctly identify fast vs background recovery phases', () => {
    expect(isFastRecoveryPhase(0)).toBe(true);
    expect(isFastRecoveryPhase(4)).toBe(true);
    expect(isFastRecoveryPhase(5)).toBe(false);
    expect(isFastRecoveryPhase(10)).toBe(false);
  });

  it('should classify transient and permanent errors accurately', () => {
    // Retryable
    expect(isRetryablePrinterError('GATT_CONNECTION_FAILED')).toBe(true);
    expect(isRetryablePrinterError('TIMEOUT')).toBe(true);
    expect(isRetryablePrinterError('DEVICE_NOT_FOUND')).toBe(true);
    expect(isRetryablePrinterError('WRITE_FAILED')).toBe(true);
    expect(isRetryablePrinterError(null)).toBe(true);

    // Non-retryable without user action
    expect(isRetryablePrinterError('PERMISSION_REQUIRED')).toBe(false);
    expect(isRetryablePrinterError('PERMISSION_DENIED')).toBe(false);
    expect(isRetryablePrinterError('BLUETOOTH_UNSUPPORTED')).toBe(false);
    expect(isRetryablePrinterError('NOT_SECURE_CONTEXT')).toBe(false);
    expect(isRetryablePrinterError('UNSUPPORTED_PRINTER')).toBe(false);
  });
});
