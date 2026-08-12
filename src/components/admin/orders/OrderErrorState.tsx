import { Button } from '../../ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { AlertCircleIcon, RefreshIcon } from '@hugeicons/core-free-icons';

interface OrderErrorStateProps {
  errorMsg?: string;
  onRetry: () => void;
}

export function OrderErrorState({ errorMsg, onRetry }: OrderErrorStateProps) {
  return (
    <div className="p-10 text-center bg-destructive/5 rounded-md border border-destructive/20 space-y-3 my-4">
      <div className="w-12 h-12 mx-auto rounded-md bg-destructive/10 text-destructive flex items-center justify-center border border-destructive/20">
        <HugeiconsIcon icon={AlertCircleIcon} size={24} />
      </div>

      <div className="space-y-1 max-w-sm mx-auto">
        <h3 className="text-sm font-bold text-foreground">Unable to Load Order History</h3>
        <p className="text-xs text-muted-foreground">
          {errorMsg || 'Please check your connection and try again.'}
        </p>
      </div>

      <Button
        size="sm"
        onClick={onRetry}
        className="bg-destructive text-white hover:bg-destructive/90 font-bold text-xs h-9 px-4 rounded-md gap-1.5 shadow-xs"
      >
        <HugeiconsIcon icon={RefreshIcon} size={14} />
        <span>Retry</span>
      </Button>
    </div>
  );
}
