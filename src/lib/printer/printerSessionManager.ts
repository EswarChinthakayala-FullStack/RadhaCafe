import { usePrinterStore } from '../../store/printerStore';
import type {
  ConnectionStage,
  SavedPrinter,
} from '../../types/printer.types';
import {
  connectSavedPrinter,
  requestAndVerifyPrinter,
  disconnectBluetoothPrinter,
  forgetBrowserDevice,
  isBluetoothSupported,
  isGetDevicesSupported,
  normalizePrinterError,
  logEvent,
  getCurrentConnectedDevice,
  type VerifiedConnectionResult,
} from './bluetoothPrinter';
import {
  fetchPrinterSettings,
  fetchSavedPrinters,
  fetchPreferredPrinter,
  saveVerifiedPrinter,
  updateSavedPrinter,
  setPreferredPrinter,
  removeSavedPrinter,
  recordPrinterConnectionSuccess,
} from '../supabase/queries/printer';
import { getPrinterProfile } from './printerProfiles';
import {
  FAST_RETRY_DELAYS,
  BACKGROUND_RETRY_INTERVAL_MS,
  PRINT_RECOVERY_TIMEOUT_MS,
  WATCHDOG_INTERVAL_MS,
  FOCUS_DEBOUNCE_MS,
  isRetryablePrinterError,
} from './reconnectPolicy';

class PrinterSessionManager {
  private sessionGeneration = 0;
  private activeConnectionPromise: Promise<boolean> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private watchdogTimer: ReturnType<typeof setInterval> | null = null;
  private focusDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private isInitialized = false;
  private cachedPreferredPrinter: SavedPrinter | null = null;
  private fastRetryIndex = 0;

  /**
   * Initializes the session manager once when authenticated admin logs in
   */
  public initializeSession(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;
    this.sessionGeneration++;

    const store = usePrinterStore.getState();
    store.resetForNewSession();

    if (!isBluetoothSupported()) {
      store.setStatus('unsupported');
      logEvent('Web Bluetooth not supported in this browser.');
      return;
    }

    logEvent('Starting persistent RadhaCafe printer session...');
    this.bootstrapStartupConnection();
    this.setupWatchdogs();
  }

  /**
   * Tears down runtime connection, cancels all timers, and cleans up listeners on logout
   */
  public teardownSession(): void {
    this.sessionGeneration++;
    this.isInitialized = false;
    this.clearAllTimers();
    this.cleanupWatchdogs();

    const store = usePrinterStore.getState();
    store.setDisconnectReason('logout');
    disconnectBluetoothPrinter();
    store.setConnectedDevice(null);
    store.setStatus('idle');
    this.cachedPreferredPrinter = null;
    logEvent('Printer session terminated on admin logout.');
  }

  /**
   * Startup sequence: reads settings & preferred printer, and silently reconnects via getDevices()
   */
  private async bootstrapStartupConnection(): Promise<void> {
    const currentGen = this.sessionGeneration;
    const store = usePrinterStore.getState();
    store.setStatus('restoring');
    store.setConnectionStage('idle');

    try {
      const [settings, savedPrinters] = await Promise.all([
        fetchPrinterSettings().catch(() => null),
        fetchSavedPrinters().catch(() => []),
      ]);

      if (currentGen !== this.sessionGeneration) return;

      if (settings?.paper_width) {
        store.setPaperWidth(settings.paper_width);
      }
      if (settings?.auto_connect !== undefined) {
        store.setAutoConnect(settings.auto_connect);
      }

      if (settings?.auto_connect === false || !savedPrinters || savedPrinters.length === 0) {
        store.setStatus('disconnected');
        logEvent('Auto-connect disabled or no saved printers configured.');
        return;
      }

      // Determine preferred target printer
      const preferredId = settings?.preferred_printer_id;
      const targetPrinter =
        (preferredId ? savedPrinters.find((p) => p.id === preferredId) : null) ||
        savedPrinters.find((p) => p.is_enabled) ||
        savedPrinters[0];

      if (!targetPrinter || !targetPrinter.device_id) {
        store.setStatus('disconnected');
        return;
      }

      this.cachedPreferredPrinter = targetPrinter;

      if (!isGetDevicesSupported()) {
        store.setStatus('disconnected');
        logEvent('getDevices unsupported in this browser.');
        return;
      }

      logEvent(`Restoring connection to preferred printer: ${targetPrinter.friendly_name || targetPrinter.device_name}`);
      await this.executeConnection(targetPrinter, 'startup');
    } catch (err: any) {
      if (currentGen === this.sessionGeneration) {
        const normalized = normalizePrinterError(err);
        store.setError(normalized.message, normalized.code);
        store.setStatus('disconnected');
      }
    }
  }

