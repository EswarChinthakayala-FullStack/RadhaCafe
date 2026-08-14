import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { ReceiptPreview } from '../printer/ReceiptPreview';
import { SAMPLE_DATASETS } from '../../../lib/printer/presetTemplates';
import type { ReceiptTemplate, ReceiptTemplateConfig } from '../../../types';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  PrinterIcon,
  Edit02Icon,
  StarIcon,
  CheckmarkCircle02Icon,
} from '@hugeicons/core-free-icons';

interface ReceiptPreviewModalProps {
  template: ReceiptTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  cafeSettings?: any;
  onCustomize: (template: ReceiptTemplate) => void;
  onUseTemplate: (template: ReceiptTemplate) => void;
  onTestPrint: (template: ReceiptTemplate) => Promise<boolean>;
  isTestPrinting?: boolean;
}

export function ReceiptPreviewModal({
  template,
  isOpen,
  onClose,
  cafeSettings,
  onCustomize,
  onUseTemplate,
  onTestPrint,
  isTestPrinting = false,
}: ReceiptPreviewModalProps) {
  const [selectedDataset, setSelectedDataset] = useState<'paid' | 'payLater' | 'walkIn'>('paid');
  const [overrideWidth, setOverrideWidth] = useState<number | null>(null);

  if (!template) return null;

  const initialWidth = template.paper_width || template.template_config?.paperWidth || 32;
  const activeWidth = overrideWidth !== null ? overrideWidth : initialWidth;

  // Clone config with active width override
  const activeConfig: ReceiptTemplateConfig = {
    ...(template.template_config || {}),
    paperWidth: activeWidth,
  } as ReceiptTemplateConfig;

  const currentSampleOrder =
    selectedDataset === 'payLater'
      ? SAMPLE_DATASETS.payLater
      : selectedDataset === 'walkIn'
      ? SAMPLE_DATASETS.walkIn
      : SAMPLE_DATASETS.paid;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl bg-card border border-border/80 p-4 sm:p-6 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <DialogHeader className="pb-3 border-b border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-6">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-lg font-bold font-heading text-foreground">
                  {template.name}
                </DialogTitle>
                {template.is_active && (
                  <Badge className="bg-emerald-600 text-white font-bold text-[10px] gap-1 px-2 py-0.5">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={11} />
                    <span>Active Template</span>
                  </Badge>
                )}
              </div>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Full-size simulation of thermal printer byte stream and text wrapping.
              </DialogDescription>
            </div>

            {/* Quick Actions in Header */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onTestPrint(template)}
                disabled={isTestPrinting}
                className="h-8.5 text-xs font-semibold rounded-xl border-border/80 bg-card hover:bg-secondary gap-1.5 shadow-2xs"
              >
                <HugeiconsIcon icon={PrinterIcon} size={13} className="text-cinnamon" />
                <span>{isTestPrinting ? 'Printing...' : 'Test Print'}</span>
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={() => {
                  onClose();
                  onCustomize(template);
                }}
                className="h-8.5 text-xs font-bold rounded-xl bg-cinnamon hover:bg-cinnamon/90 text-white gap-1.5 shadow-2xs"
              >
                <HugeiconsIcon icon={Edit02Icon} size={13} />
                <span>Customize</span>
              </Button>
            </div>
          </div>

          {/* Interactive Inspection Controls Bar */}
          <div className="pt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Paper Width Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground mr-1">Roll Width:</span>
              <div className="flex items-center bg-secondary/60 p-0.5 rounded-lg border border-border/60">
                <button
                  type="button"
                  onClick={() => setOverrideWidth(32)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                    activeWidth === 32
                      ? 'bg-card text-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  58mm (32 cols)
                </button>
                <button
                  type="button"
                  onClick={() => setOverrideWidth(48)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                    activeWidth === 48
                      ? 'bg-card text-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  80mm (48 cols)
                </button>
              </div>
            </div>

            {/* Sample Dataset Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground mr-1">Sample Data:</span>
              <div className="flex items-center bg-secondary/60 p-0.5 rounded-lg border border-border/60">
                <button
                  type="button"
                  onClick={() => setSelectedDataset('paid')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                    selectedDataset === 'paid'
                      ? 'bg-card text-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Paid (UPI)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDataset('payLater')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                    selectedDataset === 'payLater'
                      ? 'bg-card text-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Credit / Pay Later
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDataset('walkIn')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                    selectedDataset === 'walkIn'
                      ? 'bg-card text-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Walk-in (Cash)
                </button>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Receipt Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-secondary/20 rounded-xl border border-border/60 flex justify-center my-2">
          <ReceiptPreview
            order={currentSampleOrder}
            templateConfig={activeConfig}
            cafeSettings={cafeSettings}
          />
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-3">
          <div className="text-[11px] text-muted-foreground hidden sm:block">
            Preview accurately approximates ESC/POS character alignment, bold headers, and section feed cuts.
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs rounded-xl h-9"
            >
              Close
            </Button>

            {!template.is_active && (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  onClose();
                  onUseTemplate(template);
                }}
                className="text-xs font-bold rounded-xl bg-cinnamon hover:bg-cinnamon/90 text-white h-9 gap-1.5 shadow-2xs"
              >
                <HugeiconsIcon icon={StarIcon} size={14} />
                <span>Use as Active Template</span>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
