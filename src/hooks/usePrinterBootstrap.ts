import { useEffect } from 'react';
import { printerSessionManager } from '../lib/printer/printerSessionManager';

/**
 * Backward compatibility hook.
 * The printer session is orchestrated globally by PrinterSessionProvider.
 */
export function usePrinterBootstrap() {
  useEffect(() => {
    printerSessionManager.initializeSession();
  }, []);
}
