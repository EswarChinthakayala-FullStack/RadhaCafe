import { supabase } from './client';
import type { LoginFormData } from '../validators/loginSchema';

export function normalizeAuthError(error: any): string {
  if (!error) return 'An unknown authentication error occurred.';
  const message = error.message || String(error);

  if (
    message.includes('Invalid login credentials') ||
    message.includes('invalid_credentials') ||
    message.includes('invalid_grant')
  ) {
    return 'Invalid email or password. Please check your credentials and try again.';
  }
  if (message.includes('Failed to fetch') || message.includes('NetworkError') || message.includes('network')) {
    return 'Unable to sign in right now. Please check your connection and try again.';
  }
  return 'Something went wrong while signing in. Please try again.';
}

export async function signIn({ email, password }: LoginFormData) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      throw error;
    }
    return data;
  } catch (err: any) {
    throw new Error(normalizeAuthError(err));
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  } catch (err: any) {
    throw new Error('Logout failed. Please try again.');
  }
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

export function onAuthStateChange(callback: (session: any) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return subscription;
}
