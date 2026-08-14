import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../ui/accordion';
import { Badge } from '../../ui/badge';
import type { ReceiptTemplate } from '../../../types';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  InvoiceIcon,
  InformationCircleIcon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
} from '@hugeicons/core-free-icons';

interface ReceiptPreviewMobileInfoProps {
  template: ReceiptTemplate;
  isPreset: boolean;
  isActive: boolean;
}

export function ReceiptPreviewMobileInfo({
  template,
  isPreset,
  isActive,
}: ReceiptPreviewMobileInfoProps) {
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
    <div className="space-y-3 w-full min-w-0 pt-2">
      <h3 className="text-xs font-bold font-heading text-muted-foreground uppercase tracking-wider px-1">
        Template Specifications
      </h3>

      <Accordion defaultValue={['specs']} className="space-y-2.5 w-full">
        {/* Accordion 1: Identity & Paper */}
        <AccordionItem value="specs" className="border border-border/80 rounded-2xl bg-card px-4 shadow-xs overflow-hidden">
          <AccordionTrigger className="hover:no-underline py-3.5">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <div className="p-1.5 rounded-lg bg-cinnamon/10 text-cinnamon border border-cinnamon/20 shadow-2xs">
                <HugeiconsIcon icon={InvoiceIcon} size={14} />
              </div>
              <span>Template & Paper Details</span>
            </div>
          </AccordionTrigger>

          <AccordionContent className="text-xs space-y-2 pt-1 pb-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[11px]">Classification</span>
              <div className="flex items-center gap-1.5">
                {isActive && (
                  <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white font-bold text-[10px] px-1.5 py-0">
                    Active
                  </Badge>
                )}
                {isPreset ? (
                  <Badge variant="outline" className="text-[10px] font-semibold bg-secondary/60">
                    Preset Baseline
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] font-semibold text-cinnamon border-cinnamon/30 bg-cinnamon/5">
                    Custom Template
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[11px]">Paper Configuration</span>
              <span className="font-mono font-bold text-foreground">
                {is80mm ? '80 mm (48 Columns)' : '58 mm (32 Columns)'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[11px]">Divider Style</span>
              <span className="font-mono capitalize text-foreground">{config?.dividerStyle || 'Dashed'}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[11px]">Header Alignment</span>
              <span className="capitalize text-foreground">{config?.header?.alignment || 'Center'}</span>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Accordion 2: Section Presence Summary */}
        <AccordionItem value="sections" className="border border-border/80 rounded-2xl bg-card px-4 shadow-xs overflow-hidden">
          <AccordionTrigger className="hover:no-underline py-3.5">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <div className="p-1.5 rounded-lg bg-cinnamon/10 text-cinnamon border border-cinnamon/20 shadow-2xs">
                <HugeiconsIcon icon={InformationCircleIcon} size={14} />
              </div>
              <span>Included Content Sections</span>
            </div>
          </AccordionTrigger>

          <AccordionContent className="text-xs pt-1 pb-4">
            <div className="grid grid-cols-2 gap-1.5">
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
