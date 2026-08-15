import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Separator } from '../../ui/separator';
import type { ReceiptTemplate } from '../../../types';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CheckmarkCircle02Icon,
  Cancel01Icon,
  Edit02Icon,
  PrinterIcon,
  StarIcon,
  InvoiceIcon,
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

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-4 py-1.5 text-[11px]">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-right font-semibold text-foreground">{value}</span>
  </div>
);

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
  const sections = [
    { name: 'Cafe branding', enabled: config.header.cafeNameVisible },
    { name: 'Customer details', enabled: config.customerInfo.customerNameVisible || config.customerInfo.phoneVisible },
    { name: 'Item breakdown', enabled: config.items.showHeaders || config.items.showUnitPrice },
    { name: 'Totals & tax', enabled: config.summary.subtotalVisible || config.summary.taxVisible },
    { name: 'Payment breakdown', enabled: config.payment.paymentMethodVisible || config.payment.amountPaidVisible },
    { name: 'Footer message', enabled: Boolean(config.footer.thankYouMessage) },
  ];

  return (
    <aside aria-label="Template information" className="space-y-3">
      <Card className="overflow-hidden rounded-2xl border-border/80 bg-card shadow-sm">
        <CardContent className="p-0">
          <div className="border-b border-border/70 bg-secondary/20 p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cinnamon/20 bg-cinnamon/10 text-cinnamon">
                <HugeiconsIcon icon={InvoiceIcon} size={19} />
              </div>
              <Badge
                variant="outline"
                className={isActive
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-[10px] font-bold text-emerald-700 dark:text-emerald-300'
                  : 'bg-card text-[10px] font-semibold text-muted-foreground'}
              >
                {isActive ? 'Active template' : 'Available template'}
              </Badge>
            </div>
            <h2 className="font-heading text-base font-bold text-foreground">{template.name}</h2>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              {template.description || 'A saved thermal receipt layout for RadhaCafe orders.'}
            </p>
          </div>

          <div className="space-y-3 p-4">
            <section aria-labelledby="template-details-heading">
              <div className="mb-2 flex items-center gap-2">
                <h3 id="template-details-heading" className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Template details</h3>
              </div>
              <SummaryRow label="Type" value={isPreset ? 'Built-in preset' : 'Custom template'} />
              <SummaryRow label="Paper" value={is80mm ? '80 mm · 48 columns' : '58 mm · 32 columns'} />
              <SummaryRow label="Header" value={`${config.header.alignment} aligned`} />
              <SummaryRow label="Divider" value={config.dividerStyle} />
              <SummaryRow label="Feed after print" value={`${config.feedLines || 3} lines`} />
            </section>

            <Separator />

            <section aria-labelledby="included-content-heading">
              <div className="mb-3 flex items-center gap-2">
                <HugeiconsIcon icon={InformationCircleIcon} size={14} className="text-cinnamon" />
                <h3 id="included-content-heading" className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Included content</h3>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                {sections.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5 text-[10px]">
                    <span className={`flex shrink-0 items-center ${item.enabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground/70'}`}>
                      <HugeiconsIcon icon={item.enabled ? CheckmarkCircle02Icon : Cancel01Icon} size={13} />
                    </span>
                    <span className={item.enabled ? 'font-medium text-foreground' : 'text-muted-foreground'}>{item.name}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/80 bg-card shadow-sm">
        <CardContent className="space-y-2.5 p-4">
          <Button type="button" onClick={onCustomize} className="h-10 w-full justify-center gap-2 rounded-xl bg-cinnamon text-xs font-bold text-white hover:bg-cinnamon/90">
            <HugeiconsIcon icon={Edit02Icon} size={15} />
            Customize in editor
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant="outline" onClick={onTestPrint} disabled={isTestPrinting} className="h-9 justify-center gap-1.5 rounded-xl text-xs font-semibold">
              <HugeiconsIcon icon={PrinterIcon} size={14} className="text-cinnamon" />
              {isTestPrinting ? 'Printing...' : 'Test print'}
            </Button>
            {isActive ? (
              <Button type="button" variant="outline" disabled className="h-9 justify-center gap-1.5 rounded-xl border-emerald-500/30 bg-emerald-500/10 text-xs font-bold text-emerald-700 opacity-100 dark:text-emerald-300">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} />
                Active
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={onActivate} disabled={isActivating} className="h-9 justify-center gap-1.5 rounded-xl border-cinnamon/40 text-xs font-bold text-cinnamon hover:bg-cinnamon/10">
                <HugeiconsIcon icon={StarIcon} size={14} />
                {isActivating ? 'Activating...' : 'Use template'}
              </Button>
            )}
          </div>
          <p className="px-1 text-[10px] leading-relaxed text-muted-foreground">
            Test printing uses the current preview data and never changes the active template.
          </p>
        </CardContent>
      </Card>
    </aside>
  );
}
