import { create } from 'zustand';
import type { PrintJob, PrintJobStatus } from '../types/printQueue.types';

interface PrintQueueStoreState {
  jobs: PrintJob[];
  isExpanded: boolean;
  isSheetOpen: boolean;
  isPausedForTear: boolean;
  isLeaderTab: boolean;
  hasUnseenAttention: boolean;
  nextPrintAllowedAt: number | null;
  tearCountdownRemaining: number; // In whole seconds e.g. 3, 2, 1
  activeTearJobId: string | null;

  // Actions
  setJobs: (jobs: PrintJob[]) => void;
  upsertJob: (job: PrintJob) => void;
  updateJobStatus: (id: string, status: PrintJobStatus, extra?: Partial<PrintJob>) => void;
  removeJob: (id: string) => void;
  clearCompleted: () => void;
  setIsExpanded: (expanded: boolean) => void;
  setIsSheetOpen: (open: boolean) => void;
  setIsPausedForTear: (paused: boolean) => void;
  setIsLeaderTab: (leader: boolean) => void;
  setHasUnseenAttention: (has: boolean) => void;
  setTearCountdown: (
    remaining: number,
    allowedAt: number | null,
    activeJobId: string | null
  ) => void;
  toggleExpanded: () => void;
  toggleSheet: () => void;
}

export const usePrintQueueStore = create<PrintQueueStoreState>((set) => ({
  jobs: [],
  isExpanded: false,
  isSheetOpen: false,
  isPausedForTear: false,
  isLeaderTab: true,
  hasUnseenAttention: false,
  nextPrintAllowedAt: null,
  tearCountdownRemaining: 0,
  activeTearJobId: null,

  setJobs: (jobs) => {
    // Sort jobs: Priority (1 first), then FIFO (createdAt)
    const sorted = [...jobs].sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    const hasAttention = sorted.some(
      (j) => j.status === 'needs-review' || j.status === 'interrupted' || j.status === 'failed'
    );

    set({ jobs: sorted, hasUnseenAttention: hasAttention });
  },

  upsertJob: (job) => {
    set((state) => {
      const idx = state.jobs.findIndex((j) => j.id === job.id);
      let updated: PrintJob[];
      if (idx >= 0) {
        updated = [...state.jobs];
        updated[idx] = { ...updated[idx], ...job };
      } else {
        updated = [...state.jobs, job];
      }

      // Sort
      updated.sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });

      const isProblematic =
        job.status === 'needs-review' || job.status === 'interrupted' || job.status === 'failed';

      return {
        jobs: updated,
        hasUnseenAttention: state.hasUnseenAttention || isProblematic,
        isExpanded: isProblematic ? true : state.isExpanded,
      };
    });
  },

  updateJobStatus: (id, status, extra) => {
    set((state) => {
      const updated = state.jobs.map((j) => {
        if (j.id === id) {
          return {
            ...j,
            status,
            updatedAt: new Date().toISOString(),
            ...extra,
          };
        }
        return j;
      });

      const isProblematic =
        status === 'needs-review' || status === 'interrupted' || status === 'failed';

      return {
        jobs: updated,
        hasUnseenAttention: state.hasUnseenAttention || isProblematic,
        isExpanded: isProblematic ? true : state.isExpanded,
      };
    });
  },

  removeJob: (id) => {
    set((state) => ({
      jobs: state.jobs.filter((j) => j.id !== id),
    }));
  },

  clearCompleted: () => {
    set((state) => ({
      jobs: state.jobs.filter((j) => j.status !== 'sent' && j.status !== 'cancelled'),
    }));
  },

  setIsExpanded: (isExpanded) => set({ isExpanded, hasUnseenAttention: false }),
  setIsSheetOpen: (isSheetOpen) => set({ isSheetOpen, hasUnseenAttention: false }),
  setIsPausedForTear: (isPausedForTear) => set({ isPausedForTear }),
  setIsLeaderTab: (isLeaderTab) => set({ isLeaderTab }),
  setHasUnseenAttention: (hasUnseenAttention) => set({ hasUnseenAttention }),
  setTearCountdown: (tearCountdownRemaining, nextPrintAllowedAt, activeTearJobId) =>
    set({ tearCountdownRemaining, nextPrintAllowedAt, activeTearJobId }),
  toggleExpanded: () => set((s) => ({ isExpanded: !s.isExpanded, hasUnseenAttention: false })),
  toggleSheet: () => set((s) => ({ isSheetOpen: !s.isSheetOpen, hasUnseenAttention: false })),
}));
