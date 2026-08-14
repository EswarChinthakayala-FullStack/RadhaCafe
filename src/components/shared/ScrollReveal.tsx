import { useEffect, useRef, type ReactNode, type CSSProperties } from 'react';

export type RevealDirection = 'up' | 'left' | 'right' | 'scale' | 'fade';

interface ScrollRevealProps {
  children: ReactNode;
  direction?: RevealDirection;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  threshold?: number;
}

const directionClass: Record<RevealDirection, string> = {
  up: 'reveal',
  left: 'reveal-left',
  right: 'reveal-right',
  scale: 'reveal-scale',
  fade: 'reveal-fade',
};

export function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  className = '',
  style,
  threshold = 0.12,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      el.classList.add('visible');
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible');
          observer.disconnect();
        }
      },
      { threshold: Math.min(threshold, 0.05), rootMargin: '0px 0px 80px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={`${directionClass[direction]} ${className}`}
      style={{ transitionDelay: delay ? `${delay}s` : undefined, ...style }}
    >
      {children}
    </div>
  );
}
