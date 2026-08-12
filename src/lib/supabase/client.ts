import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/supabase.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are missing. Check .env');
}

export const supabase = createClient<Database>(
  supabaseUrl || 'https://ginhuuawuvaxvnbcxqqw.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdpbmh1dWF3dXZheHZuYmN4cXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1Mzc5OTcsImV4cCI6MjEwMjExMzk5N30.tXkLCd_hBZpPVmtmoeATmfJzU_EAcFcwvYjKs1LO8UY'
);
