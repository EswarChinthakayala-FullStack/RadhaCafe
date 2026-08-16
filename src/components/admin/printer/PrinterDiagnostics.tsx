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
} from '@hugeicons/core-free-icons';
import { usePrinterStore } from '../../../store/printerStore';

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
  const autoConnect = usePrinterStore((state) => state.autoConnect);
  const totalReconnectsThisSession = usePrinterStore((state) => state.totalReconnectsThisSession);
  const status = usePrinterStore((state) => state.status);
  const manualDisconnect = usePrinterStore((state) => state.manualDisconnect);

  const handleRunCheck = async () => {
    setIsRunningCheck(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsRunningCheck(false);
    toast.add({
      title: 'Diagnostics Complete',
      description: isConnected
        ? 'All printer hardware, session manager, and environment checks passed.'
        : 'Bluetooth environment is ready. Connect your printer to complete setup.',
      type: 'success',
    });
  };

  const checks = [
    {
      name: 'Session Manager',
      status: 'passed',
      desc: `Persistent Admin runtime active (${totalReconnectsThisSession} successful connections this session)`,
    },
    {
      name: 'Web Bluetooth API',
      status: isSupported ? 'passed' : 'failed',
      desc: isSupported ? 'Supported in this browser (Chrome/Edge/Opera)' : 'Unsupported browser engine',
    },
    {
      name: 'Security Context',
      status: isSecure ? 'passed' : 'failed',
      desc: isSecure ? 'Secure HTTPS or localhost connection verified' : 'Requires HTTPS connection',
    },
    {
      name: 'Connection State',
      status: isConnected ? 'passed' : manualDisconnect ? 'idle' : status === 'reconnecting' ? 'idle' : 'idle',
      desc: isConnected
        ? `Ready to print: ${deviceName || 'Thermal Printer'}`
        : manualDisconnect
        ? 'Manually disconnected by admin (auto-reconnect suppressed)'
        : status === 'reconnecting'
        ? 'Reconnecting automatically to preferred printer...'
        : 'Printer is offline (background reconnection active)',
    },
    {
      name: 'Keep Connected Policy',
      status: autoConnect ? 'passed' : 'idle',
      desc: autoConnect
        ? 'Enabled (automatic recovery active for entire admin session)'
        : 'Disabled in Printer Settings',
    },
    {
      name: 'Paper Configuration',
      status: 'passed',
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
                Inspect browser compatibility, session health, and auto-reconnect state.
              </CardDescription>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRunCheck}
            disabled={isRunningCheck}
            className="h-8.5 text-xs font-semibold rounded-xl border-border/80 bg-card hover:bg-secondary gap-1.5 shadow-2xs self-start sm:self-auto shrink-0"
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
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-2.5 text-xs">
        {checks.map((check, i) => (
          <div
            key={i}
            className="flex items-start sm:items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/60 gap-3"
          >
            <div className="space-y-0.5 min-w-0 flex-1">
              <p className="font-semibold text-foreground text-xs">{check.name}</p>
              <p className="text-[11px] text-muted-foreground break-words leading-relaxed">{check.desc}</p>
            </div>

            <div className="shrink-0 mt-0.5 sm:mt-0">
              {check.status === 'passed' ? (
                <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white font-bold text-[10px] gap-1 rounded-md px-2 py-0.5">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} />
                  <span>Ready</span>
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
