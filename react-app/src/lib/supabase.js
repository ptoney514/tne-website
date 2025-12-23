import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Please create a .env.local file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
  );
}

// Log for debugging
console.log('[Supabase] Initializing client for:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Use localStorage explicitly
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  // Add request timeout
  global: {
    fetch: (url, options) => {
      return fetch(url, {
        ...options,
        // 10 second timeout for requests
        signal: AbortSignal.timeout(10000),
      });
    },
  },
});

// Test connection immediately
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('[Supabase] Session check error:', error);
  } else {
    console.log('[Supabase] Session check OK, user:', data.session?.user?.email || 'none');
  }
}).catch(err => {
  console.error('[Supabase] Session check failed:', err);
});
