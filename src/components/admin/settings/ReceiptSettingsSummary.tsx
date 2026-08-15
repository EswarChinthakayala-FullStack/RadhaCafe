import { useNavigate } from 'react-router-dom';
import { useActiveReceiptTemplate } from '../../../hooks/useReceiptTemplates';
import { SettingsSection } from './SettingsSection';
import { SettingsRow } from './SettingsRow';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Skeleton } from '../../ui/skeleton';
import { ROUTES } from '../../../constants/routes';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  InvoiceIcon,
  ViewIcon,
  Layout01Icon,
  CheckmarkCircle02Icon,
  LinkSquare01Icon,
} from '@hugeicons/core-free-icons';

export function ReceiptSettingsSummary() {
  const navigate = useNavigate();
  const { data: activeTemplate, isLoading } = useActiveReceiptTemplate();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32 rounded-lg" />
          <Skeleton className="h-4 w-64 rounded-md" />
        </div>
        <Skeleton className="h-44 w-full rounded-2xl" />
      </div>
    );
  }

  if (!activeTemplate) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 border-b border-border/60 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-0.5">
            <h3 className="text-lg font-bold text-foreground">Receipts</h3>
            <p className="text-xs text-muted-foreground">
              Manage the receipt design used for cafe orders and reprints.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => navigate(ROUTES.ADMIN.RECEIPTS)}
            className="h-9 gap-1.5 self-start rounded-xl bg-cinnamon text-xs font-bold text-white hover:bg-cinnamon/90 sm:self-auto"
          >
            <HugeiconsIcon icon={Layout01Icon} size={14} />
            <span>Manage Templates</span>
          </Button>
        </div>

        <div className="rounded-2xl border border-dashed border-border bg-secondary/20 p-8 text-center">
          <HugeiconsIcon icon={InvoiceIcon} size={26} className="mx-auto text-muted-foreground" />
          <p className="mt-3 text-sm font-bold text-foreground">No active receipt template</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Choose a template in the receipt gallery before printing.
          </p>
        </div>
      </div>
    );
  }

  const config = activeTemplate.template_config;
  const paperCols = activeTemplate.paper_width || config?.paperWidth || 32;
  const is80mm = paperCols >= 42;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/60">
        <div className="space-y-0.5">
          <h3 className="text-lg font-bold font-heading text-foreground">
            Receipt Templates
          </h3>
          <p className="text-xs text-muted-foreground">
            Manage the visual design and layout used for printed POS receipts and reprints.
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={() => navigate(ROUTES.ADMIN.RECEIPTS)}
          className="h-8 text-xs font-bold rounded-xl bg-cinnamon hover:bg-cinnamon/90 text-white gap-1.5 self-start sm:self-auto shadow-2xs"
        >
          <HugeiconsIcon icon={Layout01Icon} size={13} />
          <span>Templates Gallery</span>
        </Button>
      </div>

      {/* Active Template Hero Summary Card */}
      <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-secondary/20 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="p-2.5 rounded-xl bg-cinnamon/10 text-cinnamon border border-cinnamon/20 shadow-2xs shrink-0 mt-0.5">
              <HugeiconsIcon icon={InvoiceIcon} size={22} />
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-base text-foreground font-heading truncate">
                  {activeTemplate.name}
                </span>
                <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] font-bold gap-1 px-2 py-0.5 h-5">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={11} />
                  <span>Active Default</span>
                </Badge>
                <Badge variant="outline" className="text-[10px] font-mono font-semibold px-2 py-0.5 h-5 bg-background">
                  {is80mm ? '80 mm Roll' : '58 mm Roll'}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {activeTemplate.description || 'Standard receipt format for RadhaCafe counter orders.'}
              </p>

              {/* Quick Feature Checklist */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} className="text-cinnamon" />
                  {config?.header?.logoVisible ? 'Logo' : 'Text branding'}
                </span>
                <span className="flex items-center gap-1">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} className="text-cinnamon" />
                  {config?.summary?.taxVisible ? 'Tax line' : 'Flat total'}
                </span>
                <span className="flex items-center gap-1">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} className="text-cinnamon" />
                  {config?.payment?.payLaterIndicator ? 'Pay later status' : 'Payment status'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate(`/admin/settings/receipts/${activeTemplate.id}/preview`)}
              className="h-8 text-xs font-semibold rounded-xl border-border/80 bg-card hover:bg-secondary gap-1.5 shadow-2xs"
            >
              <HugeiconsIcon icon={ViewIcon} size={13} className="text-cinnamon" />
              <span>Full Preview</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Section: Operational Shortcuts */}
      <SettingsSection title="Receipt Workflow" showSeparator={false}>
        <SettingsRow
          title="Receipt Design System"
          description="Switch between classic, compact, modern, and detailed multi-item designs in the gallery."
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate(ROUTES.ADMIN.RECEIPTS)}
            className="h-8.5 text-xs font-semibold rounded-xl border-border/80 bg-card hover:bg-secondary gap-1.5 shadow-2xs"
          >
            <HugeiconsIcon icon={LinkSquare01Icon} size={13} className="text-cinnamon" />
            <span>Manage All Templates</span>
          </Button>
        </SettingsRow>

        <SettingsRow
          title="Custom Live Editor"
          description="Adjust dividers, item column headers, thank you footers, and test print directly to thermal printer."
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/settings/receipts/${activeTemplate.id}/edit`)}
            className="h-8.5 text-xs font-semibold rounded-xl border-border/80 bg-card hover:bg-secondary gap-1.5 shadow-2xs"
          >
            <HugeiconsIcon icon={LinkSquare01Icon} size={13} className="text-cinnamon" />
            <span>Customize Active Layout</span>
          </Button>
        </SettingsRow>
      </SettingsSection>
    </div>
  );
}
