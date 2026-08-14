import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  PrinterIcon,
  BluetoothIcon,
  Loading03Icon,
  RefreshIcon,
} from '@hugeicons/core-free-icons';
import type { PrinterDevice, PrinterConnectionStatus } from '../../../types';
import type { ConnectionStage } from '../../../lib/printer/bluetoothPrinter';

interface PrinterStatusHeroProps {
  status: PrinterConnectionStatus;
  connectionStage: ConnectionStage;
  device: PrinterDevice | null;
  savedPrinterName?: string | null;
  savedDeviceId?: string | null;
  paperWidth: number;
  activeTemplateName?: string;
  isSupported: boolean;
  onOpenWizard: () => void;
  onReconnect: (deviceId: string) => void;
  onDisconnect: () => void;
  onTestPrint: () => void;
  isTestPrinting: boolean;
}

export function PrinterStatusHero({
  status,
  connectionStage,
  device,
  savedPrinterName,
  savedDeviceId,
  paperWidth,
  activeTemplateName = 'Classic Receipt',
  isSupported,
  onOpenWizard,
  onReconnect,
  onDisconnect,
  onTestPrint,
  isTestPrinting,
}: PrinterStatusHeroProps) {
  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';

  // Connecting Stage Label
  const getStageLabel = () => {
    switch (connectionStage) {
      case 'requesting':
        return 'Waiting for printer selection...';
      case 'connecting_gatt':
        return 'Connecting to printer GATT server...';
      case 'discovering_service':
        return 'Discovering thermal printer services...';
      case 'preparing_channel':
        return 'Preparing ESC/POS printing channel...';
      case 'ready':
        return 'Printer ready for receipts!';
      default:
        return 'Connecting...';
    }
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-7 shadow-xs space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left: Device Icon + Title + Status */}
        <div className="flex items-start gap-4">
          <div
            className={`p-3.5 rounded-2xl shrink-0 border shadow-2xs transition-colors ${
              isConnected
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : isConnecting
                ? 'bg-cinnamon/10 border-cinnamon/30 text-cinnamon animate-pulse'
                : 'bg-secondary border-border text-muted-foreground'
            }`}
          >
            <HugeiconsIcon icon={PrinterIcon} size={28} />
          </div>

          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground tracking-tight">
                {isConnected && device?.name
                  ? device.name
                  : savedPrinterName
                  ? savedPrinterName
                  : 'Thermal Receipt Printer'}
              </h1>

              {/* Status Badge */}
              <Badge
                variant="outline"
                className={`text-xs font-bold rounded-lg px-2.5 py-0.5 capitalize shrink-0 ${
                  isConnected
                    ? 'bg-emerald-600 hover:bg-emerald-600 text-white border-emerald-600'
                    : isConnecting
                    ? 'bg-cinnamon/10 text-cinnamon border-cinnamon/40 animate-pulse'
                    : 'bg-secondary text-muted-foreground border-border'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 ${
                    isConnected ? 'bg-white' : isConnecting ? 'bg-cinnamon animate-ping' : 'bg-muted-foreground'
                  }`}
                />
                {isConnected ? 'Connected & Ready' : isConnecting ? 'Connecting...' : 'Not Connected'}
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {isConnected
                ? 'Ready to print customer receipts for counter and takeaway orders.'
                : isConnecting
                ? getStageLabel()
                : !isSupported
                ? 'Web Bluetooth is not supported in this browser. Browser fallback print will be used.'
                : savedPrinterName
                ? `Previously paired with ${savedPrinterName}. Turn on the printer and click Reconnect.`
                : 'Connect your Bluetooth thermal printer to print order receipts.'}
            </p>

            {/* Runtime Device Metadata Pills (When Connected) */}
            {isConnected && (
              <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1 font-medium bg-secondary/60 px-2 py-0.5 rounded-md border border-border/50">
                  <HugeiconsIcon icon={BluetoothIcon} size={12} className="text-cinnamon" />
                  <span>Bluetooth LE</span>
                </span>
                <span className="bg-secondary/60 px-2 py-0.5 rounded-md border border-border/50 font-mono">
                  {paperWidth === 48 ? '80mm / 48 cols' : '58mm / 32 cols'}
                </span>
                <span className="bg-secondary/60 px-2 py-0.5 rounded-md border border-border/50 font-medium">
                  {activeTemplateName}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Operational Actions */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
          {isConnected ? (
            <>
              <Button
                type="button"
                size="sm"
                onClick={onTestPrint}
                disabled={isTestPrinting}
                className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold text-xs rounded-xl h-10 px-4 shadow-2xs gap-1.5"
              >
                {isTestPrinting ? (
                  <>
                    <HugeiconsIcon icon={Loading03Icon} size={15} className="animate-spin" />
                    <span>Printing Test...</span>
                  </>
                ) : (
                  <>
                    <HugeiconsIcon icon={PrinterIcon} size={15} />
                    <span>Print Test Receipt</span>
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onDisconnect}
                className="text-xs font-semibold rounded-xl h-10 px-3 border-border/80 bg-card hover:bg-secondary text-foreground"
              >
                Disconnect
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onOpenWizard}
                className="text-xs text-muted-foreground hover:text-foreground rounded-xl h-10 px-3"
              >
                Choose Another
              </Button>
            </>
          ) : (
            <>
              {savedDeviceId && isSupported && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onReconnect(savedDeviceId)}
                  disabled={isConnecting}
                  className="text-xs font-bold rounded-xl h-10 px-3.5 border-cinnamon/40 bg-cinnamon/5 hover:bg-cinnamon/10 text-cinnamon gap-1.5 shadow-2xs"
                >
                  <HugeiconsIcon icon={RefreshIcon} size={14} />
                  <span>Reconnect</span>
                </Button>
              )}

              <Button
                type="button"
                size="sm"
                onClick={onOpenWizard}
                disabled={isConnecting || !isSupported}
                className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold text-xs rounded-xl h-10 px-4 shadow-2xs gap-1.5"
              >
                <HugeiconsIcon icon={BluetoothIcon} size={15} />
                <span>{savedDeviceId ? 'Pair New Printer' : 'Connect Thermal Printer'}</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
