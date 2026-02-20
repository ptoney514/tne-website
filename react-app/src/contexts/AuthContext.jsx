import { createContext, useCallback, useMemo } from 'react';
import { authClient } from '../lib/auth-client';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Use Better Auth's session hook
  const { data: session, isPending, error: sessionError } = authClient.useSession();

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

      return { data: result.data };
    } catch (err) {
      const message = err.message || 'Sign in failed. Please try again.';
      return { error: message };
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      await authClient.signOut();
      return { error: null };
    } catch (err) {
      console.error('[Auth] Sign out error:', err);
      // Still consider it a success - user intended to sign out
      return { error: null };
    }
  }, []);

  // Role checking utilities
  const user = session?.user ?? null;
  const hasRole = useCallback((role) => user?.role === role, [user]);
  const isAdmin = useCallback(() => hasRole('admin'), [hasRole]);
  const isCoach = useCallback(() => hasRole('coach'), [hasRole]);
  const isParent = useCallback(() => hasRole('parent'), [hasRole]);
  const hasAnyRole = useCallback(
    (roles) => (user?.role ? roles.includes(user.role) : false),
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      profile: user, // For backwards compatibility - Better Auth stores profile data on user
      profileLoading: false,
      loading: isPending,
      error: sessionError?.message || null,
      signIn,
      signOut,
      hasRole,
      isAdmin,
      isCoach,
      isParent,
      hasAnyRole,
    }),
    [
      user,
      isPending,
      sessionError,
      signIn,
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
