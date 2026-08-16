import { useNavigate } from 'react-router-dom';
import { useReceiptPrintQueue } from '../../providers/ReceiptPrintQueueProvider';
import { usePrinterStore } from '../../store/printerStore';
import { PrintQueueItem } from './PrintQueueItem';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ROUTES } from '../../constants/routes';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  PrinterIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  AlertCircleIcon,
  PlayIcon,
  Settings01Icon,
  Delete02Icon,
  FastForwardIcon,
} from '@hugeicons/core-free-icons';

export function PrintQueueDock() {
  const navigate = useNavigate();
  const {
    jobs,
    activeJob,
    activeTearJob,
    waitingCount,
    needsAttentionCount,
    completedCount,
    totalActiveCount,
    isExpanded,
    isPausedForTear,
    tearCountdownRemaining,
    toggleQueue,
    retryJob,
    markJobDone,
    cancelJob,
    continueAfterTear,
    printNextNow,
    clearCompleted,
  } = useReceiptPrintQueue();

  const { status: printerStatus, connectedPrinter, device } = usePrinterStore();
  const printerDisplayName =
    connectedPrinter?.friendly_name ||
    connectedPrinter?.device_name ||
    device?.name ||
    'Thermal Printer';

  // If no jobs exist at all, keep dock hidden
  if (jobs.length === 0) {
    return null;
  }

  const isPrinterReady = printerStatus === 'connected';
  const isPrinterReconnecting =
    printerStatus === 'reconnecting' || printerStatus === 'restoring';

  const isTearCountingDown = Boolean(
    activeTearJob && tearCountdownRemaining > 0 && waitingCount > 0
  );

  const needsAttentionJobs = jobs.filter(
    (j) =>
      j.status === 'needs-review' ||
      j.status === 'interrupted' ||
      j.status === 'failed'
  );
  const waitingJobs = jobs.filter(
    (j) =>
      j.status === 'queued' ||
      j.status === 'waiting-for-printer' ||
      j.status === 'reconnecting'
  );
  const completedJobs = jobs.filter(
    (j) => j.status === 'sent' || j.status === 'cancelled'
  );

  return (
    <aside
      aria-label="Background Receipt Queue"
      className="fixed bottom-4 right-4 z-40 hidden md:block w-96 max-w-[calc(100vw-2rem)] select-none transition-all duration-300"
    >
      {/* ── Collapsed Dock Bar ── */}
      {!isExpanded ? (
        <button
          type="button"
          onClick={toggleQueue}
          className={`w-full p-3 rounded-2xl border shadow-xl bg-card text-foreground flex items-center justify-between gap-3 hover:shadow-2xl transition-all cursor-pointer ${
            needsAttentionCount > 0
              ? 'border-amber-500/50 ring-2 ring-amber-500/20'
              : isTearCountingDown
              ? 'border-cinnamon/60 ring-2 ring-cinnamon/20 bg-cinnamon/5'
              : activeJob
              ? 'border-cinnamon/50 ring-2 ring-cinnamon/15'
              : 'border-border/80'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`p-2 rounded-xl border shrink-0 ${
                needsAttentionCount > 0
                  ? 'bg-amber-500/15 text-amber-600 border-amber-500/30'
                  : isTearCountingDown
                  ? 'bg-cinnamon/20 text-cinnamon border-cinnamon/40'
                  : activeJob
                  ? 'bg-cinnamon/15 text-cinnamon border-cinnamon/30 animate-pulse'
                  : 'bg-secondary text-muted-foreground border-border/80'
              }`}
            >
              <HugeiconsIcon icon={PrinterIcon} size={17} />
            </div>

            <div className="text-left leading-tight min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs font-heading truncate">
                  {isTearCountingDown
                    ? `Receipt ready · Next in ${tearCountdownRemaining}s`
                    : activeJob
                    ? `Printing ${activeJob.data.orderNumber}`
                    : isPausedForTear
                    ? 'Receipt Ready to Tear'
                    : needsAttentionCount > 0
                    ? `${needsAttentionCount} Needs Attention`
                    : waitingCount > 0
                    ? `${waitingCount} Receipt${waitingCount > 1 ? 's' : ''} Waiting`
                    : 'All Receipts Sent'}
                </span>
              </div>

              <p className="text-[11px] text-muted-foreground truncate">
                {isTearCountingDown
                  ? `Tear receipt · ${waitingCount} waiting`
                  : activeJob
                  ? `${waitingCount} waiting · ${printerDisplayName}`
                  : isPausedForTear
                  ? 'Click to print next receipt'
                  : isPrinterReconnecting
                  ? 'Reconnecting printer...'
                  : isPrinterReady
                  ? 'Printer Ready'
                  : 'Printer Offline'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {totalActiveCount > 0 && (
              <Badge className="bg-cinnamon text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-2xs">
                {totalActiveCount}
              </Badge>
            )}
            <div className="p-1 rounded-lg hover:bg-secondary text-muted-foreground">
              <HugeiconsIcon icon={ArrowUp01Icon} size={15} />
            </div>
          </div>
        </button>
      ) : (
        /* ── Expanded Dock Window ── */
        <div className="w-full rounded-2xl border border-border/80 bg-card text-foreground shadow-2xl overflow-hidden flex flex-col h-[480px] max-h-[calc(100vh-5rem)]">
          {/* Header */}
          <div className="p-3.5 border-b border-border/70 flex items-center justify-between gap-2 bg-secondary/30 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 rounded-lg bg-cinnamon/10 text-cinnamon shrink-0">
                <HugeiconsIcon icon={PrinterIcon} size={15} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-xs font-heading">Receipt Queue</h3>
                  <Badge
                    variant="outline"
                    className="text-[9px] px-1.5 py-0 h-4 rounded font-mono font-semibold"
                  >
                    {jobs.length} total
                  </Badge>
                </div>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isPrinterReady
                        ? 'bg-emerald-500'
                        : isPrinterReconnecting
                        ? 'bg-amber-500 animate-ping'
                        : 'bg-rose-500'
                    }`}
                  />
                  {printerDisplayName} ·{' '}
                  {isPrinterReady
                    ? 'Ready'
                    : isPrinterReconnecting
                    ? 'Reconnecting'
                    : 'Offline'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleQueue}
                className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Collapse Queue"
                aria-label="Collapse Queue"
              >
                <HugeiconsIcon icon={ArrowDown01Icon} size={16} />
              </button>
            </div>
          </div>

          {/* ── Active Tear Interval Countdown Banner (Continuous Mode) ── */}
          {isTearCountingDown && (
            <div className="p-3 bg-cinnamon/10 border-b border-cinnamon/30 flex items-center justify-between gap-2 shrink-0 animate-in fade-in-50 duration-150">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-cinnamon block">
                    Ready to tear
                  </span>
                  {activeTearJob && (
                    <span className="text-[11px] font-mono text-muted-foreground truncate">
                      (#{activeTearJob.data.orderNumber})
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground font-medium">
                  Next receipt in{' '}
                  <span className="font-bold text-foreground">
                    {tearCountdownRemaining}s
                  </span>
                  ...
                </p>
              </div>

              <Button
                type="button"
                size="xs"
                onClick={printNextNow}
                className="h-7 text-xs font-bold bg-cinnamon hover:bg-cinnamon/90 text-white rounded-lg gap-1 shadow-2xs shrink-0 cursor-pointer"
                title="Skip remaining countdown and print next immediately"
              >
                <HugeiconsIcon icon={FastForwardIcon} size={12} />
                <span>Print Next Now</span>
              </Button>
            </div>
          )}

          {/* ── Wait for Me Manual Confirmation Banner ── */}
          {isPausedForTear && !isTearCountingDown && (
            <div className="p-3 bg-amber-500/10 border-b border-amber-500/30 flex items-center justify-between gap-2 shrink-0 animate-in fade-in-50 duration-150">
              <div className="space-y-0.5 min-w-0">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 block">
                  Receipt ready to tear
                </span>
                <p className="text-[10px] text-muted-foreground">
                  {waitingCount > 0
                    ? `${waitingCount} receipt${waitingCount > 1 ? 's' : ''} waiting. Click to print next.`
                    : 'Tear the slip before taking new receipts.'}
                </p>
              </div>
              <Button
                type="button"
                size="xs"
                onClick={continueAfterTear}
                className="h-7 text-xs font-bold bg-cinnamon hover:bg-cinnamon/90 text-white rounded-lg gap-1 shadow-2xs shrink-0 cursor-pointer"
              >
                <HugeiconsIcon icon={PlayIcon} size={12} />
                <span>Print Next Receipt</span>
              </Button>
            </div>
          )}

          {/* Job List Sections (Clean Native Overflow Container) */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3 overscroll-contain">
            {/* 1. Needs Attention Jobs */}
            {needsAttentionJobs.length > 0 && (
              <div className="space-y-1.5 mb-3">
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  <HugeiconsIcon icon={AlertCircleIcon} size={12} />
                  <span>Needs Attention ({needsAttentionJobs.length})</span>
                </div>
                {needsAttentionJobs.map((job) => (
                  <PrintQueueItem
                    key={job.id}
                    job={job}
                    onRetry={retryJob}
                    onMarkDone={markJobDone}
                    onCancel={cancelJob}
                  />
                ))}
              </div>
            )}

            {/* 2. Currently Printing */}
            {activeJob && (
              <div className="space-y-1.5 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cinnamon block">
                  Currently Printing
                </span>
                <PrintQueueItem
                  job={activeJob}
                  onRetry={retryJob}
                  onMarkDone={markJobDone}
                  onCancel={cancelJob}
                />
              </div>
            )}

            {/* 3. Ready to Tear Slip (in countdown) */}
            {activeTearJob && activeTearJob.id !== activeJob?.id && (
              <div className="space-y-1.5 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cinnamon block">
                  Ready to Tear
                </span>
                <PrintQueueItem
                  job={activeTearJob}
                  onRetry={retryJob}
                  onMarkDone={markJobDone}
                  onCancel={cancelJob}
                />
              </div>
            )}

            {/* 4. Waiting in Queue */}
            {waitingJobs.length > 0 && (
              <div className="space-y-1.5 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Waiting in Queue ({waitingJobs.length})
                </span>
                {waitingJobs.map((job) => (
                  <PrintQueueItem
                    key={job.id}
                    job={job}
                    onRetry={retryJob}
                    onMarkDone={markJobDone}
                    onCancel={cancelJob}
                  />
                ))}
              </div>
            )}

            {/* 5. Recently Completed */}
            {completedJobs.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Recently Sent ({completedJobs.length})
                </span>
                {completedJobs
                  .filter((j) => j.id !== activeTearJob?.id)
                  .slice(0, 8)
                  .map((job) => (
                    <PrintQueueItem
                      key={job.id}
                      job={job}
                      onRetry={retryJob}
                      onMarkDone={markJobDone}
                      onCancel={cancelJob}
                    />
                  ))}
              </div>
            )}
          </div>

          {/* Footer Actions (Pinned at bottom) */}
          <div className="p-2.5 border-t border-border/70 bg-secondary/30 flex items-center justify-between gap-2 text-xs shrink-0 mt-auto">
            {completedCount > 0 ? (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={clearCompleted}
                className="h-7 text-[11px] text-muted-foreground hover:text-foreground gap-1 px-2 rounded-lg cursor-pointer"
              >
                <HugeiconsIcon icon={Delete02Icon} size={12} />
                <span>Clear Completed ({completedCount})</span>
              </Button>
            ) : (
              <span className="text-[11px] text-muted-foreground px-1 font-medium">
                Rush Mode Queue
              </span>
            )}

            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => {
                toggleQueue();
                navigate(ROUTES.ADMIN.PRINTER);
              }}
              className="h-7 text-[11px] font-semibold border-border/80 bg-card hover:bg-secondary gap-1 px-2.5 rounded-lg shadow-2xs cursor-pointer"
            >
              <HugeiconsIcon icon={Settings01Icon} size={12} />
              <span>Printer Settings</span>
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
}
