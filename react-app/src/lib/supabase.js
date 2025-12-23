import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Please create a .env.local file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
  );
}

console.log('[Supabase] Initializing client for:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Helper: wrap any promise with a timeout
export function withTimeout(promise, ms, errorMessage = 'Request timed out') {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(errorMessage));
    }, ms);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}

// Test connection with timeout
console.log('[Supabase] Testing connection...');
withTimeout(
  fetch(`${supabaseUrl}/rest/v1/`, {
    headers: { apikey: supabaseAnonKey },
  }),
  5000,
  'Supabase connection test timed out'
)
  .then((res) => {
    console.log('[Supabase] Connection test:', res.ok ? 'OK' : `Failed (${res.status})`);
  })
  .catch((err) => {
    console.error('[Supabase] Connection test failed:', err.message);
  });
