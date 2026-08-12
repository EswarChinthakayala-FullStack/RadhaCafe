import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook that tracks an element's scroll progress through the viewport.
 * Returns a value from 0 (just entering) to 1 (leaving viewport).
 */
export function useScrollProgress(offset = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const windowH = window.innerHeight;
      const raw = (windowH - rect.top + offset) / (windowH + rect.height);
      setProgress(Math.max(0, Math.min(1, raw)));
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [offset]);

  return { ref, progress };
}

/**
 * Hook that returns true once the element enters the viewport.
 * Stays true permanently (enter-once animation trigger).
 */
export function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

/**
 * Hook that returns parallax-style transform values based on scroll position.
 * speed > 0 moves slower (parallax bg), speed < 0 moves faster.
 */
export function useParallax(speed = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  const [y, setY] = useState(0);

  const handleScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const windowH = window.innerHeight;
    const center = rect.top + rect.height / 2 - windowH / 2;
    setY(center * speed * -1);
  }, [speed]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return { ref, y };
}