  /**
   * Core GATT connection executor with generation token and mutex lock
   */
  private async executeConnection(targetPrinter: SavedPrinter, trigger: 'startup' | 'reconnect' | 'manual'): Promise<boolean> {
    const currentGen = this.sessionGeneration;
    const store = usePrinterStore.getState();

    // Prevent connecting if user manually disconnected in this session (unless trigger is manual)
    if (store.manualDisconnect && trigger !== 'manual') {
      logEvent('Suppressed automatic connection because user manually disconnected.');
      return false;
    }

    if (this.activeConnectionPromise) {
      return this.activeConnectionPromise;
    }

    const connectTask = async (): Promise<boolean> => {
      store.setStatus(trigger === 'startup' ? 'restoring' : 'reconnecting');
      store.setError(null);

      try {
        const verified: VerifiedConnectionResult = await connectSavedPrinter(
          targetPrinter.device_id,
          () => this.handleUnexpectedGattDisconnect(targetPrinter),
          (stage: ConnectionStage) => {
            if (currentGen === this.sessionGeneration) {
              usePrinterStore.getState().setConnectionStage(stage);
            }
          }
        );

        if (currentGen !== this.sessionGeneration) {
          // Connection was superseded by another operation
          disconnectBluetoothPrinter();
          return false;
        }

        const profile = getPrinterProfile(verified.profile?.key || targetPrinter.profile_key);

        store.setConnectedDevice(
          {
            id: verified.device.id,
            name: verified.device.name || targetPrinter.device_name || 'Bluetooth Printer',
            connected: true,
          },
          targetPrinter,
          profile
        );

        store.setStatus('ready');
        store.setConnectionStage('ready');
        store.recordSuccessfulConnection();
        this.fastRetryIndex = 0;
        this.clearReconnectTimer();

        logEvent(`Printer ${targetPrinter.friendly_name || targetPrinter.device_name} is Ready to print!`);
        recordPrinterConnectionSuccess(targetPrinter.device_id).catch(() => null);
        return true;
      } catch (err: any) {
        if (currentGen !== this.sessionGeneration) return false;

        const normalized = normalizePrinterError(err);

        if (normalized.code === 'PERMISSION_REQUIRED' || normalized.code === 'PERMISSION_DENIED') {
          logEvent('Browser permission required for preferred printer.');
          store.setError(normalized.message, normalized.code);
          store.setStatus('permission-required');
          store.setConnectionStage('idle');
          this.clearReconnectTimer();
          return false;
        }

        if (!isRetryablePrinterError(normalized.code)) {
          logEvent(`Non-retryable error encountered: ${normalized.code}`);
          store.setError(normalized.message, normalized.code);
          store.setStatus('error');
          store.setConnectionStage('idle');
          this.clearReconnectTimer();
          return false;
        }

        // Schedule next retry according to policy
        this.scheduleNextReconnect(targetPrinter);
        return false;
      }
    };

    try {
      this.activeConnectionPromise = connectTask();
      const result = await this.activeConnectionPromise;
      return result;
    } finally {
      this.activeConnectionPromise = null;
    }
  }

