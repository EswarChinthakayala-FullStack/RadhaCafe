import { Button } from '../../ui/button';
import { createPortal } from 'react-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { FloppyDiskIcon, Loading03Icon, AlertCircleIcon } from '@hugeicons/core-free-icons';

interface SettingsSaveFooterProps {
  isDirty: boolean;
  isPending: boolean;
  onSave: () => void;
  onReset: () => void;
  saveLabel?: string;
  className?: string;
}

export function SettingsSaveFooter({
  isDirty,
  isPending,
  onSave,
  onReset,
  saveLabel = 'Save Changes',
  className = '',
}: SettingsSaveFooterProps) {
  if (!isDirty && !isPending) {
    return null;
  }

  return createPortal(
    <div
      className={`fixed inset-x-0 bottom-0 z-50 flex flex-wrap items-center justify-between gap-3 border-t border-border/80 bg-card/95 p-3 shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-150 md:left-[260px] md:right-5 md:p-4 lg:left-[max(calc((100vw-1120px)/2+260px),292px)] lg:right-[max(calc((100vw-1120px)/2),32px)] ${className}`}
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-semibold">
        <HugeiconsIcon icon={AlertCircleIcon} size={15} className="shrink-0" />
        <span>Unsaved changes in this section</span>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onReset}
          disabled={isPending}
          className="h-8.5 text-xs text-muted-foreground hover:text-foreground rounded-xl"
        >
          <span>Discard</span>
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={onSave}
          disabled={isPending}
          className="h-8.5 text-xs font-bold rounded-xl bg-cinnamon hover:bg-cinnamon/90 text-white gap-1.5 shadow-2xs"
        >
          {isPending ? (
            <>
              <HugeiconsIcon icon={Loading03Icon} size={14} className="animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <HugeiconsIcon icon={FloppyDiskIcon} size={14} />
              <span>{saveLabel}</span>
            </>
          )}
        </Button>
      </div>
    </div>,
    document.body,
  );
}
