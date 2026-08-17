import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  PrinterIcon,
  BluetoothIcon,
  Loading03Icon,
  RefreshIcon,
  StarIcon,
} from '@hugeicons/core-free-icons';
import type { PrinterDevice, PrinterConnectionStatus, SavedPrinter } from '../../../types';
import type { ConnectionStage } from '../../../lib/printer/bluetoothPrinter';

interface PrinterStatusHeroProps {
  status: PrinterConnectionStatus;
  connectionStage: ConnectionStage;
  device: PrinterDevice | null;
  connectedPrinter: SavedPrinter | null;
  preferredPrinter: SavedPrinter | null;
  paperWidth: number;
  activeTemplateName?: string;
  isSupported: boolean;
  onOpenWizard: () => void;
  onReconnectPreferred: () => void;
  onDisconnect: () => void;
  onTestPrint: () => void;
  isTestPrinting: boolean;
}

export function PrinterStatusHero({
  status,
  connectionStage,
  device,
  connectedPrinter,
  preferredPrinter,
  paperWidth,
  activeTemplateName = 'Classic Receipt',
  isSupported,
  onOpenWizard,
  onReconnectPreferred,
  onDisconnect,
  onTestPrint,
  isTestPrinting,
}: PrinterStatusHeroProps) {
  const isConnected = status === 'connected' || status === 'ready';
  const isRestoring = status === 'restoring';
  const isConnecting = status === 'connecting';
  const isReconnecting = status === 'reconnecting';
  const isPermissionRequired = status === 'permission-required';
  const isOffline = status === 'offline';

  // Connecting Stage Label
  const getStageLabel = () => {
    switch (connectionStage) {
      case 'requesting':
        return 'Waiting for printer selection in browser window...';
      case 'connecting_gatt':
        return 'Connecting to printer GATT server...';
      case 'discovering_service':
        return 'Preparing print service...';
      case 'preparing_channel':
        return 'Locating ESC/POS writable characteristic...';
      case 'ready':
        return 'Printer ready for receipts!';
      default:
        if (isRestoring) return `Restoring ${displayName}...`;
        if (isReconnecting) return `Reconnecting to ${displayName}...`;
        if (isConnecting) return 'Connecting...';
        return '';
    }
  };

  const displayName =
    connectedPrinter?.friendly_name ||
    connectedPrinter?.device_name ||
    device?.name ||
    preferredPrinter?.friendly_name ||
    preferredPrinter?.device_name ||
    'Counter Printer';

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-7 shadow-xs space-y-5 w-full min-w-0 overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 w-full min-w-0">
        {/* Left: Device Icon + Title + Status */}
        <div className="flex items-start gap-3 sm:gap-4 w-full min-w-0 flex-1">
          <div
            className={`p-2.5 sm:p-3.5 rounded-2xl shrink-0 border shadow-2xs transition-colors ${
              isConnected
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : isRestoring || isConnecting || isReconnecting
                ? 'bg-cinnamon/10 border-cinnamon/30 text-cinnamon animate-pulse'
                : isPermissionRequired
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600'
                : 'bg-secondary border-border text-muted-foreground'
            }`}
          >
            <HugeiconsIcon icon={PrinterIcon} size={24} className="sm:size-7" />
          </div>

          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <h1 className="text-base sm:text-2xl font-bold font-heading text-foreground tracking-tight break-words">
                {displayName}
              </h1>

              {/* Preferred Indicator Badge */}
              {preferredPrinter && (
                <Badge
                  variant="outline"
                  className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] font-bold px-1.5 py-0 rounded gap-1 flex items-center shrink-0"
                >
                  <HugeiconsIcon icon={StarIcon} size={10} className="fill-current" />
                  <span>Preferred</span>
                </Badge>
              )}

              {/* Status Badge */}
              <Badge
                variant="outline"
                className={`text-[11px] sm:text-xs font-bold rounded-lg px-2.5 py-0.5 capitalize shrink-0 ${
                  isConnected
                    ? 'bg-emerald-600 hover:bg-emerald-600 text-white border-emerald-600'
                    : isRestoring || isConnecting || isReconnecting
                    ? 'bg-cinnamon/10 text-cinnamon border-cinnamon/40 animate-pulse'
                    : isPermissionRequired
                    ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/40'
                    : 'bg-secondary text-muted-foreground border-border'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 ${
                    isConnected
                      ? 'bg-white'
                      : isRestoring || isConnecting || isReconnecting
                      ? 'bg-cinnamon animate-ping'
                      : isPermissionRequired
                      ? 'bg-amber-500'
                      : 'bg-muted-foreground'
                  }`}
                />
                {isConnected
                  ? 'Ready to print'
                  : isRestoring
                  ? 'Restoring printer...'
                  : isConnecting || isReconnecting
                  ? 'Connecting...'
                  : isPermissionRequired
                  ? 'Permission Required'
                  : isOffline
                  ? 'Printer Offline'
                  : 'Disconnected'}
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed break-words">
              {isConnected
                ? 'Ready to print customer receipts for counter and takeaway orders.'
                : isRestoring
                ? `Restoring saved authorization for "${displayName}"...`
                : isConnecting || isReconnecting
                ? getStageLabel()
                : isPermissionRequired
                ? 'Browser authorization required for this printer origin. Click Authorize & Connect.'
                : isOffline
                ? `"${displayName}" is offline. Ensure printer power is ON; automatic background recovery is active.`
                : !isSupported
                ? 'Web Bluetooth is not supported in this browser. Browser fallback print will be used.'
                : preferredPrinter
                ? `Ready to connect to "${preferredPrinter.friendly_name || preferredPrinter.device_name}". Turn on the printer and click Reconnect Now.`
                : 'Connect your Bluetooth thermal printer once to start printing order receipts.'}
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
                <span className="bg-secondary/60 px-2 py-0.5 rounded-md border border-border/50 font-medium break-words">
                  {activeTemplateName}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Operational Actions */}
        <div className="flex items-center gap-2 flex-wrap shrink-0 pt-2 lg:pt-0 w-full lg:w-auto">
          {isConnected ? (
            <>
              <Button
                type="button"
                size="sm"
                onClick={onTestPrint}
                disabled={isTestPrinting}
                className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold text-xs rounded-xl h-10 px-4 shadow-2xs gap-1.5 flex-1 sm:flex-none justify-center"
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
                className="text-xs font-semibold rounded-xl h-10 px-3 border-border/80 bg-card hover:bg-secondary text-foreground flex-1 sm:flex-none justify-center"
              >
                Disconnect
              </Button>
            </>
          ) : (
            <>
              {preferredPrinter && isSupported && !isPermissionRequired && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onReconnectPreferred}
                  disabled={isRestoring || isConnecting || isReconnecting}
                  className="text-xs font-bold rounded-xl h-10 px-3.5 border-cinnamon/40 bg-cinnamon/5 hover:bg-cinnamon/10 text-cinnamon gap-1.5 shadow-2xs flex-1 sm:flex-none justify-center"
                >
                  <HugeiconsIcon
                    icon={RefreshIcon}
                    size={14}
                    className={isRestoring || isConnecting || isReconnecting ? 'animate-spin' : ''}
                  />
                  <span>{isRestoring || isConnecting || isReconnecting ? 'Reconnecting...' : 'Reconnect Now'}</span>
                </Button>
              )}

              <Button
                type="button"
                size="sm"
                onClick={onOpenWizard}
                disabled={isRestoring || isConnecting || isReconnecting || !isSupported}
                className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold text-xs rounded-xl h-10 px-4 shadow-2xs gap-1.5 flex-1 sm:flex-none justify-center"
              >
                <HugeiconsIcon icon={BluetoothIcon} size={15} />
                <span>{isPermissionRequired ? 'Authorize & Connect' : preferredPrinter ? 'Scan & Connect' : 'Connect Thermal Printer'}</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