  /**
   * Handles physical or unexpected GATT disconnection
   */
  private handleUnexpectedGattDisconnect(targetPrinter: SavedPrinter): void {
    const store = usePrinterStore.getState();
    const reason = store.disconnectReason;

    store.setConnectedDevice(null);
    store.setConnectionStage('idle');
    store.recordDisconnection(reason || 'unexpected');

    // Intentional user disconnect -> Do not auto-reconnect
    if (store.manualDisconnect || reason === 'user' || reason === 'logout' || reason === 'switch') {
      store.setStatus('disconnected');
      logEvent('Manual disconnect active. Suppressing automatic reconnection.');
      return;
    }

    // Auto-connect disabled in settings -> Enter clean disconnected state
    if (!store.autoConnect) {
      store.setStatus('disconnected');
      logEvent('Auto-connect disabled. Interrupted connection will not retry.');
      return;
    }

    logEvent('Printer connection interrupted unexpectedly. Starting progressive recovery...');
    store.setStatus('reconnecting');
    this.fastRetryIndex = 0;
    this.scheduleNextReconnect(targetPrinter);
  }

  /**
   * Two-phase progressive reconnect scheduler (Fast Phase -> Background Phase)
   */
  private scheduleNextReconnect(targetPrinter: SavedPrinter): void {
    const currentGen = this.sessionGeneration;
    const store = usePrinterStore.getState();

    if (store.manualDisconnect || !store.autoConnect || !this.isInitialized) {
      return;
    }

    this.clearReconnectTimer();

    if (this.fastRetryIndex < FAST_RETRY_DELAYS.length) {
      // Phase 1: Fast Recovery
      const delay = FAST_RETRY_DELAYS[this.fastRetryIndex];
      this.fastRetryIndex++;
      store.setStatus('reconnecting');
      logEvent(`Fast recovery attempt ${this.fastRetryIndex}/${FAST_RETRY_DELAYS.length} scheduled in ${delay}ms...`);

      this.reconnectTimer = setTimeout(async () => {
        if (currentGen !== this.sessionGeneration) return;
        await this.executeConnection(targetPrinter, 'reconnect');
      }, delay);
    } else {
      // Phase 2: Background Recovery (Printer Offline, retrying every 30s)
      store.setStatus('offline');
      logEvent(`Fast recovery exhausted. Settled to Offline state. Background retry scheduled in ${BACKGROUND_RETRY_INTERVAL_MS / 1000}s...`);

      this.reconnectTimer = setTimeout(async () => {
        if (currentGen !== this.sessionGeneration) return;
        await this.executeConnection(targetPrinter, 'reconnect');
      }, BACKGROUND_RETRY_INTERVAL_MS);
    }
  }

  /**
   * User clicks "Scan & Connect" -> Opens native browser chooser with explicit gesture
   */
  public async scanAndConnectNewPrinter(customFriendlyName?: string): Promise<boolean> {
    this.sessionGeneration++;
    const currentGen = this.sessionGeneration;
    this.clearReconnectTimer();

    const store = usePrinterStore.getState();
    store.setManualDisconnect(false);
    store.setDisconnectReason(null);
    store.setStatus('connecting');
    store.setConnectionStage('requesting');
    store.setError(null);

    try {
      const verified: VerifiedConnectionResult = await requestAndVerifyPrinter(
        () => {
          if (this.cachedPreferredPrinter) {
            this.handleUnexpectedGattDisconnect(this.cachedPreferredPrinter);
          }
        },
        (stage: ConnectionStage) => {
          if (currentGen === this.sessionGeneration) {
            usePrinterStore.getState().setConnectionStage(stage);
          }
        }
      );

      if (currentGen !== this.sessionGeneration) return false;

      const profile = getPrinterProfile(verified.profile?.key);

      // Save verified printer to Supabase
      const saved = await saveVerifiedPrinter({
        device_id: verified.device.id,
        device_name: verified.device.name || 'Bluetooth Printer',
        friendly_name: customFriendlyName || verified.device.name || 'Counter Printer',
        profile_key: profile.key,
        service_uuid: verified.serviceUuid,
        characteristic_uuid: verified.characteristicUuid,
        write_mode: verified.writeMode,
        chunk_size: verified.chunkSize,
        paper_width: store.paperWidth || 32,
      }).catch(() => null);

      this.cachedPreferredPrinter = saved;

      store.setConnectedDevice(
        {
          id: verified.device.id,
          name: verified.device.name || 'Bluetooth Thermal Printer',
          connected: true,
        },
        saved,
        profile
      );

      store.setStatus('ready');
      store.setConnectionStage('ready');
      store.recordSuccessfulConnection();
      this.fastRetryIndex = 0;

      logEvent(`Paired and verified: ${verified.device.name || 'Thermal Printer'}`);
      return true;
    } catch (err: any) {
      if (currentGen !== this.sessionGeneration) return false;

      const normalized = normalizePrinterError(err);
      if (normalized.code === 'PERMISSION_DENIED') {
        store.setStatus('disconnected');
        store.setConnectionStage('idle');
        store.setError(null);
      } else {
        store.setError(normalized.message, normalized.code);
        store.setStatus('error');
        store.setConnectionStage('idle');
      }
      return false;
    }
  }

