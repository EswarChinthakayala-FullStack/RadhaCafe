import { useState, useEffect, useCallback } from 'react';
import { useDisplayMode } from './useDisplayMode';

export type InterfaceDensity = 'compact' | 'comfortable' | 'large-touch';
export type PosStartScreen = 'new-order' | 'dashboard';

const DENSITY_STORAGE_KEY = 'radhacafe_ui_density';
const SCALE_LOCK_STORAGE_KEY = 'radhacafe_lock_app_scale';
const START_SCREEN_STORAGE_KEY = 'radhacafe_pos_start_screen';

export function useAppScaleGuard() {
  const { isStandalone } = useDisplayMode();

  const [density, setDensityState] = useState<InterfaceDensity>(() => {
    if (typeof window === 'undefined') return 'comfortable';
    const saved = localStorage.getItem(DENSITY_STORAGE_KEY);
    if (saved === 'compact' || saved === 'comfortable' || saved === 'large-touch') {
      return saved;
    }
    return 'comfortable';
  });

  const [lockAppScale, setLockAppScaleState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem(SCALE_LOCK_STORAGE_KEY);
    if (saved !== null) {
      return saved === 'true';
    }
    // Default to enabled if running in standalone POS mode
    return isStandalone;
  });

  const [startScreen, setStartScreenState] = useState<PosStartScreen>(() => {
    if (typeof window === 'undefined') return 'new-order';
    const saved = localStorage.getItem(START_SCREEN_STORAGE_KEY);
    return saved === 'dashboard' ? 'dashboard' : 'new-order';
  });

  // Apply data-density attribute to document element
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-density', density);
  }, [density]);

  // Intercept accidental keyboard and mousewheel zoom when lockAppScale is enabled
  useEffect(() => {
    if (typeof window === 'undefined' || !lockAppScale) return;

    // Intercept Ctrl + MouseWheel (accidental desktop browser scaling)
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };

    // Intercept Ctrl/Cmd + Plus / Minus / Zero / Equal (accidental keyboard zoom)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        const key = e.key;
        const code = e.code;

        if (
          key === '+' ||
          key === '-' ||
          key === '=' ||
          key === '0' ||
          code === 'NumpadAdd' ||
          code === 'NumpadSubtract' ||
          code === 'Equal' ||
          code === 'Minus' ||
          code === 'Digit0'
        ) {
          e.preventDefault();
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown, { capture: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [lockAppScale]);

  const setDensity = useCallback((newDensity: InterfaceDensity) => {
    setDensityState(newDensity);
    localStorage.setItem(DENSITY_STORAGE_KEY, newDensity);
  }, []);

  const setLockAppScale = useCallback((enabled: boolean) => {
    setLockAppScaleState(enabled);
    localStorage.setItem(SCALE_LOCK_STORAGE_KEY, String(enabled));
  }, []);

  const setStartScreen = useCallback((screen: PosStartScreen) => {
    setStartScreenState(screen);
    localStorage.setItem(START_SCREEN_STORAGE_KEY, screen);
  }, []);

  return {
    density,
    setDensity,
    lockAppScale,
    setLockAppScale,
    startScreen,
    setStartScreen,
    isStandalone,
  };
}
