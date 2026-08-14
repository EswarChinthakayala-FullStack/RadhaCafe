import { useNavigate } from 'react-router-dom';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { ROUTES } from '../../../constants/routes';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  InvoiceIcon,
  Add01Icon,
  PrinterIcon,
  BluetoothIcon,
} from '@hugeicons/core-free-icons';

interface ReceiptGalleryHeaderProps {
  onCreateTemplate: () => void;
  printerConnected?: boolean;
  savedPrinterName?: string | null;
}

export function ReceiptGalleryHeader({
  onCreateTemplate,
  printerConnected = false,
  savedPrinterName,
}: ReceiptGalleryHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/70">
      {/* Title & Subtitle */}
      <div className="space-y-1.5 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="p-2.5 rounded-2xl bg-cinnamon/10 text-cinnamon border border-cinnamon/20 shadow-2xs shrink-0">
            <HugeiconsIcon icon={InvoiceIcon} size={22} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground tracking-tight">
              Receipt Templates
            </h1>
            <p className="text-xs text-muted-foreground">
              Choose how RadhaCafe receipts look, then customize the layout and content.
            </p>
          </div>
        </div>

        {/* Printer & Hardware Status Chip */}
        <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1 font-medium bg-secondary/60 px-2 py-0.5 rounded-md border border-border/50">
            <HugeiconsIcon icon={BluetoothIcon} size={12} className={printerConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-cinnamon'} />
            <span>
              {printerConnected
                ? `Printer: ${savedPrinterName || 'Connected'}`
                : savedPrinterName
                ? `Paired: ${savedPrinterName}`
                : 'Thermal ESC/POS'}
            </span>
          </span>
          <Badge variant="outline" className="text-[10px] font-mono px-2 py-0.5">
            58mm / 80mm Support
          </Badge>
          <span className="text-[11px] text-muted-foreground/80 hidden sm:inline">
            Direct BLE thermal rendering
          </span>
        </div>
      </div>

      {/* Right Desktop Actions */}
      <div className="flex items-center gap-2.5 flex-wrap shrink-0">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => navigate(ROUTES.ADMIN.PRINTER)}
          className="h-9 text-xs font-semibold rounded-xl border-border/80 bg-card hover:bg-secondary gap-1.5 shadow-2xs"
        >
          <HugeiconsIcon icon={PrinterIcon} size={14} />
          <span>Printer Setup</span>
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={onCreateTemplate}
          className="h-9 text-xs font-bold rounded-xl bg-cinnamon hover:bg-cinnamon/90 text-white gap-1.5 shadow-2xs"
        >
          <HugeiconsIcon icon={Add01Icon} size={15} />
          <span>Create Template</span>
        </Button>
      </div>
    </div>
  );
}
