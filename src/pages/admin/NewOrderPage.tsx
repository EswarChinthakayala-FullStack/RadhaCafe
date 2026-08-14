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
  const { status: printerStatus, connect } = useBluetoothPrinter();
  const isPrinterConnected = printerStatus === 'connected';
  const isPrinterConnecting = printerStatus === 'connecting';

  return (
    <div className="space-y-4 sm:space-y-5 max-w-7xl mx-auto min-w-0 w-full pb-10">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cinnamon/10 text-cinnamon border border-cinnamon/20 shrink-0">
              <HugeiconsIcon icon={ShoppingCart01Icon} size={20} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground tracking-tight">
              New Cafe Order
            </h1>
            <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border-border/60">
              POS Terminal
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground font-medium">
            Select items from the catalog, customize quantities, and place orders atomically with thermal printing.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Bluetooth Thermal Printer Status Widget */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border/80 text-xs shadow-2xs">
            <HugeiconsIcon
              icon={PrinterIcon}
              size={15}
              className={isPrinterConnected ? 'text-emerald-600' : 'text-amber-600'}
            />
            <span className="font-semibold text-foreground hidden xs:inline">Printer:</span>
            <span
              className={`font-bold inline-flex items-center gap-1 ${
                isPrinterConnected ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              <HugeiconsIcon
                icon={isPrinterConnected ? CheckmarkCircle01Icon : AlertCircleIcon}
                size={12}
              />
              {isPrinterConnected
                ? 'Ready'
                : isPrinterConnecting
                ? 'Connecting...'
                : 'Offline'}
            </span>

            {!isPrinterConnected && (
              <Button
                type="button"
                size="sm"
                onClick={connect}
                disabled={isPrinterConnecting}
                className="h-6 px-2 text-[10px] font-bold bg-primary hover:bg-primary/90 text-primary-foreground ml-1.5 gap-1 rounded"
              >
                <HugeiconsIcon icon={BluetoothIcon} size={11} className={isPrinterConnecting ? 'animate-pulse' : ''} />
                <span>Pair</span>
              </Button>
            )}
          </div>

          {/* Link to Order History */}
          <Link
            to={ROUTES.ADMIN.ORDERS}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border/80 bg-card px-3.5 h-9 text-xs font-semibold text-foreground hover:bg-secondary/40 transition-all shadow-2xs shrink-0"
          >
            <HugeiconsIcon icon={Invoice01Icon} size={14} />
            <span className="hidden sm:inline">Order History</span>
          </Link>
        </div>
      </div>

      <NewOrderForm />
    </div>
  );
}
