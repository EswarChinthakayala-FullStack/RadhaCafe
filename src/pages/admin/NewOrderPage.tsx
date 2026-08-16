import { NewOrderForm } from '../../components/admin/orders/NewOrderForm';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useBluetoothPrinter } from '../../hooks/useBluetoothPrinter';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ShoppingCart01Icon,
  Invoice01Icon,
  PrinterIcon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  BluetoothIcon,
} from '@hugeicons/core-free-icons';

export function NewOrderPage() {
  const { isConnected, isConnecting, isReconnecting, reconnectNow, savedPrinterName } = useBluetoothPrinter();

  return (
    <div className="space-y-3 sm:space-y-4 max-w-[1680px] mx-auto min-w-0 w-full pb-8">
      {/* Header Bar — Compact, touch-ready & fully responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 border-b border-border/80 pb-3">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 sm:p-2 rounded-lg bg-cinnamon/10 text-cinnamon border border-cinnamon/20 shrink-0">
              <HugeiconsIcon icon={ShoppingCart01Icon} size={18} />
            </div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold font-heading text-foreground tracking-tight truncate">
              New Cafe Order
            </h1>
            <Badge variant="outline" className="text-[10px] font-bold px-1.5 sm:px-2 py-0 rounded-full bg-secondary text-secondary-foreground border-border/60 shrink-0">
              POS
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Quick Counter Point-of-Sale · Select menu items, customize, and generate instant receipts.
          </p>
        </div>

        {/* Right side controls: Printer Status & Order History */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 self-start sm:self-auto">
          {/* Bluetooth Thermal Printer Status Widget */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-card border border-border/80 text-xs shadow-2xs">
            <HugeiconsIcon
              icon={PrinterIcon}
              size={14}
              className={isConnected ? 'text-emerald-600' : 'text-amber-600'}
            />
            <span className="font-semibold text-foreground text-[11px] sm:text-xs hidden xs:inline">
              {savedPrinterName ? `${savedPrinterName}:` : 'Printer:'}
            </span>
            <span
              className={`font-bold inline-flex items-center gap-1 text-[11px] sm:text-xs ${
                isConnected ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              <HugeiconsIcon
                icon={isConnected ? CheckmarkCircle01Icon : AlertCircleIcon}
                size={11}
              />
              {isConnected
                ? 'Ready'
                : isConnecting || isReconnecting
                ? 'Reconnecting...'
                : 'Offline'}
            </span>

            {!isConnected && (
              <Button
                type="button"
                size="sm"
                onClick={() => reconnectNow()}
                disabled={isConnecting || isReconnecting}
                className="h-5 sm:h-6 px-1.5 sm:px-2 text-[10px] font-bold bg-primary hover:bg-primary/90 text-primary-foreground ml-1 gap-1 rounded"
              >
                <HugeiconsIcon icon={BluetoothIcon} size={10} className={isConnecting || isReconnecting ? 'animate-pulse' : ''} />
                <span>Reconnect</span>
              </Button>
            )}
          </div>

          {/* Link to Order History */}
          <Link
            to={ROUTES.ADMIN.ORDERS}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border/80 bg-card px-2.5 sm:px-3.5 h-7 sm:h-9 text-[11px] sm:text-xs font-semibold text-foreground hover:bg-secondary/40 transition-all shadow-2xs shrink-0"
            title="View Order History"
          >
            <HugeiconsIcon icon={Invoice01Icon} size={14} />
            <span className="hidden sm:inline">Order History</span>
            <span className="sm:hidden">History</span>
          </Link>
        </div>
      </div>

      <NewOrderForm />
    </div>
  );
}
