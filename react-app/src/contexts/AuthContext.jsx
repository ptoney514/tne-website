import { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase, withTimeout } from '../lib/supabase';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

// Sign in timeout (can be overridden via env vars)
const SIGN_IN_TIMEOUT = parseInt(import.meta.env.VITE_SIGN_IN_TIMEOUT || '30000', 10);
// Session check timeout (8s default, can be overridden)
const SESSION_CHECK_TIMEOUT = parseInt(import.meta.env.VITE_SESSION_CHECK_TIMEOUT || '8000', 10);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Track if we've received valid auth state from onAuthStateChange
  // This prevents the timeout from clearing valid state
  const hasReceivedAuthState = useRef(false);

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
    let isMounted = true;
    let initTimedOut = false;

    const initAuth = async () => {
      console.log('[Auth] Starting initialization...');
      try {
        // Use timeout to prevent hanging forever
        const { data: { session }, error: sessionError } = await withTimeout(
          supabase.auth.getSession(),
          SESSION_CHECK_TIMEOUT,
          'Session check timed out - Supabase may be slow or unreachable'
        );

        if (!isMounted) return;

        console.log('[Auth] Session result:', session?.user?.email || 'no session', sessionError?.message || 'no error');

        if (sessionError) {
          console.error('[Auth] Session error:', sessionError);
          setError(sessionError.message);
          setLoading(false);
          return;
        }

        // Only update state if we haven't already received auth state from onAuthStateChange
        if (!hasReceivedAuthState.current) {
          setUser(session?.user ?? null);

          if (session?.user) {
            console.log('[Auth] Fetching profile for:', session.user.id);
            setProfileLoading(true);
            const profileData = await fetchProfile(session.user.id);
            if (isMounted) {
              console.log('[Auth] Profile result:', profileData?.email || 'no profile');
              setProfile(profileData);
              setProfileLoading(false);
            }
          }
        } else {
          console.log('[Auth] Skipping getSession update - already have auth state from listener');
        }
      } catch (err) {
        if (!isMounted) return;

        console.error('[Auth] Initialization error:', err);
        initTimedOut = true;

        // CRITICAL FIX: Only clear auth state if we haven't received valid state from onAuthStateChange
        // This prevents the timeout from logging out users who are actually signed in
        const isTimeout = err.message?.includes('timed out') ||
                          err.name === 'TimeoutError' ||
                          err.name === 'AbortError';

        if (hasReceivedAuthState.current) {
          console.log('[Auth] Session check timed out but already have valid auth state - keeping user signed in');
        } else {
          // No auth state received yet, safe to clear
          setUser(null);
          setProfile(null);
          if (!isTimeout) {
            setError(err.message);
          } else {
            console.log('[Auth] Session check timed out - proceeding without auth');
          }
        }
      } finally {
        if (isMounted) {
          console.log('[Auth] Initialization complete');
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      console.log('[Auth] Auth state changed:', event, session?.user?.email || 'no user');

      // Track that we've received auth state
      if (session?.user && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED')) {
        hasReceivedAuthState.current = true;
        console.log('[Auth] Received valid auth state from listener');
      }

      // If init timed out and this is the INITIAL_SESSION event with a user, process it
      // (the user is actually signed in, even though getSession timed out)
      if (initTimedOut && event === 'INITIAL_SESSION') {
        if (session?.user) {
          console.log('[Auth] Processing INITIAL_SESSION after timeout - user is signed in');
          // Continue processing - don't return
        } else {
          console.log('[Auth] Ignoring INITIAL_SESSION after timeout - no user');
          return;
        }
      }

      // Clear any previous errors when auth state changes successfully
      setError(null);

      // Handle sign out
      if (event === 'SIGNED_OUT') {
        hasReceivedAuthState.current = false;
        setUser(null);
        setProfile(null);
        return;
      }

      setUser(session?.user ?? null);
      if (session?.user) {
        setProfileLoading(true);
        const profileData = await fetchProfile(session.user.id);
        if (isMounted) {
          setProfile(profileData);
          setProfileLoading(false);
        }
      } else {
        setProfile(null);
      }

      // Mark loading as complete if we receive auth state before getSession completes
      if (loading) {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile, loading]);

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
