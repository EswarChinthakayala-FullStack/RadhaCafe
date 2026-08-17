import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { toast } from '../../ui/toast';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Shield01Icon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  RefreshIcon,
  Loading03Icon,
  Wrench01Icon,
} from '@hugeicons/core-free-icons';
import { usePrinterStore } from '../../../store/printerStore';
import { useBluetoothPrinter } from '../../../hooks/useBluetoothPrinter';
import type { DetailedConnectionDiagnostics } from '../../../lib/printer/printerSessionManager';

interface PrinterDiagnosticsProps {
  isSupported: boolean;
  isSecure: boolean;
  isConnected: boolean;
  deviceName?: string | null;
  paperWidth: number;
}

export function PrinterDiagnostics({
  isSupported,
  isSecure,
  isConnected,
  deviceName,
  paperWidth,
}: PrinterDiagnosticsProps) {
  const [isRunningCheck, setIsRunningCheck] = useState(false);
  const [liveDiagnostics, setLiveDiagnostics] = useState<DetailedConnectionDiagnostics | null>(null);
  const { runConnectionDiagnostics, repairConnection, isConnecting } = useBluetoothPrinter();

  const autoConnect = usePrinterStore((state) => state.autoConnect);
  const totalReconnectsThisSession = usePrinterStore((state) => state.totalReconnectsThisSession);
  const status = usePrinterStore((state) => state.status);
  const manualDisconnect = usePrinterStore((state) => state.manualDisconnect);
  const connectedPrinter = usePrinterStore((state) => state.connectedPrinter);
  const activeProfile = usePrinterStore((state) => state.activeProfile);

  const handleRunCheck = async () => {
    setIsRunningCheck(true);
    try {
      const diag = await runConnectionDiagnostics();
      setLiveDiagnostics(diag);
      toast.add({
        title: 'Connection Check Complete',
        description: diag.summary,
        type: diag.sessionState === 'ready' || diag.gattConnection === 'connected' ? 'success' : 'info',
      });
    } catch {
      toast.add({
        title: 'Diagnostic Error',
        description: 'Failed to inspect Bluetooth connection status.',
        type: 'error',
      });
    } finally {
      setIsRunningCheck(false);
    }
  };

  const checks = [
    {
      name: 'Web Bluetooth API',
      status: isSupported ? 'passed' : 'failed',
      badge: isSupported ? 'Supported' : 'Unsupported',
      desc: isSupported
        ? 'Web Bluetooth API supported (Chrome / Edge / Opera)'
        : 'Web Bluetooth is not supported in this browser engine.',
    },
    {
      name: 'Security Context',
      status: isSecure ? 'passed' : 'failed',
      badge: isSecure ? 'Secure' : 'Insecure',
      desc: isSecure
        ? 'HTTPS / localhost secure origin verified'
        : 'Bluetooth operations require an HTTPS secure context.',
    },
    {
      name: 'Saved in RadhaCafe',
      status: liveDiagnostics ? (liveDiagnostics.savedInRadhaCafe ? 'passed' : 'failed') : connectedPrinter ? 'passed' : 'idle',
      badge: liveDiagnostics ? (liveDiagnostics.savedInRadhaCafe ? 'Saved' : 'Not Saved') : connectedPrinter ? 'Saved' : 'Not Set',
      desc: liveDiagnostics?.savedPrinterName || connectedPrinter?.friendly_name || connectedPrinter?.device_name || 'No preferred printer profile saved in database yet.',
    },
    {
      name: 'Browser Authorization',
      status: liveDiagnostics
        ? liveDiagnostics.browserAuthorization === 'granted'
          ? 'passed'
          : 'failed'
        : isConnected
        ? 'passed'
        : 'idle',
      badge: liveDiagnostics ? (liveDiagnostics.browserAuthorization === 'granted' ? 'Granted' : 'Required') : isConnected ? 'Granted' : 'Check Required',
      desc: liveDiagnostics?.browserAuthorization === 'granted'
        ? 'Persistent browser origin permission active via getDevices()'
        : 'Browser permission required. Click Authorize or Scan to grant.',
    },
    {
      name: 'Bluetooth Device Match',
      status: liveDiagnostics ? (liveDiagnostics.bluetoothDevice === 'found' ? 'passed' : 'failed') : isConnected ? 'passed' : 'idle',
      badge: liveDiagnostics ? (liveDiagnostics.bluetoothDevice === 'found' ? 'Found' : 'Not Found') : isConnected ? 'Matched' : 'Offline',
      desc: liveDiagnostics?.bluetoothDeviceName || deviceName || 'Bluetooth device discovered in browser permission list.',
    },
    {
      name: 'GATT Connection',
      status: isConnected ? 'passed' : status === 'reconnecting' || status === 'restoring' ? 'reconnecting' : 'failed',
      badge: isConnected ? 'Connected' : status === 'reconnecting' ? 'Connecting...' : status === 'restoring' ? 'Restoring...' : 'Disconnected',
      desc: isConnected
        ? 'Active GATT server session established.'
        : manualDisconnect
        ? 'Manually disconnected by admin (auto-reconnect suppressed for session)'
        : status === 'reconnecting'
        ? 'Reconnecting automatically to thermal printer...'
        : 'GATT disconnected. Turn on printer and click Reconnect Now.',
    },
    {
      name: 'Printer Service (ESC/POS)',
      status: isConnected ? 'passed' : 'idle',
      badge: isConnected ? 'Ready' : 'Not Active',
      desc: isConnected
        ? `Thermal print service resolved (${liveDiagnostics?.serviceUuid || connectedPrinter?.service_uuid || '000018f0-0000-1000-8000-00805f9b34fb'})`
        : 'Discovered during active Bluetooth connection sequence.',
    },
    {
      name: 'Write Channel',
      status: isConnected ? 'passed' : 'idle',
      badge: isConnected ? 'Ready' : 'Not Active',
      desc: isConnected
        ? `Writable characteristic active (${activeProfile.defaultWriteMode}, chunk: ${activeProfile.defaultChunkSize}B)`
        : 'Validated upon successful GATT connection.',
    },
    {
      name: 'Keep Connected Policy',
      status: autoConnect ? 'passed' : 'idle',
      badge: autoConnect ? 'Enabled' : 'Disabled',
      desc: autoConnect
        ? `Automatic recovery enabled (${totalReconnectsThisSession} reconnects this session)`
        : 'Disabled in Printer Settings.',
    },
    {
      name: 'Paper Configuration',
      status: 'passed',
      badge: `${paperWidth === 48 ? '80mm' : '58mm'}`,
      desc: `Configured for ${paperWidth === 48 ? '80mm (48 columns)' : '58mm (32 columns)'}`,
    },
  ];

  return (
    <Card className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden w-full min-w-0">
      <CardHeader className="p-4 sm:p-6 pb-4 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full min-w-0">
          <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
            <div className="p-2 rounded-xl bg-cinnamon/10 text-cinnamon border border-cinnamon/20 shadow-2xs shrink-0 mt-0.5 sm:mt-0">
              <HugeiconsIcon icon={Shield01Icon} size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-sm sm:text-base font-bold font-heading text-foreground break-words leading-tight">
                Printer Connection Diagnostics
              </CardTitle>
              <CardDescription className="text-xs mt-0.5 leading-relaxed">
                Inspect browser authorization, GATT layers, service resolution, and write channels.
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRunCheck}
              disabled={isRunningCheck}
              className="h-8.5 text-xs font-semibold rounded-xl border-border/80 bg-card hover:bg-secondary gap-1.5 shadow-2xs"
            >
              {isRunningCheck ? (
                <>
                  <HugeiconsIcon icon={Loading03Icon} size={13} className="animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={RefreshIcon} size={13} />
                  <span>Run Connection Check</span>
                </>
              )}
            </Button>

            {(!isConnected || status === 'permission-required') && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={repairConnection}
                disabled={isConnecting}
                className="h-8.5 text-xs font-bold rounded-xl border-cinnamon/40 text-cinnamon bg-cinnamon/5 hover:bg-cinnamon/10 gap-1.5 shadow-2xs"
              >
                <HugeiconsIcon icon={Wrench01Icon} size={13} />
                <span>Repair Connection</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-2.5 text-xs">
        {checks.map((check, i) => (
          <div
            key={i}
            className="flex items-start sm:items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/60 gap-3"
          >
            <div className="space-y-0.5 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-foreground text-xs">{check.name}</p>
                <span className="font-mono text-[10px] text-muted-foreground bg-secondary/70 px-1.5 py-0.2 rounded border border-border/40">
                  {check.badge}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground break-words leading-relaxed font-mono text-xs">
                {check.desc}
              </p>
            </div>

            <div className="shrink-0 mt-0.5 sm:mt-0">
              {check.status === 'passed' ? (
                <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white font-bold text-[10px] gap-1 rounded-md px-2 py-0.5">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} />
                  <span>Ready</span>
                </Badge>
              ) : check.status === 'reconnecting' ? (
                <Badge variant="outline" className="border-cinnamon/40 bg-cinnamon/10 text-cinnamon font-bold text-[10px] gap-1 rounded-md px-2 py-0.5 animate-pulse">
                  <HugeiconsIcon icon={Loading03Icon} size={10} className="animate-spin" />
                  <span>Checking</span>
                </Badge>
              ) : check.status === 'failed' ? (
                <Badge variant="destructive" className="font-bold text-[10px] gap-1 rounded-md px-2 py-0.5">
                  <HugeiconsIcon icon={AlertCircleIcon} size={12} />
                  <span>Issue</span>
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground text-[10px] rounded-md px-2 py-0.5">
                  Offline
                </Badge>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
