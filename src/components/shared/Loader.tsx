import { Spinner } from '../ui/spinner';
import { cn } from '../../lib/utils/cn';

interface LoaderProps {
  className?: string;
  label?: string;
}

export function Loader({ className, label = 'Loading...' }: LoaderProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 gap-3 text-muted-foreground', className)}>
      <Spinner className="size-8 text-primary" />
      {label && <p className="text-xs font-medium">{label}</p>}
    </div>
  );
}