  /**
   * Connects to a specific saved printer explicitly
   */
  public async connectSaved(savedPrinter: SavedPrinter): Promise<boolean> {
    this.sessionGeneration++;
    this.clearReconnectTimer();

    const store = usePrinterStore.getState();
    store.setManualDisconnect(false);
    store.setDisconnectReason(null);
    this.cachedPreferredPrinter = savedPrinter;
    this.fastRetryIndex = 0;

    return this.executeConnection(savedPrinter, 'manual');
  }

  /**
   * Admin clicks "Reconnect Now"
   */
  public async reconnectNow(): Promise<boolean> {
    const store = usePrinterStore.getState();
    store.setManualDisconnect(false);
    store.setDisconnectReason(null);
    this.clearReconnectTimer();
    this.fastRetryIndex = 0;

    const target = this.cachedPreferredPrinter || (await fetchPreferredPrinter().catch(() => null));
    if (!target) {
      store.setError('No preferred printer configured.', 'DEVICE_NOT_FOUND');
      return false;
    }

    this.cachedPreferredPrinter = target;
    return this.executeConnection(target, 'manual');
  }

  /**
   * Admin explicitly clicks "Disconnect" -> suppress automatic reconnection for this session
   */
  public userDisconnect(): void {
    this.sessionGeneration++;
    this.clearAllTimers();

    const store = usePrinterStore.getState();
    store.setManualDisconnect(true);
    store.setDisconnectReason('user');
    disconnectBluetoothPrinter();
    store.setConnectedDevice(null);
    store.setStatus('disconnected');
    store.setConnectionStage('idle');
    logEvent('Printer manually disconnected by admin. Reconnection suppressed.');
  }

  /**
   * Forgets a saved printer
   */
  public async forgetSavedPrinter(savedPrinterId: string, deviceId?: string): Promise<void> {
    const store = usePrinterStore.getState();
    if (store.device?.id === deviceId || store.connectedPrinter?.id === savedPrinterId) {
      this.userDisconnect();
    }

    if (deviceId) {
      await forgetBrowserDevice(deviceId).catch(() => null);
    }

    await removeSavedPrinter(savedPrinterId);
    if (this.cachedPreferredPrinter?.id === savedPrinterId) {
      this.cachedPreferredPrinter = null;
    }
  }

  /**
   * Renames a saved printer
   */
  public async renameSavedPrinter(savedPrinterId: string, friendlyName: string): Promise<void> {
    await updateSavedPrinter(savedPrinterId, { friendly_name: friendlyName });
    if (this.cachedPreferredPrinter?.id === savedPrinterId) {
      this.cachedPreferredPrinter = { ...this.cachedPreferredPrinter, friendly_name: friendlyName };
    }
  }

  /**
   * Sets a saved printer as preferred
   */
  public async setSavedPrinterPreferred(savedPrinterId: string): Promise<void> {
    await setPreferredPrinter(savedPrinterId);
    const preferred = await fetchPreferredPrinter().catch(() => null);
    this.cachedPreferredPrinter = preferred;
    if (preferred && !usePrinterStore.getState().manualDisconnect) {
      this.connectSaved(preferred);
    }
  }

