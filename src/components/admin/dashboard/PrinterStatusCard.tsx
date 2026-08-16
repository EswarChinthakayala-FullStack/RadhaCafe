import { Link } from 'react-router-dom';
import { useBluetoothPrinter } from '../../../hooks/useBluetoothPrinter';
import { ROUTES } from '../../../constants/routes';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  PrinterIcon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  Settings01Icon,
  BluetoothIcon,
} from '@hugeicons/core-free-icons';

export function PrinterStatusCard() {
  const { savedPrinterName, isConnected, isConnecting, isReconnecting, reconnectPreferred, lastError } = useBluetoothPrinter();

  return (
    <Card className="border border-border/80 bg-card rounded-xl p-4 shadow-2xs">
      <CardContent className="p-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left Status Details */}
        <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
              isConnected
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
            }`}
          >
            <HugeiconsIcon icon={PrinterIcon} size={20} />
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-xs text-foreground">
                Thermal POS Printer
              </span>
              <Badge
                variant="outline"
                className={`text-[10px] font-bold px-1.5 py-0 h-4 flex items-center gap-1 ${
                  isConnected
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                }`}
              >
                <HugeiconsIcon
                  icon={isConnected ? CheckmarkCircle01Icon : AlertCircleIcon}
                  size={10}
                />
                <span>{isConnected ? 'Ready' : isConnecting || isReconnecting ? 'Connecting...' : 'Offline'}</span>
              </Badge>
            </div>

            <p className="text-[11px] text-muted-foreground line-clamp-1">
              {isConnected
                ? savedPrinterName || 'Bluetooth Printer Connected & Ready'
                : lastError || 'Receipt printing requires paired Bluetooth connection'}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-border/40 self-end sm:self-auto">
          {!isConnected && (
            <Button
              size="sm"
              onClick={reconnectPreferred}
              disabled={isConnecting || isReconnecting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-8 px-3 gap-1.5 shadow-2xs"
            >
              <HugeiconsIcon
                icon={BluetoothIcon}
                size={13}
                className={isConnecting || isReconnecting ? 'animate-pulse' : ''}
              />
              <span>{isConnecting || isReconnecting ? 'Connecting...' : 'Reconnect'}</span>
            </Button>
          )}

          <Link
            to={ROUTES.ADMIN.PRINTER}
            className="inline-flex items-center justify-center p-2 rounded-lg border border-border/70 text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors shrink-0"
            title="Printer Settings"
            aria-label="Printer Settings"
          >
            <HugeiconsIcon icon={Settings01Icon} size={15} />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
