/**
 * Anonymous Review Session Helper
 * Generates and persists a random anonymous client UUID for duplicate-helpful vote tracking.
 * Strictly adheres to privacy: NO device fingerprinting, NO IP collection.
 */

const STORAGE_KEY = 'radha_review_session_id';

export function getAnonymousSessionId(): string {
  if (typeof window === 'undefined') {
    return 'ssr-session';
  }

  try {
    let sessionId = localStorage.getItem(STORAGE_KEY);
    if (!sessionId) {
      // Generate standard RFC4122 v4 UUID
      sessionId = 'anon_' + (crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
      localStorage.setItem(STORAGE_KEY, sessionId);
    }
    return sessionId;
  } catch {
    return 'fallback-anon-session';
  }
}
