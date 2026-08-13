import { ReceiptTemplateBuilder } from '../../components/admin/printer/ReceiptTemplateBuilder';
import { HugeiconsIcon } from '@hugeicons/react';
import { InvoiceIcon } from '@hugeicons/core-free-icons';

export function ReceiptsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4 sm:pb-5">
        <div>
          <h2 className="text-2xl font-bold font-heading text-foreground flex items-center gap-3">
            <div className="p-2.5 rounded-md bg-cinnamon/10 text-cinnamon shrink-0 border border-cinnamon/20 shadow-2xs">
              <HugeiconsIcon icon={InvoiceIcon} size={22} />
            </div>
            <span>Receipt Templates & Thermal Builder</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Customize how RadhaCafe thermal receipt slips look, print, format headers, items, and credit payment details.
          </p>
        </div>
      </div>

      <ReceiptTemplateBuilder />
    </div>
  );
}
