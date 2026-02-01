import { createAuthClient } from 'better-auth/react';

// Create the Better Auth client for React
export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
});

// Export individual hooks and methods for convenience
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;

// Helper to get current user from session
export function useUser() {
  const { data: session, isPending, error } = useSession();
  return {
    user: session?.user ?? null,
    isLoading: isPending,
    error,
    isAuthenticated: !!session?.user,
  };
}

// Helper to check if user has a specific role
export function useRole() {
  const { user } = useUser();

  return {
    role: user?.role ?? null,
    isAdmin: user?.role === 'admin',
    isCoach: user?.role === 'coach',
    isParent: user?.role === 'parent',
    hasRole: (role: string) => user?.role === role,
    hasAnyRole: (roles: string[]) => user?.role ? roles.includes(user.role) : false,
  };
}
