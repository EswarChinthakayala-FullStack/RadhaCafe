import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { formatCurrency } from '../../lib/utils/formatCurrency';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  PrinterIcon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  Cancel01Icon,
  RotateLeft01Icon,
  Clock01Icon,
} from '@hugeicons/core-free-icons';
import type { PrintJob, PrintJobStatus } from '../../types/printQueue.types';

interface PrintQueueItemProps {
  job: PrintJob;
  onRetry: (id: string) => void;
  onMarkDone: (id: string) => void;
  onCancel: (id: string) => void;
}

function getStatusConfig(status: PrintJobStatus) {
  switch (status) {
    case 'printing':
      return {
        label: 'Printing...',
        badgeClass: 'bg-cinnamon/15 text-cinnamon border-cinnamon/30 animate-pulse',
        icon: PrinterIcon,
      };
    case 'preparing':
      return {
        label: 'Preparing',
        badgeClass: 'bg-cinnamon/10 text-cinnamon border-cinnamon/20',
        icon: Clock01Icon,
      };
    case 'queued':
      return {
        label: 'Waiting',
        badgeClass: 'bg-secondary text-muted-foreground border-border/80',
        icon: Clock01Icon,
      };
    case 'waiting-for-printer':
      return {
        label: 'Waiting for Printer',
        badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
        icon: Clock01Icon,
      };
    case 'reconnecting':
      return {
        label: 'Reconnecting...',
        badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 animate-pulse',
        icon: RotateLeft01Icon,
      };
    case 'tear-wait':
      return {
        label: 'Ready to tear',
        badgeClass: 'bg-cinnamon/20 text-cinnamon border-cinnamon/40 font-bold',
        icon: CheckmarkCircle02Icon,
      };
    case 'sent':
      return {
        label: 'Sent',
        badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25',
        icon: CheckmarkCircle02Icon,
      };
    case 'needs-review':
      return {
        label: 'Needs Attention',
        badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 font-bold',
        icon: AlertCircleIcon,
      };
    case 'interrupted':
      return {
        label: 'Interrupted',
        badgeClass: 'bg-destructive/15 text-destructive border-destructive/30 font-bold',
        icon: AlertCircleIcon,
      };
    case 'failed':
      return {
        label: 'Failed',
        badgeClass: 'bg-destructive/15 text-destructive border-destructive/30 font-bold',
        icon: AlertCircleIcon,
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        badgeClass: 'bg-secondary text-muted-foreground border-border/60 line-through',
        icon: Cancel01Icon,
      };
    default:
      return {
        label: 'Queued',
        badgeClass: 'bg-secondary text-muted-foreground border-border/80',
        icon: Clock01Icon,
      };
  }
}

export function PrintQueueItem({
  job,
  onRetry,
  onMarkDone,
  onCancel,
}: PrintQueueItemProps) {
  const statusCfg = getStatusConfig(job.status);
  const StatusIcon = statusCfg.icon;

  const isPrinting = job.status === 'printing' || job.status === 'preparing';
  const isProblematic =
    job.status === 'needs-review' || job.status === 'interrupted' || job.status === 'failed';
  const isCancellable =
    job.status === 'queued' || job.status === 'waiting-for-printer' || job.status === 'reconnecting';

  // Calculate percentage
  const progressPercent =
    job.totalBytes > 0 ? Math.min(100, Math.round((job.bytesWritten / job.totalBytes) * 100)) : isPrinting ? 15 : 0;

  return (
    <div
      className={`p-3 rounded-xl border transition-all space-y-2 text-xs ${
        isProblematic
          ? 'bg-amber-500/5 border-amber-500/30 dark:bg-amber-950/10'
          : isPrinting
          ? 'bg-card border-cinnamon/40 shadow-xs'
          : 'bg-card/70 border-border/70 hover:border-border'
      }`}
    >
      {/* Header: Order # & Status Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-bold font-mono text-foreground truncate">
            {job.data.orderNumber}
          </span>

          {job.type === 'reprint' && (
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 rounded font-semibold text-muted-foreground">
              Reprint
            </Badge>
          )}

          {job.type === 'printer-test' && (
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 rounded font-semibold text-blue-600 border-blue-500/30">
              Test Slip
            </Badge>
          )}
        </div>

        <Badge
          variant="outline"
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md gap-1 shrink-0 ${statusCfg.badgeClass}`}
        >
          <HugeiconsIcon icon={StatusIcon} size={11} className="shrink-0" />
          <span>{statusCfg.label}</span>
        </Badge>
      </div>

      {/* Details Row: Customer name & Total */}
      <div className="flex items-center justify-between gap-2 text-muted-foreground text-[11px]">
        <span className="truncate">
          {job.data.customerName ? job.data.customerName : 'Counter Customer'}
        </span>
        {job.data.totalAmount > 0 && (
          <span className="font-mono font-semibold text-foreground shrink-0">
            {formatCurrency(job.data.totalAmount)}
          </span>
        )}
      </div>

      {/* Active Transmission Progress */}
      {isPrinting && (
        <div className="space-y-1 pt-0.5">
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Sending receipt...</span>
            <span className="font-mono">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-1.5 bg-secondary" />
        </div>
      )}

      {/* Error / Interruption notice */}
      {job.errorMessage && (
        <p className="text-[11px] text-destructive leading-tight bg-destructive/10 p-1.5 rounded-md border border-destructive/20">
          {job.errorMessage}
        </p>
      )}

      {/* Action buttons */}
      {(isProblematic || isCancellable) && (
        <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-border/50">
          {isProblematic && (
            <>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => onMarkDone(job.id)}
                className="h-6 text-[11px] font-semibold rounded-lg border-border/80 bg-card hover:bg-secondary gap-1"
              >
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={11} className="text-emerald-600" />
                <span>Mark as Done</span>
              </Button>
              <Button
                type="button"
                size="xs"
                onClick={() => onRetry(job.id)}
                className="h-6 text-[11px] font-bold rounded-lg bg-cinnamon hover:bg-cinnamon/90 text-white gap-1 shadow-2xs"
              >
                <HugeiconsIcon icon={RotateLeft01Icon} size={11} />
                <span>Reprint</span>
              </Button>
            </>
          )}

          {isCancellable && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => onCancel(job.id)}
              className="h-6 text-[11px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 px-2 rounded-lg gap-1"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={11} />
              <span>Cancel</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
