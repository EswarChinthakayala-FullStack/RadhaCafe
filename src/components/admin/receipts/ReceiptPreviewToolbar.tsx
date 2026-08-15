import { Button } from '../../ui/button';
import { RealOrderPickerPopover } from './RealOrderPickerPopover';
import type { Order } from '../../../types';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon,
  MinusSignIcon,
  MaximizeIcon,
  InvoiceIcon,
  MoneyBag02Icon,
  UserCheck01Icon,
} from '@hugeicons/core-free-icons';

export type DatasetMode = 'paid' | 'payLater' | 'walkIn';

interface ReceiptPreviewToolbarProps {
  datasetMode: DatasetMode;
  onDatasetModeChange: (mode: DatasetMode) => void;
  selectedOrder: Order | null;
  onSelectOrder: (order: Order | null) => void;
  simulatedWidth: number;
  onSimulatedWidthChange: (width: number) => void;
  zoomLevel: number;
  onZoomChange: (zoom: number) => void;
  isFitWidth: boolean;
  onToggleFitWidth: () => void;
}

export function ReceiptPreviewToolbar({
  datasetMode,
  onDatasetModeChange,
  selectedOrder,
  onSelectOrder,
  simulatedWidth,
  onSimulatedWidthChange,
  zoomLevel,
  onZoomChange,
  isFitWidth,
  onToggleFitWidth,
}: ReceiptPreviewToolbarProps) {
  const handleZoomIn = () => {
    if (isFitWidth) onToggleFitWidth();
    onZoomChange(Math.min(1.5, Math.round((zoomLevel + 0.15) * 100) / 100));
  };

  const handleZoomOut = () => {
    if (isFitWidth) onToggleFitWidth();
    onZoomChange(Math.max(0.65, Math.round((zoomLevel - 0.15) * 100) / 100));
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-2.5 shadow-sm sm:p-3 flex flex-wrap items-center justify-between gap-3 w-full min-w-0 text-xs">
      {/* Group 1: Dataset / Order Mode */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.14em] hidden sm:inline mr-1">
          Preview data
        </span>

        {/* Dataset Segmented Buttons */}
        <div role="group" aria-label="Sample order type" className="flex items-center bg-secondary/60 p-1 rounded-xl border border-border/60">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => {
              onSelectOrder(null);
              onDatasetModeChange('paid');
            }}
            aria-pressed={!selectedOrder && datasetMode === 'paid'}
            className={`h-8 px-2.5 text-[11px] font-bold rounded-lg gap-1 transition-all ${
              !selectedOrder && datasetMode === 'paid'
                ? 'bg-cinnamon text-white shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <HugeiconsIcon icon={InvoiceIcon} size={12} />
            <span>Paid (UPI)</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => {
              onSelectOrder(null);
              onDatasetModeChange('payLater');
            }}
            aria-pressed={!selectedOrder && datasetMode === 'payLater'}
            className={`h-8 px-2.5 text-[11px] font-bold rounded-lg gap-1 transition-all ${
              !selectedOrder && datasetMode === 'payLater'
                ? 'bg-cinnamon text-white shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <HugeiconsIcon icon={MoneyBag02Icon} size={12} />
            <span>Pay Later</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => {
              onSelectOrder(null);
              onDatasetModeChange('walkIn');
            }}
            aria-pressed={!selectedOrder && datasetMode === 'walkIn'}
            className={`h-8 px-2.5 text-[11px] font-bold rounded-lg gap-1 transition-all ${
              !selectedOrder && datasetMode === 'walkIn'
                ? 'bg-cinnamon text-white shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <HugeiconsIcon icon={UserCheck01Icon} size={12} />
            <span>Walk-in</span>
          </Button>
        </div>

        {/* Real Historical Order Popover Picker */}
        <RealOrderPickerPopover
          selectedOrder={selectedOrder}
          onSelectOrder={onSelectOrder}
        />
      </div>

      {/* Group 2: Paper Width Simulation + Zoom Controls */}
        <div className="flex items-center gap-2 flex-wrap ml-auto">
        {/* Paper Width Simulation Toggle */}
        <div role="group" aria-label="Simulated paper width" className="flex items-center bg-secondary/60 p-1 rounded-xl border border-border/60">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => onSimulatedWidthChange(32)}
            aria-pressed={simulatedWidth === 32}
            className={`h-8 px-2.5 text-[11px] font-mono font-bold rounded-lg transition-all ${
              simulatedWidth === 32
                ? 'bg-cinnamon text-white shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Simulate 58mm (32 characters per line)"
          >
            58 mm
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => onSimulatedWidthChange(48)}
            aria-pressed={simulatedWidth === 48}
            className={`h-8 px-2.5 text-[11px] font-mono font-bold rounded-lg transition-all ${
              simulatedWidth === 48
                ? 'bg-cinnamon text-white shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Simulate 80mm (48 characters per line)"
          >
            80 mm
          </Button>
        </div>

        {/* Zoom Controls */}
        <div role="group" aria-label="Receipt zoom" className="flex items-center bg-secondary/60 p-1 rounded-xl border border-border/60 gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={onToggleFitWidth}
            aria-pressed={isFitWidth}
            className={`h-8 px-2 text-[11px] font-bold rounded-lg gap-1 ${
              isFitWidth ? 'bg-card text-foreground shadow-2xs' : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Fit Width"
          >
            <HugeiconsIcon icon={MaximizeIcon} size={12} />
            <span>Fit</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 0.65}
            aria-label="Zoom out"
            className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground"
            title="Zoom Out"
          >
            <HugeiconsIcon icon={MinusSignIcon} size={13} />
          </Button>

          <span className="text-[10px] font-mono font-bold px-1 text-muted-foreground min-w-[36px] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>

          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 1.5}
            aria-label="Zoom in"
            className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground"
            title="Zoom In"
          >
            <HugeiconsIcon icon={Add01Icon} size={13} />
          </Button>
        </div>
      </div>
    </div>
  );
}
