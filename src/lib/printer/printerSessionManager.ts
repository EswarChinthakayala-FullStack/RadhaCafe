import { usePrinterStore } from '../../store/printerStore';
import type {
  ConnectionStage,
  SavedPrinter,
  PrinterConnectionStatus,
} from '../../types/printer.types';
import {
  connectSavedPrinter,
  requestAndVerifyPrinter,
  disconnectBluetoothPrinter,
  forgetBrowserDevice,
  isBluetoothSupported,
  isGetDevicesSupported,
  isSecureContext,
  normalizePrinterError,
  logEvent,
  getCurrentConnectedDevice,
  getWriteCharacteristic,
  probeDeviceConnection,
  type VerifiedConnectionResult,
  type PrinterProbeResult,
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

const LOCAL_PREFERRED_PRINTER_KEY = 'radhacafe_preferred_printer_cache';
const LOCAL_PRINTER_SETTINGS_KEY = 'radhacafe_printer_settings_cache';

function getLocalPreferredPrinter(): SavedPrinter | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = localStorage.getItem(LOCAL_PREFERRED_PRINTER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveLocalPreferredPrinter(printer: SavedPrinter | null): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    if (printer) {
      localStorage.setItem(LOCAL_PREFERRED_PRINTER_KEY, JSON.stringify(printer));
    } else {
      localStorage.removeItem(LOCAL_PREFERRED_PRINTER_KEY);
    }
  } catch {
    // Non-blocking storage error
  }
}

function getLocalPrinterSettings(): any {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = localStorage.getItem(LOCAL_PRINTER_SETTINGS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveLocalPrinterSettings(settings: any): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    if (settings) {
      localStorage.setItem(LOCAL_PRINTER_SETTINGS_KEY, JSON.stringify(settings));
    } else {
      localStorage.removeItem(LOCAL_PRINTER_SETTINGS_KEY);
    }
  } catch {
    // Non-blocking storage error
  }
}

