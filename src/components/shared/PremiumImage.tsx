import { useState, type ImgHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { HugeiconsIcon } from '@hugeicons/react';
import { Coffee02Icon } from '@hugeicons/core-free-icons';

export interface PremiumImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  aspectRatio?: 'auto' | '1/1' | '4/3' | '16/9' | '3/2' | '4/5';
  fit?: 'cover' | 'contain';
  position?: string;
  containerClassName?: string;
  fallbackIcon?: any;
  priority?: boolean;
}

const aspectMap: Record<string, string> = {
  auto: '',
  '1/1': 'aspect-square',
  '4/3': 'aspect-[4/3]',
  '16/9': 'aspect-video',
  '3/2': 'aspect-[3/2]',
  '4/5': 'aspect-[4/5]',
};

export function PremiumImage({
  src,
  alt,
  aspectRatio = 'auto',
  fit = 'cover',
  position = 'object-center',
  containerClassName = '',
  className = '',
  fallbackIcon = Coffee02Icon,
  priority = false,
  onLoad,
  onError,
  ...props
}: PremiumImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const aspectClass = aspectMap[aspectRatio] || '';

  if (!src || error) {
    return (
      <div
        className={cn(
          'w-full h-full bg-[#1C100B] border border-[#3E2519]/50 flex flex-col items-center justify-center text-cream/40 p-4 rounded-xl',
          aspectClass,
          containerClassName
        )}
      >
        <HugeiconsIcon icon={fallbackIcon} size={28} className="text-[#E5A88B]/40" />
        <span className="text-[10px] mt-1.5 font-medium text-cream/50 tracking-wide uppercase">
          {alt || 'RadhaCafe'}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden w-full bg-[#160B07]',
        aspectClass,
        containerClassName
      )}
    >
      {/* Background Skeleton while loading */}
      {!loaded && (
        <div
          className="absolute inset-0 bg-[#1D100A] animate-pulse"
          aria-hidden="true"
        />
      )}

      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
        onError={(e) => {
          setError(true);
          setLoaded(true);
          onError?.(e);
        }}
        className={cn(
          'w-full h-full transition-opacity duration-500 ease-out',
          fit === 'contain' ? 'object-contain' : 'object-cover',
          position,
          loaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        {...props}
      />
    </div>
  );
}
