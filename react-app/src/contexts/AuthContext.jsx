import { createContext, useState, useEffect, useCallback } from 'react';
import { supabase, withTimeout } from '../lib/supabase';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

// Sign in timeout (can be overridden via env vars)
const SIGN_IN_TIMEOUT = parseInt(import.meta.env.VITE_SIGN_IN_TIMEOUT || '30000', 10);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user profile with role
  const fetchProfile = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Profile fetch error:', error);
      return null;
    }
    return data;
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      console.log('[Auth] Starting initialization...');
      try {
        // Use timeout to prevent hanging forever
        const { data: { session }, error: sessionError } = await withTimeout(
          supabase.auth.getSession(),
          8000,
          'Session check timed out - Supabase may be slow or unreachable'
        );

        console.log('[Auth] Session result:', session?.user?.email || 'no session', sessionError?.message || 'no error');

        if (sessionError) {
          console.error('[Auth] Session error:', sessionError);
          setError(sessionError.message);
          setLoading(false);
          return;
        }

        setUser(session?.user ?? null);

        if (session?.user) {
          console.log('[Auth] Fetching profile for:', session.user.id);
          setProfileLoading(true);
          const profileData = await fetchProfile(session.user.id);
          console.log('[Auth] Profile result:', profileData?.email || 'no profile');
          setProfile(profileData);
          setProfileLoading(false);
        }
      } catch (err) {
        console.error('[Auth] Initialization error:', err);
        setUser(null);
        setProfile(null);
        // Don't set error for timeout - just proceed without auth (allow login page to render)
        const isTimeout = err.message?.includes('timed out') ||
                          err.name === 'TimeoutError' ||
                          err.name === 'AbortError';
        if (!isTimeout) {
          setError(err.message);
        }
      } finally {
        console.log('[Auth] Initialization complete');
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // Clear any previous errors when auth state changes successfully
      setError(null);
      setUser(session?.user ?? null);
      if (session?.user) {
        setProfileLoading(true);
        const profileData = await fetchProfile(session.user.id);
        setProfile(profileData);
        setProfileLoading(false);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  // Sign in with email/password
  const signIn = async (email, password, rememberMe = false) => {
    setError(null);

    // Add timeout to prevent infinite hanging
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Sign in timed out. Please try again.')), SIGN_IN_TIMEOUT)
    );

    try {
      const { data, error } = await Promise.race([
        supabase.auth.signInWithPassword({ email, password }),
        timeoutPromise,
      ]);

      if (error) {
        setError(error.message);
        return { error: error.message };
      }

      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('tne_remember_me', 'true');
      } else {
        localStorage.removeItem('tne_remember_me');
        // For non-remembered sessions, we'll clear on window close
        sessionStorage.setItem('tne_session_only', 'true');
      }

      return { data };
    } catch (err) {
      const message = err.message || 'Sign in failed. Please try again.';
      setError(message);
      return { error: message };
    }
  };

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setError(error.message);
      return { error: error.message };
    }
    setUser(null);
    setProfile(null);
    return { error: null };
  };

  // Role checking utilities
  const hasRole = (role) => profile?.role === role;
  const isAdmin = () => hasRole('admin');
  const isCoach = () => hasRole('coach');
  const isParent = () => hasRole('parent');
  const hasAnyRole = (roles) => roles.includes(profile?.role);

  const value = {
    user,
    profile,
    profileLoading,
    loading,
    error,
    signIn,
    signOut,
    hasRole,
    isAdmin,
    isCoach,
    isParent,
    hasAnyRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
