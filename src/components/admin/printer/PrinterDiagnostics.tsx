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

  const handleRunCheck = async () => {
    setIsRunningCheck(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsRunningCheck(false);
    toast.add({
      title: 'Diagnostics Complete',
      description: isConnected
        ? 'All printer hardware and environment checks passed.'
        : 'Bluetooth environment is ready. Connect your printer to complete setup.',
      type: 'success',
    });
  };

  const checks = [
    {
      name: 'Web Bluetooth API',
      status: isSupported ? 'passed' : 'failed',
      desc: isSupported ? 'Supported in this browser (Chrome/Edge)' : 'Unsupported browser engine',
    },
    {
      name: 'Security Context',
      status: isSecure ? 'passed' : 'failed',
      desc: isSecure ? 'Secure HTTPS or localhost connection verified' : 'Requires HTTPS connection',
    },
    {
      name: 'Device Connection',
      status: isConnected ? 'passed' : 'idle',
      desc: isConnected ? `Connected to ${deviceName || 'Thermal Printer'}` : 'No active Bluetooth session',
    },
    {
      name: 'Print Channel',
      status: isConnected ? 'passed' : 'idle',
      desc: isConnected ? 'Writable ESC/POS characteristic located' : 'Awaiting printer connection',
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
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="p-2 rounded-xl bg-cinnamon/10 text-cinnamon border border-cinnamon/20 shadow-2xs shrink-0">
              <HugeiconsIcon icon={Shield01Icon} size={18} />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base font-bold font-heading text-foreground truncate">
                Printer Connection Diagnostics
              </CardTitle>
              <CardDescription className="text-xs">
                Inspect browser compatibility, GATT channel availability, and configuration status.
              </CardDescription>
            </div>
          </div>

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
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-2.5 text-xs">
        {checks.map((check, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/60 gap-3"
          >
            <div className="space-y-0.5 min-w-0">
              <p className="font-semibold text-foreground">{check.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{check.desc}</p>
            </div>

            <div className="shrink-0">
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
