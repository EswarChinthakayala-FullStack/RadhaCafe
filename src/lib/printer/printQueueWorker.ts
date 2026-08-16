import { usePrintQueueStore } from '../../store/printQueueStore';
import {
  idbSavePrintJob,
  idbGetAllPrintJobs,
  idbGetPrintJob,
  idbClearCompletedPrintJobs,
  idbPruneOldCompletedJobs,
  idbRecoverStalePrintingJobs,
} from './printQueuePersistence';
import { getPrintQueueSettings } from './printQueueSettings';
import { printerSessionManager } from './printerSessionManager';
import { getWriteCharacteristic, logEvent } from './bluetoothPrinter';
import {
  encodeTemplateReceiptToEscPos,
  encodeTestReceiptToEscPos,
} from './escpos';
import { getPrinterProfile } from './printerProfiles';
import { usePrinterStore } from '../../store/printerStore';
import { BLE_CHUNK_SIZE } from '../../constants/printerCommands';
import { supabase } from '../supabase/client';
import { idbUpdateOfflineOrderStatus } from '../offline/db';
import type {
  PrintJob,
  PrintJobDataSnapshot,
  PrintJobType,
} from '../../types/printQueue.types';

// Tab synchronization channel
let broadcastChannel: BroadcastChannel | null = null;
const CHANNEL_NAME = 'radhacafe_print_queue_channel';

class PrintQueueWorker {
  private isRunning = false;
  private isProcessing = false;
  private workerInterval: ReturnType<typeof setInterval> | null = null;
  private tabId = Math.random().toString(36).substring(2, 9);
  private isLeader = true;
  private lockAbortController: AbortController | null = null;

  // Exact timestamp tracking for tear delay and hardware settling
  private lastReceiptFinishedAt = 0;
  private nextPrintAllowedAt = 0;
  private tearCountdownInterval: ReturnType<typeof setInterval> | null = null;
  private tearDelayTimeout: ReturnType<typeof setTimeout> | null = null;

