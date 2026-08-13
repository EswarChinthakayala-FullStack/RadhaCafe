import { useState, type ImgHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { Spinner } from './spinner';
import { HugeiconsIcon } from '@hugeicons/react';
import { Coffee02Icon } from '@hugeicons/core-free-icons';

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackIcon?: any;
  containerClassName?: string;
  spinnerClassName?: string;
}

export function LazyImage({
  src,
  alt,
  className,
  containerClassName,
  spinnerClassName,
  fallbackIcon = Coffee02Icon,
  onLoad,
  onError,
  loading = 'lazy',
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    setIsLoaded(true);
    if (onError) onError(e);
  };

  if (!src || hasError) {
    return (
      <div
        className={cn(
          'w-full h-full bg-secondary/50 flex flex-col items-center justify-center text-muted-foreground/50 p-2',
          containerClassName
        )}
      >
        <HugeiconsIcon icon={fallbackIcon} size={28} className="text-muted-foreground/40" />
        <span className="text-[10px] mt-1 font-medium text-muted-foreground/60">{alt || 'Image unavailable'}</span>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden w-full h-full bg-secondary/40', containerClassName)}>
      {/* Loading Skeleton & Radix Spinner */}
      {!isLoaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-secondary/60 backdrop-blur-2xs animate-pulse">
          <Spinner className={cn('size-6 text-cinnamon animate-spin', spinnerClassName)} />
        </div>
      )}

      {/* Lazy Loaded Image */}
      <img
        src={src}
        alt={alt}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        {...props}
      />
    </div>
  );
}
