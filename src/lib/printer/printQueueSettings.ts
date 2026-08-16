import type { PrintQueueSettings } from '../../types/printQueue.types';

const STORAGE_KEY = 'radhacafe_print_queue_settings';

export const DEFAULT_PRINT_QUEUE_SETTINGS: PrintQueueSettings = {
  rushMode: true,
  tearMode: 'continuous',
  tearDelayMs: 3000,
  tearGap: 'extra',
  finishingMode: 'manual-tear',
  settleDelayMs: 300,
  pauseAfterReceipt: false,
};

export function getPrintQueueSettings(): PrintQueueSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PRINT_QUEUE_SETTINGS };
    const parsed = JSON.parse(raw);

    // Normalize legacy fields if present
    const tearMode =
      parsed.tearMode || (parsed.pauseAfterReceipt ? 'manual-confirm' : 'continuous');

    return {
      ...DEFAULT_PRINT_QUEUE_SETTINGS,
      ...parsed,
      tearMode,
      tearDelayMs:
        typeof parsed.tearDelayMs === 'number' && parsed.tearDelayMs >= 0 && parsed.tearDelayMs <= 10000
          ? parsed.tearDelayMs
          : DEFAULT_PRINT_QUEUE_SETTINGS.tearDelayMs,
      tearGap:
        parsed.tearGap === 'compact' || parsed.tearGap === 'normal' || parsed.tearGap === 'extra'
          ? parsed.tearGap
          : 'extra',
      pauseAfterReceipt: tearMode === 'manual-confirm',
    };
  } catch {
    return { ...DEFAULT_PRINT_QUEUE_SETTINGS };
  }
}

export function savePrintQueueSettings(updates: Partial<PrintQueueSettings>): PrintQueueSettings {
  try {
    const current = getPrintQueueSettings();
    const updated: PrintQueueSettings = {
      ...current,
      ...updates,
    };

    // Keep pauseAfterReceipt synced with tearMode
    if (updates.tearMode) {
      updated.pauseAfterReceipt = updates.tearMode === 'manual-confirm';
    } else if (updates.pauseAfterReceipt !== undefined) {
      updated.tearMode = updates.pauseAfterReceipt ? 'manual-confirm' : 'continuous';
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return { ...DEFAULT_PRINT_QUEUE_SETTINGS, ...updates };
  }
}