  public initialize(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    // 1. Setup multi-tab broadcast channel
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
        broadcastChannel.onmessage = (event) => {
          this.handleBroadcastMessage(event.data);
        };
      }
    } catch {
      // Ignored if unavailable
    }

    // 2. Tab Leader Lock
    this.acquireTabLeaderLock();

    // 3. Hydrate & Recover Stale Jobs on startup
    this.hydrateQueue();

    // 4. Background queue processing heartbeat
    this.workerInterval = setInterval(() => {
      if (this.isLeader && !this.isProcessing) {
        this.processNextJob();
      }
    }, 1000);
  }

  public shutdown(): void {
    this.isRunning = false;
    if (this.workerInterval) {
      clearInterval(this.workerInterval);
      this.workerInterval = null;
    }
    this.clearTearTimers();
    if (this.lockAbortController) {
      this.lockAbortController.abort();
      this.lockAbortController = null;
    }
    if (broadcastChannel) {
      broadcastChannel.close();
      broadcastChannel = null;
    }
  }

  public getLastReceiptFinishedAt(): number {
    return this.lastReceiptFinishedAt;
  }

  public getNextPrintAllowedAt(): number {
    return this.nextPrintAllowedAt;
  }

  private clearTearTimers(): void {
    if (this.tearCountdownInterval) {
      clearInterval(this.tearCountdownInterval);
      this.tearCountdownInterval = null;
    }
    if (this.tearDelayTimeout) {
      clearTimeout(this.tearDelayTimeout);
      this.tearDelayTimeout = null;
    }
    usePrintQueueStore.getState().setTearCountdown(0, null, null);
  }

  /**
   * Leader Tab Election via Web Locks API
   */
  private acquireTabLeaderLock(): void {
    if (typeof navigator !== 'undefined' && 'locks' in navigator) {
      this.lockAbortController = new AbortController();
      navigator.locks
        .request(
          'radhacafe_print_worker_lock',
          { signal: this.lockAbortController.signal },
          async () => {
            this.isLeader = true;
            usePrintQueueStore.getState().setIsLeaderTab(true);
            logEvent(`Tab ${this.tabId} elected as Print Queue Leader.`);

            // Run queue loop while lock is held
            return new Promise<void>((resolve) => {
              this.lockAbortController?.signal.addEventListener('abort', () => resolve());
            });
          }
        )
        .catch(() => {
          this.isLeader = false;
          usePrintQueueStore.getState().setIsLeaderTab(false);
        });
    } else {
      this.isLeader = true;
      usePrintQueueStore.getState().setIsLeaderTab(true);
    }
  }

  /**
   * Broadcast handler for multi-tab UI synchronization
   */
  private handleBroadcastMessage(msg: any): void {
    if (!msg || !msg.type) return;
    if (msg.type === 'QUEUE_SYNC') {
      this.hydrateQueue(false);
    } else if (msg.type === 'JOB_UPDATED' && msg.job) {
      usePrintQueueStore.getState().upsertJob(msg.job);
    } else if (msg.type === 'TEAR_COUNTDOWN') {
      usePrintQueueStore
        .getState()
        .setTearCountdown(msg.remaining, msg.allowedAt, msg.activeJobId);
    }
  }

  private notifyBroadcast(type: string, payload?: any): void {
    try {
      broadcastChannel?.postMessage({ type, ...payload });
    } catch {
      // Ignored
    }
  }

  /**
   * Hydrates state from IndexedDB into Zustand store
   */
  public async hydrateQueue(recoverStale = true): Promise<void> {
    try {
      if (recoverStale) {
        await idbRecoverStalePrintingJobs();
        await idbPruneOldCompletedJobs();
      }

      const allJobs = await idbGetAllPrintJobs();
      usePrintQueueStore.getState().setJobs(allJobs);

      // Trigger processing if leader
      if (this.isLeader) {
        this.processNextJob();
      }
    } catch (err: any) {
      console.warn('[PrintQueue] Error hydrating queue:', err?.message);
    }
  }

  /**
   * Enqueues a new print job with idempotency
   */
  public async enqueue(
    data: PrintJobDataSnapshot,
    type: PrintJobType = 'order-receipt',
    options?: { priority?: number; id?: string }
  ): Promise<PrintJob> {
    const queueSettings = getPrintQueueSettings();

    // Determine stable idempotency key
    const jobId =
      options?.id ||
      (type === 'order-receipt' && data.clientOrderId
        ? `initial-receipt:${data.clientOrderId}`
        : `${type}:${Date.now()}_${Math.random().toString(36).substring(2, 6)}`);

    // Priority: 1 = customer order, 2 = reprint, 3 = test
    const priority =
      options?.priority !== undefined
        ? options.priority
        : type === 'order-receipt' || type === 'offline-order-receipt'
        ? 1
        : type === 'reprint'
        ? 2
        : 3;

    const newJob: PrintJob = {
      id: jobId,
      type,
      status: 'queued',
      priority,
      data,
      finishingMode: queueSettings.finishingMode,
      tearGap: queueSettings.tearGap,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      bytesWritten: 0,
      totalBytes: 0,
      attemptCount: 0,
    };

    // 1. Check if already exists to prevent duplicate enqueue
    const existing = await idbGetPrintJob(jobId);
    if (existing && existing.status !== 'failed' && existing.status !== 'cancelled') {
      logEvent(`Print job ${jobId} already enqueued. Skipping duplicate.`);
      return existing;
    }

    // 2. Persist in IndexedDB FIRST before state update
    await idbSavePrintJob(newJob);

    // 3. Update Zustand store
    usePrintQueueStore.getState().upsertJob(newJob);
    this.notifyBroadcast('JOB_UPDATED', { job: newJob });

    logEvent(`Enqueued receipt job #${data.orderNumber} (ID: ${jobId}, Priority: ${priority})`);

    // 4. Trigger queue worker
    if (this.isLeader) {
      this.processNextJob();
    }

    return newJob;
  }

  /**
   * Retries an interrupted, failed, or needs-review job
   */
  public async retryJob(id: string): Promise<void> {
    const job = await idbGetPrintJob(id);
    if (!job) return;

    job.status = 'queued';
    job.bytesWritten = 0;
    job.errorMessage = undefined;
    job.updatedAt = new Date().toISOString();

    await idbSavePrintJob(job);
    usePrintQueueStore.getState().upsertJob(job);
    this.notifyBroadcast('JOB_UPDATED', { job });

    if (this.isLeader) {
      this.processNextJob();
    }
  }

  /**
   * Marks an interrupted/needs-review job as physically completed
   */
  public async markJobDone(id: string): Promise<void> {
    const job = await idbGetPrintJob(id);
    if (!job) return;

    job.status = 'sent';
    job.completedAt = new Date().toISOString();
    job.updatedAt = new Date().toISOString();

    await idbSavePrintJob(job);
    usePrintQueueStore.getState().upsertJob(job);
    this.notifyBroadcast('JOB_UPDATED', { job });

    // Mark is_printed in background
    this.reconcileOrderPrintedFlag(job);

    if (this.isLeader) {
      this.processNextJob();
    }
  }

  /**
   * Cancels a queued job before it starts printing
   */
  public async cancelJob(id: string): Promise<void> {
    const job = await idbGetPrintJob(id);
    if (!job) return;

    // Only allow cancelling unstarted jobs
    if (job.status === 'printing') {
      logEvent(`Cannot cancel job ${id} while actively transmitting bytes.`);
      return;
    }

    job.status = 'cancelled';
    job.updatedAt = new Date().toISOString();

    await idbSavePrintJob(job);
    usePrintQueueStore.getState().upsertJob(job);
    this.notifyBroadcast('JOB_UPDATED', { job });
  }

  /**
   * "Print Next Now" / "Continue After Tear" action:
   * Skips remaining tear delay timer immediately and begins next queued receipt
   */
  public continueAfterTear(): void {
    this.clearTearTimers();
    this.nextPrintAllowedAt = 0;
    usePrintQueueStore.getState().setIsPausedForTear(false);

    // If a job was marked 'tear-wait', finalize it to 'sent'
    this.finalizeTearWaitJobs();

    if (this.isLeader) {
      this.processNextJob();
    }
  }

  public printNextNow(): void {
    this.continueAfterTear();
  }

  private async finalizeTearWaitJobs(): Promise<void> {
    const allJobs = await idbGetAllPrintJobs();
    for (const job of allJobs) {
      if (job.status === 'tear-wait') {
        job.status = 'sent';
        job.completedAt = job.completedAt || new Date().toISOString();
        job.updatedAt = new Date().toISOString();
        await idbSavePrintJob(job);
        usePrintQueueStore.getState().upsertJob(job);
        this.notifyBroadcast('JOB_UPDATED', { job });
      }
    }
  }

  /**
   * Clears finished completed/cancelled receipts from the view
   */
  public async clearCompleted(): Promise<void> {
    await idbClearCompletedPrintJobs();
    usePrintQueueStore.getState().clearCompleted();
    this.notifyBroadcast('QUEUE_SYNC');
  }

  /**
   * Main Queue Worker Processor Loop
   */
  public async processNextJob(): Promise<void> {
    if (this.isProcessing || !this.isLeader) return;

    // Check if waiting for manual user confirmation in 'manual-confirm' (Wait for Me) mode
    if (usePrintQueueStore.getState().isPausedForTear) {
      return;
    }

    // 1. Fetch current jobs
    const allJobs = await idbGetAllPrintJobs();
    if (allJobs.length === 0) return;

    // Filter candidate jobs: priority 1 customer orders first, then reprints, then tests
    const pendingJobs = allJobs.filter(
      (j) =>
        j.status === 'queued' ||
        j.status === 'waiting-for-printer' ||
        j.status === 'reconnecting'
    );

    if (pendingJobs.length === 0) {
      // No more pending jobs. If any job is still 'tear-wait', cleanly finalize to 'sent'
      this.finalizeTearWaitJobs();
      return;
    }

    // 2. Check tear interval: Has the configured tear time elapsed since the last receipt completed?
    const now = Date.now();
    if (this.nextPrintAllowedAt > now) {
      const remainingMs = this.nextPrintAllowedAt - now;
      const remainingSec = Math.ceil(remainingMs / 1000);

      // Active tear countdown in progress: update store and schedule next check
      const currentActiveTearJob = allJobs.find((j) => j.status === 'tear-wait');
      usePrintQueueStore
        .getState()
        .setTearCountdown(
          remainingSec,
          this.nextPrintAllowedAt,
          currentActiveTearJob?.id || null
        );
      this.notifyBroadcast('TEAR_COUNTDOWN', {
        remaining: remainingSec,
        allowedAt: this.nextPrintAllowedAt,
        activeJobId: currentActiveTearJob?.id || null,
      });

      if (!this.tearDelayTimeout) {
        this.tearDelayTimeout = setTimeout(() => {
          this.tearDelayTimeout = null;
          this.clearTearTimers();
          this.finalizeTearWaitJobs();
          this.processNextJob();
        }, remainingMs);
      }
      return;
    }

    // Tear delay has elapsed! Clear countdown and finalize previous 'tear-wait' job
    this.clearTearTimers();
    await this.finalizeTearWaitJobs();

    // Sort pending jobs by priority ASC, then FIFO (createdAt ASC)
    pendingJobs.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    const nextJob = pendingJobs[0];
    this.isProcessing = true;

    try {
      // 3. Ensure Printer is Ready or attempt short auto-reconnect
      const { ready, reason } = await printerSessionManager.ensurePrinterReady();
      if (!ready) {
        logEvent(
          `Printer not ready for job #${nextJob.data.orderNumber}: ${reason || 'Disconnected'}`
        );
        if (
          nextJob.status !== 'waiting-for-printer' &&
          nextJob.status !== 'reconnecting'
        ) {
          nextJob.status = 'waiting-for-printer';
          nextJob.errorMessage = reason || 'Printer is offline. Waiting for connection...';
          nextJob.updatedAt = new Date().toISOString();
          await idbSavePrintJob(nextJob);
          usePrintQueueStore.getState().upsertJob(nextJob);
          this.notifyBroadcast('JOB_UPDATED', { job: nextJob });
        }
        this.isProcessing = false;
        return;
      }

      // 4. Transition to 'printing'
      nextJob.status = 'printing';
      nextJob.startedAt = new Date().toISOString();
      nextJob.updatedAt = new Date().toISOString();
      nextJob.errorMessage = undefined;
      nextJob.attemptCount++;
      await idbSavePrintJob(nextJob);
      usePrintQueueStore.getState().upsertJob(nextJob);
      this.notifyBroadcast('JOB_UPDATED', { job: nextJob });

      // 5. Generate ESC/POS Binary Bytes from immutable snapshot
      const queueSettings = getPrintQueueSettings();
      const printerProfile = getPrinterProfile(usePrinterStore.getState().activeProfile?.key);
      const supportsCut = Boolean(
        printerProfile?.supportsCut && queueSettings.finishingMode === 'auto-cut'
      );

      let payloadBytes: Uint8Array;
      if (nextJob.type === 'printer-test') {
        payloadBytes = encodeTestReceiptToEscPos(
          nextJob.data.templateSnapshot?.paperWidth || 32,
          nextJob.data.settingsSnapshot?.cafe_name || 'RadhaCafe'
        );
      } else {
        payloadBytes = encodeTemplateReceiptToEscPos(nextJob.data, {
          templateConfig: nextJob.data.templateSnapshot,
          cafeSettings: nextJob.data.settingsSnapshot,
          finishingMode: queueSettings.finishingMode,
          tearGap: queueSettings.tearGap,
          supportsCut,
        });
      }

      nextJob.totalBytes = payloadBytes.length;
      await idbSavePrintJob(nextJob);
      usePrintQueueStore.getState().upsertJob(nextJob);

      // 6. Execute Serialized BLE Transmission with Flow Control
      const writeResult = await this.transmitBytesSequentially(nextJob, payloadBytes);

      if (writeResult.success) {
        const finishTime = Date.now();
        this.lastReceiptFinishedAt = finishTime;

        nextJob.bytesWritten = nextJob.totalBytes;
        nextJob.completedAt = new Date().toISOString();
        nextJob.updatedAt = new Date().toISOString();

        logEvent(`Successfully printed receipt #${nextJob.data.orderNumber}`);

        // Asynchronously reconcile order's is_printed flag in Supabase/IndexedDB
        this.reconcileOrderPrintedFlag(nextJob);

        // Check if additional jobs are waiting in the queue
        const remainingPendingJobs = allJobs.filter(
          (j) =>
            j.id !== nextJob.id &&
            (j.status === 'queued' ||
              j.status === 'waiting-for-printer' ||
              j.status === 'reconnecting')
        );

        if (queueSettings.tearMode === 'manual-confirm') {
          // "Wait for Me" mode: Pause queue indefinitely until user clicks continue
          nextJob.status = 'tear-wait';
          await idbSavePrintJob(nextJob);
          usePrintQueueStore.getState().upsertJob(nextJob);
          usePrintQueueStore.getState().setIsPausedForTear(true);
          this.notifyBroadcast('JOB_UPDATED', { job: nextJob });
        } else {
          // "Continuous" rush mode:
          // Calculate next allowed print timestamp
          const requiredDelayMs = supportsCut
            ? queueSettings.settleDelayMs
            : queueSettings.tearDelayMs;
          this.nextPrintAllowedAt = finishTime + requiredDelayMs;

          if (remainingPendingJobs.length > 0 && requiredDelayMs > 0 && !supportsCut) {
            // There are waiting receipts: enter 'tear-wait' and start countdown
            nextJob.status = 'tear-wait';
            await idbSavePrintJob(nextJob);
            usePrintQueueStore.getState().upsertJob(nextJob);
            this.notifyBroadcast('JOB_UPDATED', { job: nextJob });

            const initialSec = Math.ceil(requiredDelayMs / 1000);
            usePrintQueueStore
              .getState()
              .setTearCountdown(initialSec, this.nextPrintAllowedAt, nextJob.id);

            // 1-second countdown ticker for smooth UI rendering
            this.tearCountdownInterval = setInterval(() => {
              const sec = Math.max(
                0,
                Math.ceil((this.nextPrintAllowedAt - Date.now()) / 1000)
              );
              usePrintQueueStore
                .getState()
                .setTearCountdown(sec, this.nextPrintAllowedAt, nextJob.id);
              this.notifyBroadcast('TEAR_COUNTDOWN', {
                remaining: sec,
                allowedAt: this.nextPrintAllowedAt,
                activeJobId: nextJob.id,
              });

              if (sec <= 0) {
                this.clearTearTimers();
              }
            }, 1000);
          } else {
            // Empty queue or auto-cutter: complete immediately without countdown
            nextJob.status = 'sent';
            await idbSavePrintJob(nextJob);
            usePrintQueueStore.getState().upsertJob(nextJob);
            this.notifyBroadcast('JOB_UPDATED', { job: nextJob });
          }
        }
      } else {
        // Handle interruption or failure
        if (writeResult.bytesWritten === 0) {
          nextJob.status = 'waiting-for-printer';
          nextJob.errorMessage =
            writeResult.error || 'Connection dropped before transmission.';
        } else {
          // Mid-write interruption: Mark Needs Review so admin verifies physical slip
          nextJob.status = 'needs-review';
          nextJob.bytesWritten = writeResult.bytesWritten;
          nextJob.errorMessage =
            'Printing was interrupted. Check physical slip before reprinting.';
        }
        nextJob.updatedAt = new Date().toISOString();
        await idbSavePrintJob(nextJob);
        usePrintQueueStore.getState().upsertJob(nextJob);
        this.notifyBroadcast('JOB_UPDATED', { job: nextJob });
      }
    } catch (err: any) {
      logEvent(`Error in queue worker processing job: ${err?.message}`);
      nextJob.status = nextJob.bytesWritten > 0 ? 'needs-review' : 'failed';
      nextJob.errorMessage = err?.message || 'Print job failed';
      nextJob.updatedAt = new Date().toISOString();
      await idbSavePrintJob(nextJob);
      usePrintQueueStore.getState().upsertJob(nextJob);
      this.notifyBroadcast('JOB_UPDATED', { job: nextJob });
    } finally {
      this.isProcessing = false;
      // If in continuous mode and tear delay has already elapsed or is 0, continue immediately
      if (
        !usePrintQueueStore.getState().isPausedForTear &&
        Date.now() >= this.nextPrintAllowedAt
      ) {
        setTimeout(() => this.processNextJob(), 50);
      }
    }
  }

  /**
   * Low-level serialized chunked transmission with flow control
   */
  private async transmitBytesSequentially(
    job: PrintJob,
    data: Uint8Array
  ): Promise<{ success: boolean; bytesWritten: number; error?: string }> {
    const characteristic = getWriteCharacteristic();
    if (!characteristic) {
      return { success: false, bytesWritten: 0, error: 'Write characteristic unavailable.' };
    }

    const totalBytes = data.length;
    let bytesWritten = 0;
    const chunkSize = BLE_CHUNK_SIZE;
    const useWithoutResponse = Boolean(characteristic.properties.writeWithoutResponse);

    let chunkCount = 0;

    for (let i = 0; i < totalBytes; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);

      try {
        if (useWithoutResponse && typeof characteristic.writeValueWithoutResponse === 'function') {
          await characteristic.writeValueWithoutResponse(chunk);
        } else {
          await characteristic.writeValue(chunk);
        }
        bytesWritten += chunk.length;
        chunkCount++;

        // Throttle UI updates to every 8 chunks or at 100% to protect BLE throughput
        if (chunkCount % 8 === 0 || bytesWritten === totalBytes) {
          usePrintQueueStore.getState().updateJobStatus(job.id, 'printing', {
            bytesWritten,
            totalBytes,
          });
        }
      } catch (err: any) {
        logEvent(`BLE write error at byte ${bytesWritten}/${totalBytes}: ${err?.message}`);
        return { success: false, bytesWritten, error: err?.message };
      }

      // 15ms flow control interval between chunks
      await new Promise((r) => setTimeout(r, 15));
    }

    return { success: true, bytesWritten: totalBytes };
  }

  /**
   * Reconciles order's is_printed column in Supabase or IndexedDB asynchronously
   */
  private async reconcileOrderPrintedFlag(job: PrintJob): Promise<void> {
    try {
      if (job.data.isOffline && job.data.clientOrderId) {
        await idbUpdateOfflineOrderStatus(job.data.clientOrderId, {
          is_printed: true,
        });
      } else if (job.data.serverOrderId) {
        await (supabase.from('orders') as any)
          .update({ is_printed: true })
          .eq('id', job.data.serverOrderId);
      }
    } catch {
      // Non-blocking background reconciliation
    }
  }
}

export const printQueueWorker = new PrintQueueWorker();
