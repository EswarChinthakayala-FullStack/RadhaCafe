import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { getSession, onAuthStateChange, signIn as authSignIn, signOut as authSignOut } from '../lib/supabase/auth';
import type { LoginFormData } from '../lib/validators/loginSchema';

export function useAuth() {
  const {
    session,
    user,
    isAuthenticated,
    isLoading,
    initialized,
    setSession,
    clearSession,
    setLoading,
  } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const initialSession = await getSession();
        if (mounted) {
          setSession(initialSession);
        }
      } catch {
        if (mounted) {
          clearSession();
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (!initialized) {
      initAuth();
    }

    const subscription = onAuthStateChange((currentSession) => {
      if (mounted) {
        if (currentSession) {
          setSession(currentSession);
        } else {
          clearSession();
        }
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [initialized, setSession, clearSession, setLoading]);

  const signIn = async (credentials: LoginFormData) => {
    const data = await authSignIn(credentials);
    if (data?.session) {
      setSession(data.session);
    }
    return data;
  };

  const signOut = async () => {
    try {
      await authSignOut();
    } finally {
      clearSession();
    }
  };

  return {
    session,
    user,
    isAuthenticated,
    isLoading,
    initialized,
    signIn,
    signOut,
    logout: signOut, // Alias for backward compatibility
  };
}
