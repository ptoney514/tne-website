import { createAuthClient } from 'better-auth/react';
import { inferAdditionalFields } from 'better-auth/client/plugins';

// Create the Better Auth client for React
// Use NEXT_PUBLIC_APP_URL if set, otherwise derive from current origin (works in both dev and production)
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : ''),
  plugins: [
    inferAdditionalFields({
      user: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        phone: { type: 'string' },
        role: { type: 'string' },
      },
    }),
  ],
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
