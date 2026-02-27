import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { authClient } from '@/lib/auth-client';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Neon Auth session hook (same Better Auth React adapter under the hood)
  const { data: session, isPending, error: sessionError } = authClient.useSession();

  // Profile data from our user_profiles table
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Fetch profile when session user changes
  useEffect(() => {
    if (!session?.user?.id) {
      setProfile(null);
      return;
    }

    let cancelled = false;
    setProfileLoading(true);

    fetch('/api/auth/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch(() => {
        if (!cancelled) setProfile(null);
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  // Sign in with email/password
  const signIn = useCallback(async (email, password, rememberMe = false) => {
    try {
      const result = await authClient.signIn.email({
        email,
        password,
        rememberMe,
      });

      if (result.error) {
        return { error: result.error.message || 'Sign in failed' };
      }

      // Fetch profile to get role for redirect logic.
      // Retry once after a short delay — the session cookie may not be
      // readable by neonAuth() immediately after sign-in returns.
      const fetchProfile = async () => {
        const res = await fetch('/api/auth/profile');
        if (res.ok) return res.json();
        return null;
      };

      try {
        let profileData = null;
        const delays = [0, 300, 600, 1200];
        for (const delay of delays) {
          if (delay > 0) await new Promise((r) => setTimeout(r, delay));
          profileData = await fetchProfile();
          if (profileData) break;
        }
        if (profileData) {
          setProfile(profileData);
          return { data: { ...result.data, user: { ...result.data?.user, ...profileData } } };
        }
      } catch {
        // Profile fetch failure is non-fatal
      }

      return { data: result.data };
    } catch (err) {
      const message = err.message || 'Sign in failed. Please try again.';
      return { error: message };
    }
  }, []);

  // Sign up with email/password
  const signUp = useCallback(async (email, password, name, firstName, lastName) => {
    try {
      const result = await authClient.signUp.email({ email, password, name });
      if (result.error) return { error: result.error.message || 'Sign up failed' };

      // Create user profile after successful signup
      try {
        await fetch('/api/auth/profile', { method: 'POST' });
      } catch {
        // Non-fatal — profile will be created on next login
      }

      return { data: result.data };
    } catch (err) {
      return { error: err.message || 'Sign up failed. Please try again.' };
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      await authClient.signOut();
      setProfile(null);
      return { error: null };
    } catch (err) {
      console.error('[Auth] Sign out error:', err);
      setProfile(null);
      return { error: null };
    }
  }, []);

  // Merge session user + profile into unified user object
  const user = useMemo(() => {
    if (!session?.user) return null;
    return {
      ...session.user,
      firstName: profile?.firstName ?? null,
      lastName: profile?.lastName ?? null,
      first_name: profile?.firstName ?? null,
      last_name: profile?.lastName ?? null,
      phone: profile?.phone ?? null,
      role: profile?.role ?? 'parent',
      email: session.user.email,
      created_at: profile?.createdAt ?? null,
    };
  }, [session, profile]);

  // Role checking utilities
  const hasRole = useCallback((role) => user?.role === role, [user]);
  const isAdmin = useCallback(() => hasRole('admin'), [hasRole]);
  const isCoach = useCallback(() => hasRole('coach'), [hasRole]);
  const isParent = useCallback(() => hasRole('parent'), [hasRole]);
  const hasAnyRole = useCallback(
    (roles) => (user?.role ? roles.includes(user.role) : false),
    [user]
  );

  const loading = isPending || profileLoading;

  const value = useMemo(
    () => ({
      user,
      profile: user, // Backward compat — profile fields are on user
      profileLoading,
      loading,
      error: sessionError?.message || null,
      signIn,
      signUp,
      signOut,
      hasRole,
      isAdmin,
      isCoach,
      isParent,
      hasAnyRole,
    }),
    [
      user,
      profileLoading,
      loading,
      sessionError,
      signIn,
      signUp,
      signOut,
      hasRole,
      isAdmin,
      isCoach,
      isParent,
      hasAnyRole,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
