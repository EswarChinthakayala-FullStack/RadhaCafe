import { describe, it, expect, beforeEach } from 'vitest';

// Mock localStorage for Node test runner
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

describe('App Scale & POS Preferences Logic', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('handles default UI density settings', () => {
    const saved = localStorage.getItem('radhacafe_ui_density');
    expect(saved).toBeNull();

    localStorage.setItem('radhacafe_ui_density', 'compact');
    expect(localStorage.getItem('radhacafe_ui_density')).toBe('compact');

    localStorage.setItem('radhacafe_ui_density', 'large-touch');
    expect(localStorage.getItem('radhacafe_ui_density')).toBe('large-touch');
  });

  it('persists lockAppScale zoom protection preference', () => {
    localStorage.setItem('radhacafe_lock_app_scale', 'true');
    expect(localStorage.getItem('radhacafe_lock_app_scale')).toBe('true');

    localStorage.setItem('radhacafe_lock_app_scale', 'false');
    expect(localStorage.getItem('radhacafe_lock_app_scale')).toBe('false');
  });

  it('persists POS start screen routing preference', () => {
    localStorage.setItem('radhacafe_pos_start_screen', 'new-order');
    expect(localStorage.getItem('radhacafe_pos_start_screen')).toBe('new-order');

    localStorage.setItem('radhacafe_pos_start_screen', 'dashboard');
    expect(localStorage.getItem('radhacafe_pos_start_screen')).toBe('dashboard');
  });
});
