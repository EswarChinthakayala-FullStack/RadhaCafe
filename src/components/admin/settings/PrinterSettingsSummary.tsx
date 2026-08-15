import { useNavigate } from 'react-router-dom';
import { useBluetoothPrinter } from '../../../hooks/useBluetoothPrinter';
import { usePrinterSettings } from '../../../hooks/useSettings';
import { SettingsSection } from './SettingsSection';
import { SettingsRow } from './SettingsRow';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Skeleton } from '../../ui/skeleton';
import { ROUTES } from '../../../constants/routes';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CheckmarkCircle02Icon,
  LinkSquare01Icon,
  Loading03Icon,
  PrinterIcon,
} from '@hugeicons/core-free-icons';

export function PrinterSettingsSummary() {
  const navigate = useNavigate();
  const { data: settings, isLoading } = usePrinterSettings();
  const { isConnected, isConnecting, device } = useBluetoothPrinter();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32 rounded-lg" />
          <Skeleton className="h-4 w-64 rounded-md" />
        </div>
        <Skeleton className="h-36 w-full rounded-2xl" />
      </div>
    );
  }

  const printerName = device?.name || settings?.printer_name || 'No preferred printer';
  const paperWidth = settings?.paper_width === 48 ? '80 mm' : '58 mm';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 border-b border-border/60 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <h3 className="text-lg font-bold text-foreground">Printer</h3>
          <p className="text-xs text-muted-foreground">
            Review the preferred thermal printer and open the dedicated connection tools.
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={() => navigate(ROUTES.ADMIN.PRINTER)}
          className="h-9 gap-1.5 self-start rounded-xl bg-cinnamon text-xs font-bold text-white hover:bg-cinnamon/90 sm:self-auto"
        >
          <HugeiconsIcon icon={LinkSquare01Icon} size={14} />
          <span>Manage Printer</span>
        </Button>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-secondary/20 p-4">
        <div className={`rounded-xl border p-2.5 ${
          isConnected
            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600'
            : 'border-border/80 bg-card text-muted-foreground'
        }`}>
          <HugeiconsIcon icon={PrinterIcon} size={22} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-foreground">{printerName}</p>
          <p className="text-[11px] text-muted-foreground">Bluetooth thermal printer</p>
        </div>

        {isConnected ? (
          <Badge className="h-5 gap-1 bg-emerald-600 px-2 text-[10px] font-bold text-white">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={11} />
            Connected
          </Badge>
        ) : isConnecting ? (
          <Badge variant="outline" className="h-5 gap-1 border-amber-500/30 bg-amber-500/10 px-2 text-[10px] text-amber-700">
            <HugeiconsIcon icon={Loading03Icon} size={11} className="animate-spin" />
            Connecting
          </Badge>
        ) : (
          <Badge variant="outline" className="h-5 px-2 text-[10px] text-muted-foreground">
            Offline
          </Badge>
        )}
      </div>

      <SettingsSection title="Thermal Printer" showSeparator={false}>
        <SettingsRow
          title="Preferred Printer"
          description="The saved printer name used for reconnection."
        >
          <span className="text-xs font-medium text-foreground">{printerName}</span>
        </SettingsRow>

        <SettingsRow
          title="Paper Width"
          description="Receipt roll width used by the printer formatter."
        >
          <span className="text-xs font-medium text-foreground">{paperWidth}</span>
        </SettingsRow>

        <SettingsRow
          title="Automatic Reconnection"
          description="Whether RadhaCafe attempts to reconnect to an authorized printer."
        >
          <span className="text-xs font-medium text-foreground">
            {settings?.auto_connect === false ? 'Off' : 'On'}
          </span>
        </SettingsRow>
      </SettingsSection>
    </div>
  );
}
