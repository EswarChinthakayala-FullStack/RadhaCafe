import { Button } from '../../ui/button';
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

  return (
    <div
      className={`sticky bottom-0 z-20 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 p-3 sm:p-4 bg-card/95 backdrop-blur-md border-t border-border/80 shadow-lg flex items-center justify-between gap-3 flex-wrap animate-in fade-in slide-in-from-bottom-2 duration-150 ${className}`}
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
    </div>
  );
}
