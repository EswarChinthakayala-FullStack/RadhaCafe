import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Card, CardContent } from '../../ui/card';
import { ReceiptPreview } from '../printer/ReceiptPreview';
import { SAMPLE_DATASETS } from '../../../lib/printer/presetTemplates';
import type { ReceiptTemplate } from '../../../types';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CheckmarkCircle02Icon,
  Edit02Icon,
  ViewIcon,
  PrinterIcon,
  ArrowDown01Icon,
} from '@hugeicons/core-free-icons';

interface ActiveTemplateHeroProps {
  activeTemplate: ReceiptTemplate;
  cafeSettings?: any;
  onCustomize: (template: ReceiptTemplate) => void;
  onPreview: (template: ReceiptTemplate) => void;
  onTestPrint: () => Promise<boolean>;
  isTestPrinting?: boolean;
  onScrollToGallery?: () => void;
}

export function ActiveTemplateHero({
  activeTemplate,
  cafeSettings,
  onCustomize,
  onPreview,
  onTestPrint,
  isTestPrinting = false,
  onScrollToGallery,
}: ActiveTemplateHeroProps) {
  const paperCols = activeTemplate.paper_width || activeTemplate.template_config?.paperWidth || 32;
  const is80mm = paperCols >= 42;

  return (
    <Card className="rounded-2xl border-2 border-cinnamon/30 bg-linear-to-br from-card via-card to-cinnamon/5 shadow-sm overflow-hidden w-full min-w-0">
      <CardContent className="p-4 sm:p-6 lg:p-7">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center w-full min-w-0">
          {/* Left / Thumbnail Preview (Desktop 5 cols, Mobile full) */}
          <div className="lg:col-span-4 flex justify-center w-full min-w-0">
            <div className="relative group w-full max-w-[280px] sm:max-w-[300px]">
              {/* Receipt Preview Thumbnail with Height Cap & Fade */}
              <div className="max-h-[300px] sm:max-h-[340px] overflow-hidden rounded-xl border border-border/80 bg-neutral-900/5 dark:bg-black/20 p-2 sm:p-3 relative shadow-inner">
                <ReceiptPreview
                  order={SAMPLE_DATASETS.paid}
                  templateConfig={activeTemplate.template_config}
                  cafeSettings={cafeSettings}
                />
                {/* Bottom Gradient Fade */}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-card via-card/80 to-transparent pointer-events-none" />
              </div>

              {/* Quick Preview Hover Trigger */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-xl backdrop-blur-xs">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => onPreview(activeTemplate)}
                  className="text-xs font-bold rounded-xl shadow-lg gap-1.5 bg-white text-neutral-900 hover:bg-white/90"
                >
                  <HugeiconsIcon icon={ViewIcon} size={14} />
                  <span>Inspect Full Receipt</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Right / Template Information & Operational Actions (Desktop 8 cols) */}
          <div className="lg:col-span-8 space-y-4 sm:space-y-5 w-full min-w-0">
            {/* Status Strip & Name */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white font-bold text-xs gap-1.5 px-3 py-1 rounded-lg shadow-2xs">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} />
                  <span>Currently Active Template</span>
                </Badge>
                <Badge variant="outline" className="text-xs font-mono font-bold bg-secondary/60">
                  {is80mm ? '80mm Roll (48 cols)' : '58mm Roll (32 cols)'}
                </Badge>
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  Default Layout
                </Badge>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-foreground tracking-tight">
                {activeTemplate.name}
              </h2>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {activeTemplate.description ||
                  'This template is actively used by default for all new counter orders, takeaway tickets, Pay Later receipts, and historical order reprints.'}
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
              <div className="p-3 rounded-xl bg-secondary/40 border border-border/60 space-y-0.5">
                <span className="text-[11px] text-muted-foreground font-medium block">Divider Style</span>
                <span className="font-bold text-foreground capitalize font-mono text-xs">
                  {activeTemplate.template_config?.dividerStyle || 'Dashed'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-secondary/40 border border-border/60 space-y-0.5">
                <span className="text-[11px] text-muted-foreground font-medium block">Header Layout</span>
                <span className="font-bold text-foreground capitalize text-xs">
                  {activeTemplate.template_config?.header?.alignment || 'Center'} Aligned
                </span>
              </div>
              <div className="p-3 rounded-xl bg-secondary/40 border border-border/60 space-y-0.5 col-span-2 sm:col-span-1">
                <span className="text-[11px] text-muted-foreground font-medium block">Credit & Pay Later</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                  {activeTemplate.template_config?.payment?.payLaterIndicator ? 'Enabled' : 'Hidden'}
                </span>
              </div>
            </div>

            {/* Operational Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap pt-2 w-full">
              <Button
                type="button"
                onClick={() => onCustomize(activeTemplate)}
                className="h-10 text-xs sm:text-sm font-bold rounded-xl bg-cinnamon hover:bg-cinnamon/90 text-white gap-2 shadow-2xs flex-1 sm:flex-none justify-center"
              >
                <HugeiconsIcon icon={Edit02Icon} size={16} />
                <span>Customize Template</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => onPreview(activeTemplate)}
                className="h-10 text-xs sm:text-sm font-semibold rounded-xl border-border/80 bg-card hover:bg-secondary gap-2 shadow-2xs flex-1 sm:flex-none justify-center"
              >
                <HugeiconsIcon icon={ViewIcon} size={16} />
                <span>Preview Full Receipt</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={onTestPrint}
                disabled={isTestPrinting}
                className="h-10 text-xs sm:text-sm font-semibold rounded-xl border-border/80 bg-card hover:bg-secondary gap-2 shadow-2xs flex-1 sm:flex-none justify-center"
              >
                <HugeiconsIcon icon={PrinterIcon} size={16} className="text-cinnamon" />
                <span>{isTestPrinting ? 'Transmitting...' : 'Test Print'}</span>
              </Button>

              {onScrollToGallery && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onScrollToGallery}
                  className="h-10 text-xs font-semibold text-muted-foreground hover:text-foreground gap-1.5 ml-auto hidden sm:flex"
                >
                  <span>Change Template</span>
                  <HugeiconsIcon icon={ArrowDown01Icon} size={14} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