export interface DetailedConnectionDiagnostics {
  savedInRadhaCafe: boolean;
  savedPrinterName: string | null;
  isPreferred: boolean;
  browserAuthorization: 'granted' | 'required' | 'unsupported';
  bluetoothDevice: 'found' | 'not-found' | 'unsupported';
  bluetoothDeviceName: string | null;
  gattConnection: 'connected' | 'disconnected' | 'connecting';
  printerService: 'ready' | 'not-found';
  serviceUuid: string | null;
  writeChannel: 'ready' | 'not-found';
  characteristicUuid: string | null;
  writeMode: 'with-response' | 'without-response' | null;
  sessionState: PrinterConnectionStatus;
  summary: string;
}

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
   * Initializes the session manager once when authenticated admin logs in.
   * Full browser refresh restarts from a clean runtime (device = null, status = 'restoring')
   * and reconstructs connection from browser-granted devices via navigator.bluetooth.getDevices().
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
   * Startup sequence: reads settings & preferred printer (offline cache + Supabase sync),
   * and silently reconnects via getDevices() without showing a browser chooser.
   */
  private async bootstrapStartupConnection(): Promise<void> {
    const currentGen = this.sessionGeneration;
    const store = usePrinterStore.getState();
    store.setStatus('restoring');
    store.setConnectionStage('idle');

    // 1. Instantly read local cache to support offline POS launch without Supabase network delay
    const localCachedSettings = getLocalPrinterSettings();
    const localCachedPrinter = getLocalPreferredPrinter();

    if (localCachedSettings?.paper_width) {
      store.setPaperWidth(localCachedSettings.paper_width);
    }
    if (localCachedSettings?.auto_connect !== undefined) {
      store.setAutoConnect(localCachedSettings.auto_connect);
    }

    if (localCachedPrinter) {
      this.cachedPreferredPrinter = localCachedPrinter;
    }

    // 2. Fetch fresh server settings & saved printers asynchronously
    try {
      const [serverSettings, serverSavedPrinters] = await Promise.all([
        fetchPrinterSettings().catch(() => null),
        fetchSavedPrinters().catch(() => []),
      ]);

      if (currentGen !== this.sessionGeneration) return;

      if (serverSettings) {
        saveLocalPrinterSettings(serverSettings);
        if (serverSettings.paper_width) store.setPaperWidth(serverSettings.paper_width);
        if (serverSettings.auto_connect !== undefined) store.setAutoConnect(serverSettings.auto_connect);
      }

      if (serverSavedPrinters && serverSavedPrinters.length > 0) {
        const preferredId = serverSettings?.preferred_printer_id;
        const targetServer =
          (preferredId ? serverSavedPrinters.find((p) => p.id === preferredId) : null) ||
          serverSavedPrinters.find((p) => p.is_enabled) ||
          serverSavedPrinters[0];

        if (targetServer) {
          this.cachedPreferredPrinter = targetServer;
          saveLocalPreferredPrinter(targetServer);
        }
      }
    } catch {
      // Offline fallback: continue with localCachedPrinter
    }

    if (currentGen !== this.sessionGeneration) return;

    // Check if auto-connect is disabled
    const currentAutoConnect = usePrinterStore.getState().autoConnect;
    if (!currentAutoConnect) {
      store.setStatus('disconnected');
      logEvent('Auto-connect is disabled in settings.');
      return;
    }

    const target = this.cachedPreferredPrinter || localCachedPrinter;
    if (!target || !target.device_id) {
      store.setStatus('disconnected');
      logEvent('No preferred printer configured in RadhaCafe.');
      return;
    }

    if (!isGetDevicesSupported()) {
      store.setStatus('disconnected');
      logEvent('navigator.bluetooth.getDevices() unsupported in this browser.');
      return;
    }

    logEvent(`Restoring connection to preferred printer: ${target.friendly_name || target.device_name}`);
    await this.executeConnection(target, 'startup');
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
          },
          targetPrinter.service_uuid,
          targetPrinter.characteristic_uuid
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
            name: verified.device.name || targetPrinter.friendly_name || targetPrinter.device_name || 'Bluetooth Printer',
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
   * User clicks "Scan & Connect" -> Opens native browser chooser with explicit user gesture
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

      // Save verified printer to Supabase and update local cache
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

      if (saved) {
        this.cachedPreferredPrinter = saved;
        saveLocalPreferredPrinter(saved);
      }

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
   * User clicks "Repair Printer Connection" -> Explicit user gesture to re-authorize device with updated optionalServices
   */
  public async repairPrinterConnection(): Promise<boolean> {
    this.sessionGeneration++;
    this.clearAllTimers();
    disconnectBluetoothPrinter();

    return this.scanAndConnectNewPrinter(this.cachedPreferredPrinter?.friendly_name || undefined);
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
    saveLocalPreferredPrinter(savedPrinter);
    this.fastRetryIndex = 0;

    return this.executeConnection(savedPrinter, 'manual');
  }

  /**
   * Admin clicks "Reconnect Now" -> Uses getDevices() to restore connection without native chooser
   */
  public async reconnectNow(): Promise<boolean> {
    const store = usePrinterStore.getState();
    store.setManualDisconnect(false);
    store.setDisconnectReason(null);
    this.clearReconnectTimer();
    this.fastRetryIndex = 0;

    let target = this.cachedPreferredPrinter || getLocalPreferredPrinter();
    if (!target) {
      target = await fetchPreferredPrinter().catch(() => null);
    }
    if (!target || !target.device_id) {
      store.setStatus('permission-required');
      store.setError('No saved printer configured. Please authorize a thermal printer.', 'DEVICE_NOT_FOUND');
      return false;
    }

    this.cachedPreferredPrinter = target;
    saveLocalPreferredPrinter(target);
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
      saveLocalPreferredPrinter(null);
    }
  }

  /**
   * Renames a saved printer
   */
  public async renameSavedPrinter(savedPrinterId: string, friendlyName: string): Promise<void> {
    await updateSavedPrinter(savedPrinterId, { friendly_name: friendlyName });
    if (this.cachedPreferredPrinter?.id === savedPrinterId) {
      this.cachedPreferredPrinter = { ...this.cachedPreferredPrinter, friendly_name: friendlyName };
      saveLocalPreferredPrinter(this.cachedPreferredPrinter);
    }
  }

  /**
   * Sets a saved printer as preferred
   */
  public async setSavedPrinterPreferred(savedPrinterId: string): Promise<void> {
    await setPreferredPrinter(savedPrinterId);
    const preferred = await fetchPreferredPrinter().catch(() => null);
    this.cachedPreferredPrinter = preferred;
    saveLocalPreferredPrinter(preferred);
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
    const writeChar = getWriteCharacteristic();

    // 1. If status claims ready and GATT is physically connected and characteristic is active -> immediate ready
    if ((store.status === 'ready' || store.status === 'connected') && currentDevice?.gatt?.connected && writeChar) {
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
    const target = this.cachedPreferredPrinter || getLocalPreferredPrinter() || (await fetchPreferredPrinter().catch(() => null));
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
   * Runs comprehensive live connection diagnostics without printing or opening browser dialogs
   */
  public async runLiveDiagnostics(): Promise<DetailedConnectionDiagnostics> {
    const store = usePrinterStore.getState();
    const target = this.cachedPreferredPrinter || getLocalPreferredPrinter() || (await fetchPreferredPrinter().catch(() => null));
    const currentDevice = getCurrentConnectedDevice();
    const writeChar = getWriteCharacteristic();

    if (!target) {
      return {
        savedInRadhaCafe: false,
        savedPrinterName: null,
        isPreferred: false,
        browserAuthorization: isGetDevicesSupported() ? 'required' : 'unsupported',
        bluetoothDevice: 'not-found',
        bluetoothDeviceName: null,
        gattConnection: 'disconnected',
        printerService: 'not-found',
        serviceUuid: null,
        writeChannel: 'not-found',
        characteristicUuid: null,
        writeMode: null,
        sessionState: store.status,
        summary: 'No thermal printer is currently saved in RadhaCafe. Please click Connect Thermal Printer.',
      };
    }

    const probe: PrinterProbeResult = await probeDeviceConnection(target.device_id, target.service_uuid);

    const isAuthorized = probe.deviceFoundInBrowser;
    const isGattActive = Boolean(currentDevice?.gatt?.connected || probe.isGattConnected);
    const isServiceActive = Boolean(probe.serviceFound || (isGattActive && writeChar));
    const isWriteActive = Boolean(probe.characteristicFound || (isGattActive && writeChar));

    let summaryText = 'Printer is ready for orders.';
    if (!probe.isSupported) {
      summaryText = 'Web Bluetooth is not supported in this browser. Please use Chrome, Edge, or Opera.';
    } else if (!isAuthorized) {
      summaryText = 'Browser authorization is missing for this printer. Click Authorize & Connect.';
    } else if (!isGattActive) {
      summaryText = 'Printer is currently offline. Ensure printer power is ON and click Reconnect Now.';
    } else if (!isServiceActive || !isWriteActive) {
      summaryText = 'Printer connected, but ESC/POS printing service was not accessible. Click Repair Printer Connection.';
    }

    return {
      savedInRadhaCafe: true,
      savedPrinterName: target.friendly_name || target.device_name || 'Thermal Printer',
      isPreferred: Boolean(target.is_preferred),
      browserAuthorization: isAuthorized ? 'granted' : 'required',
      bluetoothDevice: isAuthorized ? 'found' : 'not-found',
      bluetoothDeviceName: probe.deviceName || target.device_name || null,
      gattConnection: isGattActive ? 'connected' : store.status === 'reconnecting' ? 'connecting' : 'disconnected',
      printerService: isServiceActive ? 'ready' : 'not-found',
      serviceUuid: probe.serviceUuid || target.service_uuid || (writeChar ? '000018f0-0000-1000-8000-00805f9b34fb' : null),
      writeChannel: isWriteActive ? 'ready' : 'not-found',
      characteristicUuid: probe.characteristicUuid || target.characteristic_uuid || null,
      writeMode: probe.writeMode || (target.write_mode as any) || 'without-response',
      sessionState: store.status,
      summary: summaryText,
    };
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
