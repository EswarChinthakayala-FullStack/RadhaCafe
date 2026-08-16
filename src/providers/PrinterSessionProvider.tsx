import { useEffect, type ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { printerSessionManager } from '../lib/printer/printerSessionManager';

interface PrinterSessionProviderProps {
  children: ReactNode;
}

/**
 * Mounts once at the authenticated admin shell root.
 * Manages persistent Bluetooth session initialization, startup auto-connect, and teardown.
 */
export function PrinterSessionProvider({ children }: PrinterSessionProviderProps) {
  const { isAuthenticated, initialized } = useAuth();

  useEffect(() => {
    if (initialized && isAuthenticated) {
      printerSessionManager.initializeSession();
    } else if (initialized && !isAuthenticated) {
      printerSessionManager.teardownSession();
    }

    return () => {
      if (!isAuthenticated) {
        printerSessionManager.teardownSession();
      }
    };
  }, [isAuthenticated, initialized]);

  return <>{children}</>;
}