  /**
   * Health Check & Print Pre-flight: ensures printer is Ready or attempts short bounded recovery
   */
  public async ensurePrinterReady(timeoutMs = PRINT_RECOVERY_TIMEOUT_MS): Promise<{ ready: boolean; reason?: string }> {
    const store = usePrinterStore.getState();
    const currentDevice = getCurrentConnectedDevice();

    // 1. If status claims ready and GATT is physically connected -> immediate ready
    if ((store.status === 'ready' || store.status === 'connected') && currentDevice?.gatt?.connected) {
      return { ready: true };
    }

    // 2. If user manually disconnected, do not override choice
    if (store.manualDisconnect) {
      return { ready: false, reason: 'manually-disconnected' };
    }

    // 3. If permission required, do not open chooser
    if (store.status === 'permission-required') {
      return { ready: false, reason: 'permission-required' };
    }

    // 4. Attempt immediate short recovery window
    logEvent('Pre-print check detected disconnected printer. Initiating immediate recovery...');
    const target = this.cachedPreferredPrinter || (await fetchPreferredPrinter().catch(() => null));
    if (!target) {
      return { ready: false, reason: 'no-preferred-printer' };
    }

    try {
      const recoveryTask = this.executeConnection(target, 'reconnect');
      const timeoutTask = new Promise<boolean>((resolve) => setTimeout(() => resolve(false), timeoutMs));

      const success = await Promise.race([recoveryTask, timeoutTask]);
      if (success) {
        return { ready: true };
      }
      return { ready: false, reason: 'recovery-timed-out' };
    } catch {
      return { ready: false, reason: 'recovery-failed' };
    }
  }

  /**
   * Sets up background watchdog, visibility change, and window focus recovery listeners
   */
  private setupWatchdogs(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    // Periodic state-check watchdog (20s)
    this.watchdogTimer = setInterval(() => {
      const store = usePrinterStore.getState();
      if (store.manualDisconnect || !store.autoConnect || store.status !== 'ready') return;

      const currentDevice = getCurrentConnectedDevice();
      if (!currentDevice || !currentDevice.gatt || !currentDevice.gatt.connected) {
        logEvent('Watchdog detected silent GATT disconnect. Scheduling recovery...');
        if (this.cachedPreferredPrinter) {
          this.handleUnexpectedGattDisconnect(this.cachedPreferredPrinter);
        }
      }
    }, WATCHDOG_INTERVAL_MS);

    // Tab visibility recovery (Sleep/Wake & Background Tab Return)
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('focus', this.handleWindowFocus);
  }

  private handleVisibilityChange = (): void => {
    if (typeof document === 'undefined' || document.hidden) return;

    const store = usePrinterStore.getState();
    if (store.manualDisconnect || !store.autoConnect) return;

    const currentDevice = getCurrentConnectedDevice();
    if (!currentDevice?.gatt?.connected && (store.status === 'ready' || store.status === 'offline' || store.status === 'disconnected')) {
      logEvent('Document became visible. Resuming printer health check...');
      this.reconnectNow().catch(() => null);
    }
  };

  private handleWindowFocus = (): void => {
    if (this.focusDebounceTimer) clearTimeout(this.focusDebounceTimer);
    this.focusDebounceTimer = setTimeout(() => {
      const store = usePrinterStore.getState();
      if (store.manualDisconnect || !store.autoConnect || store.status === 'ready') return;

      const currentDevice = getCurrentConnectedDevice();
      if (!currentDevice?.gatt?.connected && (store.status === 'offline' || store.status === 'disconnected')) {
        logEvent('Window focused. Checking printer health...');
        this.reconnectNow().catch(() => null);
      }
    }, FOCUS_DEBOUNCE_MS);
  };

  private cleanupWatchdogs(): void {
    if (this.watchdogTimer) {
      clearInterval(this.watchdogTimer);
      this.watchdogTimer = null;
    }
    if (this.focusDebounceTimer) {
      clearTimeout(this.focusDebounceTimer);
      this.focusDebounceTimer = null;
    }
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('focus', this.handleWindowFocus);
    }
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private clearAllTimers(): void {
    this.clearReconnectTimer();
    if (this.focusDebounceTimer) {
      clearTimeout(this.focusDebounceTimer);
      this.focusDebounceTimer = null;
    }
  }
}

export const printerSessionManager = new PrinterSessionManager();
