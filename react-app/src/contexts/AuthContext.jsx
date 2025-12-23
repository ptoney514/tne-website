import { createContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

// Configurable timeouts (can be overridden via env vars)
const AUTH_INIT_TIMEOUT = parseInt(import.meta.env.VITE_AUTH_INIT_TIMEOUT || '10000', 10);
const SIGN_IN_TIMEOUT = parseInt(import.meta.env.VITE_SIGN_IN_TIMEOUT || '15000', 10);

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
    // Get initial session with timeout
    const initAuth = async () => {
      try {
        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Auth initialization timed out')), AUTH_INIT_TIMEOUT)
        );

        const sessionPromise = supabase.auth.getSession();
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);

        setUser(session?.user ?? null);
        if (session?.user) {
          setProfileLoading(true);
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
          setProfileLoading(false);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
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
  const signIn = async (email, password) => {
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
