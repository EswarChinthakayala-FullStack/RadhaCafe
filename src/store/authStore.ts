import { create } from 'zustand';

export interface UserSession {
  id: string;
  email: string;
}

interface AuthState {
  session: any | null;
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialized: boolean;
  setSession: (session: any | null) => void;
  clearSession: () => void;
  setLoading: (isLoading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
  initialized: false,
  setSession: (session) =>
    set({
      session,
      user: session?.user ? { id: session.user.id, email: session.user.email || '' } : null,
      isAuthenticated: !!session?.user,
      isLoading: false,
      initialized: true,
    }),
  clearSession: () =>
    set({
      session: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      initialized: true,
    }),
  setLoading: (isLoading) => set({ isLoading }),
  setInitialized: (initialized) => set({ initialized }),
}));
