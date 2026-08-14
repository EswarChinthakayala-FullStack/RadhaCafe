import { useNavigate } from 'react-router-dom';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { ROUTES } from '../../../constants/routes';
import type { ReceiptTemplate } from '../../../types';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowLeft01Icon,
  Edit02Icon,
  PrinterIcon,
  StarIcon,
  CheckmarkCircle02Icon,
  MoreVerticalIcon,
  Copy01Icon,
  Delete02Icon,
  Loading03Icon,
} from '@hugeicons/core-free-icons';

interface ReceiptPreviewHeaderProps {
  template: ReceiptTemplate;
  isPreset: boolean;
  isActive: boolean;
  onCustomize: () => void;
  onTestPrint: () => void;
  onActivate: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onBrowserPrint?: () => void;
  isActivating?: boolean;
  isTestPrinting?: boolean;
  printerConnected?: boolean;
}

export function ReceiptPreviewHeader({
  template,
  isPreset,
  isActive,
  onCustomize,
  onTestPrint,
  onActivate,
  onDuplicate,
  onDelete,
  onBrowserPrint,
  isActivating = false,
  isTestPrinting = false,
  printerConnected = false,
}: ReceiptPreviewHeaderProps) {
  const navigate = useNavigate();
  const paperCols = template.paper_width || template.template_config?.paperWidth || 32;
  const is80mm = paperCols >= 42;

  return (
    <div className="sticky top-0 z-20 -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 px-4 py-3 sm:px-6 bg-card/95 backdrop-blur-md border-b border-border/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      {/* Left: Back Navigation + Template Title + Status Pills */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => navigate(ROUTES.ADMIN.RECEIPTS)}
          className="h-9 w-9 p-0 rounded-xl hover:bg-secondary shrink-0"
          title="Back to Templates Gallery"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
        </Button>

        <div className="space-y-0.5 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <h1 className="font-bold text-base sm:text-lg font-heading text-foreground tracking-tight break-words">
              {template.name}
            </h1>

            {/* Status Badges */}
            {isActive ? (
              <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white font-bold text-[10px] gap-1 px-2 py-0.5 shrink-0">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={11} />
                <span>Active Template</span>
              </Badge>
            ) : isPreset ? (
              <Badge variant="outline" className="text-[10px] font-semibold bg-secondary/60 shrink-0">
                Preset Baseline
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] font-semibold text-cinnamon border-cinnamon/30 bg-cinnamon/5 shrink-0">
                Custom Template
              </Badge>
            )}

            <Badge variant="outline" className="text-[10px] font-mono bg-secondary/40 shrink-0">
              {is80mm ? '80 mm' : '58 mm'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Right: Operational Actions */}
      <div className="flex items-center gap-2 flex-wrap shrink-0 w-full sm:w-auto justify-end">
        {/* Test Print Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onTestPrint}
          disabled={isTestPrinting}
          className="h-8.5 text-xs font-semibold rounded-xl border-border/80 bg-card hover:bg-secondary gap-1.5 shadow-2xs flex-1 sm:flex-none justify-center"
          title={printerConnected ? 'Send test receipt to connected printer' : 'Test thermal print byte stream'}
        >
          {isTestPrinting ? (
            <>
              <HugeiconsIcon icon={Loading03Icon} size={14} className="animate-spin" />
              <span>Transmitting...</span>
            </>
          ) : (
            <>
              <HugeiconsIcon icon={PrinterIcon} size={14} className="text-cinnamon" />
              <span>Test Print</span>
            </>
          )}
        </Button>

        {/* Customize / Edit Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCustomize}
          className="h-8.5 text-xs font-semibold rounded-xl border-border/80 bg-card hover:bg-secondary gap-1.5 shadow-2xs flex-1 sm:flex-none justify-center"
        >
          <HugeiconsIcon icon={Edit02Icon} size={14} className="text-cinnamon" />
          <span>Customize</span>
        </Button>

        {/* Use Template / Active State Button */}
        {isActive ? (
          <Button
            type="button"
            disabled
            size="sm"
            className="h-8.5 text-xs font-bold rounded-xl bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 gap-1.5 opacity-100 flex-1 sm:flex-none justify-center"
          >
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} />
            <span>Active</span>
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            onClick={onActivate}
            disabled={isActivating}
            className="h-8.5 text-xs font-bold rounded-xl bg-cinnamon hover:bg-cinnamon/90 text-white gap-1.5 shadow-2xs flex-1 sm:flex-none justify-center"
          >
            {isActivating ? (
              <>
                <HugeiconsIcon icon={Loading03Icon} size={14} className="animate-spin" />
                <span>Activating...</span>
              </>
            ) : (
              <>
                <HugeiconsIcon icon={StarIcon} size={14} />
                <span>Use Template</span>
              </>
            )}
          </Button>
        )}

        {/* More Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8.5 w-8.5 p-0 rounded-xl hover:bg-secondary text-muted-foreground shrink-0"
              />
            }
          >
            <HugeiconsIcon icon={MoreVerticalIcon} size={16} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 rounded-xl p-1 text-xs">
            {onDuplicate && (
              <DropdownMenuItem
                onClick={onDuplicate}
                className="cursor-pointer gap-2 font-medium"
              >
                <HugeiconsIcon icon={Copy01Icon} size={13} />
                <span>Duplicate / Copy</span>
              </DropdownMenuItem>
            )}

            {onBrowserPrint && (
              <DropdownMenuItem
                onClick={onBrowserPrint}
                className="cursor-pointer gap-2 font-medium"
              >
                <HugeiconsIcon icon={PrinterIcon} size={13} />
                <span>Browser Print</span>
              </DropdownMenuItem>
            )}

            {!isPreset && !isActive && onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onDelete}
                  className="cursor-pointer gap-2 font-medium text-destructive focus:text-destructive"
                >
                  <HugeiconsIcon icon={Delete02Icon} size={13} />
                  <span>Delete Template</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
