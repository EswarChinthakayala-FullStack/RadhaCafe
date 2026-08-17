import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  normalizeBluetoothUuid,
  getAllSupportedServiceUuids,
  matchProfileByServiceUuid,
} from '../printerProfiles';
import { buildPrinterRequestOptions } from '../bluetoothPrinter';

describe('Bluetooth Printer Profiles & Request Options', () => {
  it('normalizes 16-bit short UUIDs to full 128-bit format', () => {
    expect(normalizeBluetoothUuid('18f0')).toBe('000018f0-0000-1000-8000-00805f9b34fb');
    expect(normalizeBluetoothUuid('0x18f0')).toBe('000018f0-0000-1000-8000-00805f9b34fb');
    expect(normalizeBluetoothUuid('ff00')).toBe('0000ff00-0000-1000-8000-00805f9b34fb');
    expect(normalizeBluetoothUuid('000018f0-0000-1000-8000-00805f9b34fb')).toBe(
      '000018f0-0000-1000-8000-00805f9b34fb'
    );
  });

  it('collects all supported service UUIDs for optionalServices', () => {
    const uuids = getAllSupportedServiceUuids();
    expect(uuids.length).toBeGreaterThan(5);
    expect(uuids).toContain('000018f0-0000-1000-8000-00805f9b34fb');
    expect(uuids).toContain('0000ff00-0000-1000-8000-00805f9b34fb');
    expect(uuids).toContain('0000fff0-0000-1000-8000-00805f9b34fb');
    expect(uuids).toContain('49535343-fe7d-4ae5-8fa9-9fafd205e455');
  });

  it('builds centralized requestDevice options with all optionalServices', () => {
    const options = buildPrinterRequestOptions();
    expect(options.acceptAllDevices).toBe(true);
    expect(Array.isArray(options.optionalServices)).toBe(true);
    expect(options.optionalServices.length).toBeGreaterThan(5);
  });

  it('matches profiles correctly by normalized service UUID', () => {
    const profile1 = matchProfileByServiceUuid('000018f0-0000-1000-8000-00805f9b34fb');
    expect(profile1.key).toBe('generic-ble-escpos');

    const profile2 = matchProfileByServiceUuid('49535343-fe7d-4ae5-8fa9-9fafd205e455');
    expect(profile2.key).toBe('issc-transparent');

    const profile3 = matchProfileByServiceUuid('18f0');
    expect(profile3.key).toBe('generic-ble-escpos');
  });
});
