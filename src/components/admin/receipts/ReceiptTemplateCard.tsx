import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { ReceiptPreview } from '../printer/ReceiptPreview';
import { SAMPLE_DATASETS } from '../../../lib/printer/presetTemplates';
import type { ReceiptTemplate } from '../../../types';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CheckmarkCircle02Icon,
  Edit02Icon,
  ViewIcon,
  StarIcon,
  MoreVerticalIcon,
  Copy01Icon,
  Delete02Icon,
} from '@hugeicons/core-free-icons';

interface ReceiptTemplateCardProps {
  template: ReceiptTemplate;
  isPreset?: boolean;
  isActive?: boolean;
  cafeSettings?: any;
  onPreview: (template: ReceiptTemplate) => void;
  onUseTemplate: (template: ReceiptTemplate) => void;
  onCustomize: (template: ReceiptTemplate) => void;
  onDuplicate?: (template: ReceiptTemplate) => void;
  onDelete?: (template: ReceiptTemplate) => void;
  isActivating?: boolean;
}

export function ReceiptTemplateCard({
  template,
  isPreset = false,
  isActive = false,
  cafeSettings,
  onPreview,
  onUseTemplate,
  onCustomize,
  onDuplicate,
  onDelete,
  isActivating = false,
}: ReceiptTemplateCardProps) {
  const paperCols = template.paper_width || template.template_config?.paperWidth || 32;
  const is80mm = paperCols >= 42;

  return (
    <Card
      className={`rounded-2xl border transition-all duration-200 bg-card overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-md ${
        isActive
          ? 'border-cinnamon ring-2 ring-cinnamon/20 shadow-xs'
          : 'border-border/80 hover:border-cinnamon/40'
      }`}
    >
      <CardContent className="p-4 sm:p-5 space-y-4 flex-1 flex flex-col justify-between">
        {/* Top: Card Header + Status Badges */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-bold text-sm sm:text-base font-heading text-foreground truncate">
                  {template.name}
                </h3>
                {isPreset ? (
                  <Badge variant="outline" className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0 bg-secondary/50">
                    Preset
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0 border-cinnamon/40 text-cinnamon bg-cinnamon/5">
                    Custom
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                {template.description || 'Custom configured receipt format for RadhaCafe.'}
              </p>
            </div>

            {/* Custom Template More Menu (Duplicate, Delete) */}
            {!isPreset && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground shrink-0"
                    />
                  }
                >
                  <HugeiconsIcon icon={MoreVerticalIcon} size={14} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 rounded-xl p-1 text-xs">
                  {onDuplicate && (
                    <DropdownMenuItem
                      onClick={() => onDuplicate(template)}
                      className="cursor-pointer gap-2 font-medium"
                    >
                      <HugeiconsIcon icon={Copy01Icon} size={13} />
                      <span>Duplicate</span>
                    </DropdownMenuItem>
                  )}
                  {onDelete && !isActive && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(template)}
                        className="cursor-pointer gap-2 font-medium text-destructive focus:text-destructive"
                      >
                        <HugeiconsIcon icon={Delete02Icon} size={13} />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Miniature Receipt Preview Box */}
          <div
            onClick={() => onPreview(template)}
            className="group relative cursor-pointer overflow-hidden rounded-xl border border-border/80 bg-neutral-900/5 dark:bg-black/20 p-2 sm:p-2.5 max-h-[220px] transition-colors hover:bg-neutral-900/10 dark:hover:bg-black/30 shadow-inner flex justify-center"
          >
            <div className="w-full pointer-events-none scale-[0.92] origin-top">
              <ReceiptPreview
                order={SAMPLE_DATASETS.paid}
                templateConfig={template.template_config}
                cafeSettings={cafeSettings}
              />
            </div>

            {/* Bottom Gradient Fade */}
            <div className="absolute inset-x-0 bottom-0 h-14 bg-linear-to-t from-card via-card/80 to-transparent pointer-events-none" />

            {/* Quick Hover Inspect Pill */}
            <div className="absolute inset-x-0 bottom-2.5 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="bg-neutral-900/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-md backdrop-blur-xs flex items-center gap-1">
                <HugeiconsIcon icon={ViewIcon} size={11} />
                <span>Click to Preview</span>
              </span>
            </div>
          </div>
        </div>

        {/* Bottom: Metadata Pills & Action Buttons */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/60">
            <span className="font-mono bg-secondary/60 px-2 py-0.5 rounded-md border border-border/50 font-medium">
              {is80mm ? '80mm / 48 cols' : '58mm / 32 cols'}
            </span>
            <span className="capitalize font-medium">
              {template.template_config?.dividerStyle || 'Dashed'} Line
            </span>
          </div>

          {/* Card Button Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => onPreview(template)}
              className="col-span-2 h-9 text-xs font-bold rounded-xl bg-cinnamon hover:bg-cinnamon/90 text-white gap-1.5 shadow-2xs justify-center"
            >
              <HugeiconsIcon icon={ViewIcon} size={14} />
              <span>Open Full Preview</span>
            </Button>
            {isActive ? (
              <Button
                type="button"
                disabled
                size="sm"
                className="h-8.5 text-xs font-bold rounded-xl bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 gap-1 opacity-100 justify-center"
              >
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={13} />
                <span>Active</span>
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onUseTemplate(template)}
                disabled={isActivating}
                className="h-8.5 text-xs font-bold rounded-xl border-border/80 bg-card hover:bg-cinnamon hover:text-white hover:border-cinnamon gap-1 shadow-2xs justify-center transition-colors"
              >
                <HugeiconsIcon icon={StarIcon} size={13} />
                <span>Use Template</span>
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onCustomize(template)}
              className="h-8.5 text-xs font-semibold rounded-xl border-border/80 bg-card hover:bg-secondary gap-1 shadow-2xs justify-center"
            >
              <HugeiconsIcon icon={Edit02Icon} size={13} className="text-cinnamon" />
              <span>Customize</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
