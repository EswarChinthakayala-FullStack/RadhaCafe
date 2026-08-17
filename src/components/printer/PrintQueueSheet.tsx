import { useNavigate } from 'react-router-dom';
import { useReceiptPrintQueue } from '../../providers/ReceiptPrintQueueProvider';
import { usePrinterStore } from '../../store/printerStore';
import { PrintQueueItem } from './PrintQueueItem';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '../ui/drawer';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ROUTES } from '../../constants/routes';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  PrinterIcon,
  AlertCircleIcon,
  PlayIcon,
  Settings01Icon,
  Delete02Icon,
  ArrowUp01Icon,
  FastForwardIcon,
} from '@hugeicons/core-free-icons';

export function PrintQueueSheet() {
  const navigate = useNavigate();
  const {
    jobs,
    activeJob,
    activeTearJob,
    waitingCount,
    needsAttentionCount,
    completedCount,
    totalActiveCount,
    isSheetOpen,
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
    'Printer';

  if (jobs.length === 0) {
    return null;
  }

  const isPrinterReady = printerStatus === 'connected' || printerStatus === 'ready';
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
    <>
      {/* ── Mobile Floating Pill (Only on <768px screens) ── */}
      <div className="md:hidden fixed bottom-18 left-3 right-3 z-40 max-w-sm mx-auto select-none">
        <button
          type="button"
          onClick={toggleQueue}
          className={`w-full p-2.5 rounded-2xl border shadow-xl bg-card text-foreground flex items-center justify-between gap-2.5 transition-all active:scale-[0.98] cursor-pointer ${
            needsAttentionCount > 0
              ? 'border-amber-500/50 ring-2 ring-amber-500/20'
              : isTearCountingDown
              ? 'border-cinnamon/60 ring-2 ring-cinnamon/20 bg-cinnamon/5'
              : activeJob
              ? 'border-cinnamon/50 ring-2 ring-cinnamon/15'
              : 'border-border/80'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`p-1.5 rounded-xl border shrink-0 ${
                needsAttentionCount > 0
                  ? 'bg-amber-500/15 text-amber-600 border-amber-500/30'
                  : isTearCountingDown
                  ? 'bg-cinnamon/20 text-cinnamon border-cinnamon/40'
                  : activeJob
                  ? 'bg-cinnamon/15 text-cinnamon border-cinnamon/30 animate-pulse'
                  : 'bg-secondary text-muted-foreground border-border/80'
              }`}
            >
              <HugeiconsIcon icon={PrinterIcon} size={15} />
            </div>

            <div className="text-left leading-tight min-w-0">
              <span className="font-bold text-xs font-heading truncate block">
                {isTearCountingDown
                  ? `Receipt ready · Next in ${tearCountdownRemaining}s`
                  : activeJob
                  ? `Printing #${activeJob.data.orderNumber}`
                  : isPausedForTear
                  ? 'Receipt Ready to Tear'
                  : needsAttentionCount > 0
                  ? `${needsAttentionCount} Needs Attention`
                  : `${waitingCount} Receipts Waiting`}
              </span>
              <span className="text-[10px] text-muted-foreground truncate block">
                {printerDisplayName} ·{' '}
                {isPrinterReady
                  ? 'Ready'
                  : isPrinterReconnecting
                  ? 'Reconnecting'
                  : 'Offline'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {totalActiveCount > 0 && (
              <Badge className="bg-cinnamon text-white font-bold text-[9px] px-1.5 py-0.5 rounded-full shadow-2xs">
                {totalActiveCount}
              </Badge>
            )}
            <HugeiconsIcon
              icon={ArrowUp01Icon}
              size={14}
              className="text-muted-foreground"
            />
          </div>
        </button>
      </div>

      {/* ── Native Mobile Drawer Sheet ── */}
      <Drawer open={isSheetOpen} onOpenChange={toggleQueue} showSwipeHandle>
        <DrawerContent className="p-3.5 sm:p-4 bg-card max-h-[85vh] overflow-hidden rounded-t-2xl flex flex-col">
          <DrawerHeader className="pb-2 border-b border-border/60 flex items-center justify-between shrink-0">
            <DrawerTitle className="text-sm sm:text-base font-bold font-heading text-foreground flex items-center gap-2">
              <HugeiconsIcon icon={PrinterIcon} size={17} className="text-cinnamon" />
              <span>Receipt Print Queue</span>
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 h-4.5 rounded font-mono font-semibold"
              >
                {jobs.length}
              </Badge>
            </DrawerTitle>
          </DrawerHeader>

          {/* ── Active Tear Interval Countdown Banner (Continuous Mode) ── */}
          {isTearCountingDown && (
            <div className="my-2 p-2.5 bg-cinnamon/10 border border-cinnamon/30 rounded-xl flex items-center justify-between gap-2 animate-in fade-in-50 duration-150">
              <div className="space-y-0.5 min-w-0">
                <span className="text-xs font-bold text-cinnamon block">
                  Receipt ready to tear
                </span>
                <p className="text-[11px] text-muted-foreground font-medium">
                  Next receipt starting in{' '}
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
              >
                <HugeiconsIcon icon={FastForwardIcon} size={12} />
                <span>Print Next</span>
              </Button>
            </div>
          )}

          {/* ── Wait for Me Manual Confirmation Banner ── */}
          {isPausedForTear && !isTearCountingDown && (
            <div className="my-2 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between gap-2 animate-in fade-in-50 duration-150">
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
                <span>Print Next</span>
              </Button>
            </div>
          )}

          {/* Job List */}
          <div className="pt-2 pb-4 overflow-y-auto max-h-[calc(85vh-140px)] space-y-3 no-scrollbar flex-1">
            {/* Needs Attention */}
            {needsAttentionJobs.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <HugeiconsIcon icon={AlertCircleIcon} size={12} />
                  <span>Needs Attention ({needsAttentionJobs.length})</span>
                </span>
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

            {/* Currently Printing */}
            {activeJob && (
              <div className="space-y-1.5">
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

            {/* Ready to Tear Slip */}
            {activeTearJob && activeTearJob.id !== activeJob?.id && (
              <div className="space-y-1.5">
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

            {/* Waiting */}
            {waitingJobs.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Waiting ({waitingJobs.length})
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

            {/* Completed */}
            {completedJobs.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Recently Sent ({completedJobs.length})
                </span>
                {completedJobs
                  .filter((j) => j.id !== activeTearJob?.id)
                  .slice(0, 5)
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

          {/* Footer */}
          <div className="pt-2 border-t border-border/70 flex items-center justify-between gap-2">
            {completedCount > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={clearCompleted}
                className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1 px-2 rounded-xl cursor-pointer"
              >
                <HugeiconsIcon icon={Delete02Icon} size={13} />
                <span>Clear Completed</span>
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => {
                toggleQueue();
                navigate(ROUTES.ADMIN.PRINTER);
              }}
              className="h-8 text-xs font-semibold border-border/80 bg-card hover:bg-secondary gap-1 px-3 rounded-xl ml-auto shadow-2xs cursor-pointer"
            >
              <HugeiconsIcon icon={Settings01Icon} size={13} />
              <span>Printer Settings</span>
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
