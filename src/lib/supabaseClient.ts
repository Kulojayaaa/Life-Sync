import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Runtime config: allow a self-hosted deployment (e.g. the Play Store build)
// to override the compiled-in env by defining `window.__ENV` before the app
// script loads. Falls back to Vite's build-time env otherwise.
type RuntimeEnv = {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  VITE_SUPABASE_ANON_KEY?: string;
};

const runtime: RuntimeEnv =
  (typeof window !== 'undefined' && (window as unknown as { __ENV?: RuntimeEnv }).__ENV) || {};

const supabaseUrl =
  runtime.VITE_SUPABASE_URL || (import.meta.env.VITE_SUPABASE_URL as string | undefined);

const supabaseAnonKey =
  runtime.VITE_SUPABASE_PUBLISHABLE_KEY ||
  runtime.VITE_SUPABASE_ANON_KEY ||
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL and Supabase anon/publishable key');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
