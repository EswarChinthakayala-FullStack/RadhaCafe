import { getOfflineDB, STORES } from '../offline/db';
import type { PrintJob } from '../../types/printQueue.types';

/**
 * Saves or updates a print job in IndexedDB
 */
export async function idbSavePrintJob(job: PrintJob): Promise<void> {
  const db = await getOfflineDB();
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(STORES.PRINT_QUEUE, 'readwrite');
      const store = tx.objectStore(STORES.PRINT_QUEUE);
      store.put(job);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error('Failed to save print job to IndexedDB'));
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Retrieves a single print job by ID
 */
export async function idbGetPrintJob(id: string): Promise<PrintJob | null> {
  const db = await getOfflineDB();
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(STORES.PRINT_QUEUE, 'readonly');
      const store = tx.objectStore(STORES.PRINT_QUEUE);
      const req = store.get(id);
      tx.oncomplete = () => resolve(req.result || null);
      tx.onerror = () => reject(tx.error || new Error('Failed to get print job from IndexedDB'));
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Retrieves all stored print jobs sorted by creation date
 */
export async function idbGetAllPrintJobs(): Promise<PrintJob[]> {
  const db = await getOfflineDB();
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(STORES.PRINT_QUEUE, 'readonly');
      const store = tx.objectStore(STORES.PRINT_QUEUE);
      const req = store.getAll();
      tx.oncomplete = () => {
        const jobs = (req.result || []) as PrintJob[];
        // Sort FIFO
        jobs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        resolve(jobs);
      };
      tx.onerror = () => reject(tx.error || new Error('Failed to get print jobs from IndexedDB'));
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Deletes a print job by ID
 */
export async function idbDeletePrintJob(id: string): Promise<void> {
  const db = await getOfflineDB();
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(STORES.PRINT_QUEUE, 'readwrite');
      const store = tx.objectStore(STORES.PRINT_QUEUE);
      store.delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error('Failed to delete print job from IndexedDB'));
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Clears all 'sent' and 'cancelled' completed print jobs from IndexedDB
 */
export async function idbClearCompletedPrintJobs(): Promise<void> {
  const allJobs = await idbGetAllPrintJobs();
  const completed = allJobs.filter((j) => j.status === 'sent' || j.status === 'cancelled');
  if (completed.length === 0) return;

  const db = await getOfflineDB();
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(STORES.PRINT_QUEUE, 'readwrite');
      const store = tx.objectStore(STORES.PRINT_QUEUE);
      for (const job of completed) {
        store.delete(job.id);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error('Failed to clear completed print jobs'));
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Prunes completed print jobs older than maxAgeMs (default 2 minutes) to prevent database bloat
 */
export async function idbPruneOldCompletedJobs(maxAgeMs = 120_000): Promise<void> {
  try {
    const allJobs = await idbGetAllPrintJobs();
    const now = Date.now();
    const toPrune = allJobs.filter((job) => {
      if (job.status !== 'sent' && job.status !== 'cancelled') return false;
      const completedTime = job.completedAt ? new Date(job.completedAt).getTime() : new Date(job.updatedAt).getTime();
      return now - completedTime > maxAgeMs;
    });

    if (toPrune.length === 0) return;

    const db = await getOfflineDB();
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORES.PRINT_QUEUE, 'readwrite');
        const store = tx.objectStore(STORES.PRINT_QUEUE);
        for (const job of toPrune) {
          store.delete(job.id);
        }
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  } catch {
    // Non-blocking
  }
}

/**
 * Recovers jobs that were actively 'printing' or 'preparing' during an unexpected browser reload/crash,
 * transitioning them safely to 'needs-review' so they are not blindly double-printed.
 */
export async function idbRecoverStalePrintingJobs(): Promise<void> {
  try {
    const allJobs = await idbGetAllPrintJobs();
    const staleJobs = allJobs.filter((j) => j.status === 'printing' || j.status === 'preparing');
    if (staleJobs.length === 0) return;

    for (const job of staleJobs) {
      job.status = 'needs-review';
      job.errorMessage = 'Application reloaded while receipt was being sent. Verify physical slip before reprinting.';
      job.updatedAt = new Date().toISOString();
      await idbSavePrintJob(job);
    }
  } catch {
    // Non-blocking recovery
  }
}
