import { useState, useEffect, useCallback } from 'react';

export type DisplayMode = 'standalone' | 'browser' | 'fullscreen';

let deferredInstallPrompt: any = null;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    window.dispatchEvent(new CustomEvent('radhacafe-pwa-installable'));
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    window.dispatchEvent(new CustomEvent('radhacafe-pwa-installed'));
  });
}

/**
 * Detects current PWA display mode, captures install prompt, and manages fullscreen focus mode
 */
export function useDisplayMode() {
  const [isStandalone, setIsStandalone] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: window-controls-overlay)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://')
    );
  });

  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => {
    if (typeof document === 'undefined') return false;
    return Boolean(document.fullscreenElement);
  });

  const [canInstall, setCanInstall] = useState<boolean>(() => Boolean(deferredInstallPrompt));
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const standaloneMedia = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches);
      if (e.matches) setIsInstalled(true);
    };

    standaloneMedia.addEventListener('change', handleDisplayModeChange);

    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    const handleInstallable = () => setCanInstall(true);
    const handleInstalled = () => {
      setCanInstall(false);
      setIsInstalled(true);
    };

    window.addEventListener('radhacafe-pwa-installable', handleInstallable);
    window.addEventListener('radhacafe-pwa-installed', handleInstalled);

    return () => {
      standaloneMedia.removeEventListener('change', handleDisplayModeChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('radhacafe-pwa-installable', handleInstallable);
      window.removeEventListener('radhacafe-pwa-installed', handleInstalled);
    };
  }, []);

  const installApp = useCallback(async (): Promise<boolean> => {
    if (!deferredInstallPrompt) return false;
    try {
      deferredInstallPrompt.prompt();
      const choiceResult = await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      setCanInstall(false);
      return choiceResult.outcome === 'accepted';
    } catch {
      return false;
    }
  }, []);

  const toggleFullscreen = useCallback(async (): Promise<void> => {
    if (typeof document === 'undefined') return;
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen request rejected:', err);
    }
  }, []);

  return {
    isStandalone,
    isFullscreen,
    canInstall,
    isInstalled,
    displayMode: (isFullscreen ? 'fullscreen' : isStandalone ? 'standalone' : 'browser') as DisplayMode,
    installApp,
    toggleFullscreen,
    enterFullscreen: toggleFullscreen,
    exitFullscreen: toggleFullscreen,
  };
}
