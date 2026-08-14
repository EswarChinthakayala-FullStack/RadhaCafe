import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import type { ReceiptTemplate } from '../../../types';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  InvoiceIcon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  Edit02Icon,
  PrinterIcon,
  StarIcon,
  Settings01Icon,
  AlignLeftIcon,
  InformationCircleIcon,
} from '@hugeicons/core-free-icons';

interface ReceiptTemplateInfoPanelProps {
  template: ReceiptTemplate;
  isPreset: boolean;
  isActive: boolean;
  onCustomize: () => void;
  onTestPrint: () => void;
  onActivate: () => void;
  isActivating?: boolean;
  isTestPrinting?: boolean;
}

export function ReceiptTemplateInfoPanel({
  template,
  isPreset,
  isActive,
  onCustomize,
  onTestPrint,
  onActivate,
  isActivating = false,
  isTestPrinting = false,
}: ReceiptTemplateInfoPanelProps) {
  const config = template.template_config;
  const paperCols = template.paper_width || config?.paperWidth || 32;
  const is80mm = paperCols >= 42;

  const sectionsList = [
    { name: 'Cafe Logo', enabled: config?.header?.logoVisible ?? true },
    { name: 'Cafe Name & Branding', enabled: config?.header?.cafeNameVisible ?? true },
    { name: 'Address & Contact', enabled: (config?.header?.addressVisible || config?.header?.phoneVisible) ?? true },
    { name: 'Order # & Timestamp', enabled: config?.orderInfo?.orderNumberVisible ?? true },
    { name: 'Cashier Identifier', enabled: config?.orderInfo?.cashierVisible ?? true },
    { name: 'Customer Name & Phone', enabled: config?.customerInfo?.customerNameVisible ?? true },
    { name: 'Item Table Headers', enabled: config?.items?.showHeaders ?? true },
    { name: 'Unit Pricing Column', enabled: config?.items?.showUnitPrice ?? true },
    { name: 'Long Text Wrapping', enabled: config?.items?.itemWrapping ?? true },
    { name: 'Tax & GST Lines', enabled: config?.summary?.taxVisible ?? true },
    { name: 'Discounts Line', enabled: config?.summary?.discountVisible ?? true },
    { name: 'Payment Method', enabled: config?.payment?.paymentMethodVisible ?? true },
    { name: 'Pay Later & Due Balance', enabled: config?.payment?.payLaterIndicator ?? true },
    { name: 'Footer Thank You', enabled: Boolean(config?.footer?.thankYouMessage) },
  ];

  return (
    <div className="space-y-4 w-full min-w-0">
      {/* 1. Template Overview Card */}
      <Card className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden">
        <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <div className="p-1.5 rounded-lg bg-cinnamon/10 text-cinnamon border border-cinnamon/20 shadow-2xs">
              <HugeiconsIcon icon={InvoiceIcon} size={15} />
            </div>
            <CardTitle className="text-sm font-bold font-heading">Template Overview</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 space-y-3.5 text-xs">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium text-[11px]">Template Name:</span>
              <span className="font-bold text-foreground">{template.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium text-[11px]">Classification:</span>
              {isPreset ? (
                <Badge variant="outline" className="text-[10px] font-semibold bg-secondary/60">
                  Built-in Preset
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] font-semibold text-cinnamon border-cinnamon/30 bg-cinnamon/5">
                  Custom Template
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium text-[11px]">Active Status:</span>
              {isActive ? (
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-1">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} />
                  <span>Active Default</span>
                </span>
              ) : (
                <span className="text-muted-foreground text-xs">Inactive</span>
              )}
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed p-2.5 rounded-xl bg-secondary/30 border border-border/60">
            {isActive
              ? 'Used by default for all counter orders, takeaway tickets, and reprints.'
              : 'Preview and test this design before making it the default active layout.'}
          </p>
        </CardContent>
      </Card>

      {/* 2. Paper & Typography Specs Card */}
      <Card className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden">
        <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <div className="p-1.5 rounded-lg bg-cinnamon/10 text-cinnamon border border-cinnamon/20 shadow-2xs">
              <HugeiconsIcon icon={Settings01Icon} size={15} />
            </div>
            <CardTitle className="text-sm font-bold font-heading">Paper & Layout Specs</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 space-y-2.5 text-xs divide-y divide-border/40">
          <div className="flex items-center justify-between pt-1">
            <span className="text-muted-foreground text-[11px]">Paper Width</span>
            <span className="font-mono font-bold text-foreground">
              {is80mm ? '80 mm (48 Columns)' : '58 mm (32 Columns)'}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-muted-foreground text-[11px]">Divider Style</span>
            <span className="font-mono font-semibold capitalize text-foreground">
              {config?.dividerStyle || 'Dashed'}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-muted-foreground text-[11px]">Header Alignment</span>
            <span className="font-semibold capitalize text-foreground flex items-center gap-1">
              <HugeiconsIcon icon={AlignLeftIcon} size={12} className="text-muted-foreground" />
              <span>{config?.header?.alignment || 'Center'}</span>
            </span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-muted-foreground text-[11px]">Preview Font</span>
            <span className="font-mono text-foreground">{config?.previewFont || 'JetBrains Mono'}</span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-muted-foreground text-[11px]">Feed Spacing</span>
            <span className="font-mono text-foreground">{config?.feedLines || 3} blank lines</span>
          </div>
        </CardContent>
      </Card>

      {/* 3. Section Visibility Checklist */}
      <Card className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden">
        <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <div className="p-1.5 rounded-lg bg-cinnamon/10 text-cinnamon border border-cinnamon/20 shadow-2xs">
              <HugeiconsIcon icon={InformationCircleIcon} size={15} />
            </div>
            <CardTitle className="text-sm font-bold font-heading">Included Content</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 text-xs">
          <div className="grid grid-cols-2 gap-2">
            {sectionsList.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 text-[11px] p-1.5 rounded-lg bg-secondary/30 border border-border/50"
              >
                {item.enabled ? (
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <HugeiconsIcon icon={Cancel01Icon} size={12} className="text-muted-foreground/60 shrink-0" />
                )}
                <span className={`truncate ${item.enabled ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 4. Action Card */}
      <Card className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden">
        <CardContent className="p-4 sm:p-5 space-y-2.5 text-xs">
          <Button
            type="button"
            onClick={onCustomize}
            className="w-full h-9 text-xs font-bold rounded-xl bg-cinnamon hover:bg-cinnamon/90 text-white gap-2 shadow-2xs justify-center"
          >
            <HugeiconsIcon icon={Edit02Icon} size={14} />
            <span>Customize in Full Editor</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={onTestPrint}
            disabled={isTestPrinting}
            className="w-full h-9 text-xs font-semibold rounded-xl border-border/80 bg-card hover:bg-secondary gap-2 shadow-2xs justify-center"
          >
            <HugeiconsIcon icon={PrinterIcon} size={14} className="text-cinnamon" />
            <span>{isTestPrinting ? 'Transmitting...' : 'Test Print Receipt'}</span>
          </Button>

          {!isActive && (
            <Button
              type="button"
              variant="outline"
              onClick={onActivate}
              disabled={isActivating}
              className="w-full h-9 text-xs font-bold rounded-xl border-cinnamon/40 text-cinnamon hover:bg-cinnamon/10 gap-2 shadow-2xs justify-center"
            >
              <HugeiconsIcon icon={StarIcon} size={14} />
              <span>{isActivating ? 'Activating...' : 'Use This Template'}</span>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
