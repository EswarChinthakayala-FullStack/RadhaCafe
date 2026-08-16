import { supabase } from '../supabase/client';
import type { ConnectivityStatus } from './types';

type ConnectivityListener = (status: ConnectivityStatus) => void;

class ConnectivityManager {
  private currentStatus: ConnectivityStatus = typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'online';
  private listeners: Set<ConnectivityListener> = new Set();
  private checkTimeout: any = null;
  private isChecking = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleBrowserOnline);
      window.addEventListener('offline', this.handleBrowserOffline);
      // Run initial check
      this.checkConnectivity();
    }
  }

  public getStatus(): ConnectivityStatus {
    return this.currentStatus;
  }

  public subscribe(listener: ConnectivityListener): () => void {
    this.listeners.add(listener);
    listener(this.currentStatus);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public setStatus(status: ConnectivityStatus) {
    if (this.currentStatus === status) return;
    this.currentStatus = status;
    this.notify();
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentStatus);
      } catch (err) {
        console.error('[Connectivity] Error in listener:', err);
      }
    });
  }

  private handleBrowserOnline = () => {
    this.setStatus('recovering');
    this.scheduleCheck(500);
  };

  private handleBrowserOffline = () => {
    this.setStatus('offline');
  };

  public scheduleCheck(delayMs = 0) {
    if (this.checkTimeout) clearTimeout(this.checkTimeout);
    this.checkTimeout = setTimeout(() => {
      this.checkConnectivity();
    }, delayMs);
  }

  /**
   * Performs lightweight backend reachability check against Supabase
   */
  public async checkConnectivity(): Promise<boolean> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.setStatus('offline');
      return false;
    }

    if (this.isChecking) return this.currentStatus === 'online';
    this.isChecking = true;

    try {
      // 4-second timeout probe
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const { error } = await (supabase as any)
        .from('categories')
        .select('id')
        .limit(1)
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);

      if (error) {
        // If error is network error
        if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError') || error.message?.includes('abort')) {
          this.setStatus('offline');
          return false;
        }
      }

      this.setStatus('online');
      return true;
    } catch {
      this.setStatus('offline');
      return false;
    } finally {
      this.isChecking = false;
    }
  }
}

export const connectivityManager = new ConnectivityManager();
