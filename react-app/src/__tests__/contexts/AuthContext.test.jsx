import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, AuthContext } from '../../contexts/AuthContext';
import { useContext } from 'react';

// Mock user data
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
};

const mockProfile = {
  id: 'user-123',
  email: 'test@example.com',
  role: 'admin',
  first_name: 'Test',
  last_name: 'User',
};

const mockSession = {
  user: mockUser,
  access_token: 'mock-token',
};

// Mock supabase - we'll configure behavior per test
let mockGetSession;
let mockOnAuthStateChange;
let mockSignInWithPassword;
let mockSignOut;
let mockFromSelect;
let authStateCallback = null;

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: () => mockGetSession(),
      onAuthStateChange: (callback) => {
        authStateCallback = callback;
        return mockOnAuthStateChange(callback);
      },
      signInWithPassword: (...args) => mockSignInWithPassword(...args),
      signOut: () => mockSignOut(),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => mockFromSelect(),
        }),
      }),
    }),
  },
  withTimeout: async (promise) => {
    // Simplified timeout for tests - just pass through
    return promise;
  },
}));

// Test component to access auth context
function TestComponent({ onRender }) {
  const auth = useContext(AuthContext);
  onRender?.(auth);
  return (
    <div>
      <span data-testid="loading">{String(auth.loading)}</span>
      <span data-testid="user">{auth.user?.email || 'null'}</span>
      <span data-testid="profile">{auth.profile?.role || 'null'}</span>
      <span data-testid="error">{auth.error || 'null'}</span>
      <button onClick={() => auth.signIn('test@example.com', 'password')}>Sign In</button>
      <button onClick={() => auth.signOut()}>Sign Out</button>
    </div>
  );
}

describe('AuthContext', () => {
  let unsubscribeMock;

  beforeEach(() => {
    unsubscribeMock = vi.fn();
    authStateCallback = null;

    // Default mocks - no session
    mockGetSession = vi.fn(() => Promise.resolve({ data: { session: null }, error: null }));
    mockOnAuthStateChange = vi.fn(() => ({
      data: { subscription: { unsubscribe: unsubscribeMock } },
    }));
    mockSignInWithPassword = vi.fn();
    mockSignOut = vi.fn(() => Promise.resolve({ error: null }));
    mockFromSelect = vi.fn(() => Promise.resolve({ data: null, error: null }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should start in loading state', async () => {
      // Use a promise that we control
      let resolveSession;
      mockGetSession = vi.fn(
        () =>
          new Promise((resolve) => {
            resolveSession = resolve;
          })
      );

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Should be loading while waiting for session
      expect(screen.getByTestId('loading').textContent).toBe('true');

      // Resolve the session
      await act(async () => {
        resolveSession({ data: { session: null }, error: null });
      });
    });

    it('should finish loading after session check', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });
    });

    it('should have null user when no session exists', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      expect(screen.getByTestId('user').textContent).toBe('null');
    });
  });

  describe('Session Recovery', () => {
    it('should recover user from existing session', async () => {
      mockGetSession = vi.fn(() =>
        Promise.resolve({ data: { session: mockSession }, error: null })
      );
      mockFromSelect = vi.fn(() => Promise.resolve({ data: mockProfile, error: null }));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user').textContent).toBe('test@example.com');
      });
    });

    it('should fetch profile after session recovery', async () => {
      mockGetSession = vi.fn(() =>
        Promise.resolve({ data: { session: mockSession }, error: null })
      );
      mockFromSelect = vi.fn(() => Promise.resolve({ data: mockProfile, error: null }));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('profile').textContent).toBe('admin');
      });
    });
  });

  describe('Session Timeout - Race Condition Fix', () => {
    it('should NOT clear user state when auth state change fires before getSession', async () => {
      // This is the critical test for the race condition fix
      // Simulate: onAuthStateChange fires with SIGNED_IN before getSession completes

      let resolveSession;
      mockGetSession = vi.fn(
        () =>
          new Promise((resolve) => {
            resolveSession = resolve;
          })
      );
      mockFromSelect = vi.fn(() => Promise.resolve({ data: mockProfile, error: null }));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Simulate onAuthStateChange firing immediately with SIGNED_IN
      await act(async () => {
        if (authStateCallback) {
          authStateCallback('SIGNED_IN', mockSession);
        }
      });

      // User should be set from the auth state change
      await waitFor(() => {
        expect(screen.getByTestId('user').textContent).toBe('test@example.com');
      });

      // Now resolve getSession (simulating slow response)
      await act(async () => {
        resolveSession({ data: { session: mockSession }, error: null });
      });

      // User should STILL be logged in
      expect(screen.getByTestId('user').textContent).toBe('test@example.com');
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    it('should process INITIAL_SESSION event and set user', async () => {
      let resolveSession;
      mockGetSession = vi.fn(
        () =>
          new Promise((resolve) => {
            resolveSession = resolve;
          })
      );
      mockFromSelect = vi.fn(() => Promise.resolve({ data: mockProfile, error: null }));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Simulate INITIAL_SESSION event
      await act(async () => {
        if (authStateCallback) {
          authStateCallback('INITIAL_SESSION', mockSession);
        }
      });

      // User should be set from the INITIAL_SESSION event
      await waitFor(() => {
        expect(screen.getByTestId('user').textContent).toBe('test@example.com');
      });

      // Resolve getSession
      await act(async () => {
        resolveSession({ data: { session: mockSession }, error: null });
      });

      // User should still be logged in
      expect(screen.getByTestId('user').textContent).toBe('test@example.com');
    });

    it('should track hasReceivedAuthState when auth event fires', async () => {
      mockGetSession = vi.fn(() => Promise.resolve({ data: { session: null }, error: null }));
      mockFromSelect = vi.fn(() => Promise.resolve({ data: mockProfile, error: null }));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      // No user initially
      expect(screen.getByTestId('user').textContent).toBe('null');

      // Simulate sign in via auth state change
      await act(async () => {
        if (authStateCallback) {
          authStateCallback('SIGNED_IN', mockSession);
        }
      });

      // User should now be set
      await waitFor(() => {
        expect(screen.getByTestId('user').textContent).toBe('test@example.com');
      });
    });
  });

  describe('Sign In', () => {
    it('should sign in successfully', async () => {
      mockSignInWithPassword = vi.fn(() =>
        Promise.resolve({ data: { session: mockSession }, error: null })
      );
      mockFromSelect = vi.fn(() => Promise.resolve({ data: mockProfile, error: null }));

      let authContext;
      render(
        <AuthProvider>
          <TestComponent onRender={(ctx) => (authContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      await act(async () => {
        await authContext.signIn('test@example.com', 'password');
      });

      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
    });

    it('should set error on sign in failure', async () => {
      mockSignInWithPassword = vi.fn(() =>
        Promise.resolve({ data: null, error: { message: 'Invalid credentials' } })
      );

      let authContext;
      render(
        <AuthProvider>
          <TestComponent onRender={(ctx) => (authContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      const result = await act(async () => {
        return await authContext.signIn('test@example.com', 'wrong');
      });

      expect(result.error).toBe('Invalid credentials');
      expect(screen.getByTestId('error').textContent).toBe('Invalid credentials');
    });

    it('should store remember me preference', async () => {
      mockSignInWithPassword = vi.fn(() =>
        Promise.resolve({ data: { session: mockSession }, error: null })
      );

      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

      let authContext;
      render(
        <AuthProvider>
          <TestComponent onRender={(ctx) => (authContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      await act(async () => {
        await authContext.signIn('test@example.com', 'password', true);
      });

      expect(setItemSpy).toHaveBeenCalledWith('tne_remember_me', 'true');
      setItemSpy.mockRestore();
    });
  });

  describe('Sign Out', () => {
    it('should clear user on sign out', async () => {
      mockGetSession = vi.fn(() =>
        Promise.resolve({ data: { session: mockSession }, error: null })
      );
      mockFromSelect = vi.fn(() => Promise.resolve({ data: mockProfile, error: null }));

      let authContext;
      render(
        <AuthProvider>
          <TestComponent onRender={(ctx) => (authContext = ctx)} />
        </AuthProvider>
      );

      // Verify user is logged in
      await waitFor(() => {
        expect(screen.getByTestId('user').textContent).toBe('test@example.com');
      });

      // Sign out
      await act(async () => {
        await authContext.signOut();
      });

      expect(screen.getByTestId('user').textContent).toBe('null');
      expect(screen.getByTestId('profile').textContent).toBe('null');
    });

    it('should handle SIGNED_OUT event', async () => {
      mockGetSession = vi.fn(() =>
        Promise.resolve({ data: { session: mockSession }, error: null })
      );
      mockFromSelect = vi.fn(() => Promise.resolve({ data: mockProfile, error: null }));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user').textContent).toBe('test@example.com');
      });

      // Simulate sign out via auth state change
      await act(async () => {
        if (authStateCallback) {
          authStateCallback('SIGNED_OUT', null);
        }
      });

      expect(screen.getByTestId('user').textContent).toBe('null');
    });
  });

  describe('Role Checking', () => {
    it('should correctly identify admin role', async () => {
      mockGetSession = vi.fn(() =>
        Promise.resolve({ data: { session: mockSession }, error: null })
      );
      mockFromSelect = vi.fn(() => Promise.resolve({ data: mockProfile, error: null }));

      let authContext;
      render(
        <AuthProvider>
          <TestComponent onRender={(ctx) => (authContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('profile').textContent).toBe('admin');
      });

      expect(authContext.isAdmin()).toBe(true);
      expect(authContext.isCoach()).toBe(false);
      expect(authContext.isParent()).toBe(false);
    });

    it('should return false for all roles when not authenticated', async () => {
      let authContext;
      render(
        <AuthProvider>
          <TestComponent onRender={(ctx) => (authContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      expect(authContext.isAdmin()).toBe(false);
      expect(authContext.isCoach()).toBe(false);
      expect(authContext.isParent()).toBe(false);
    });

    it('should identify coach role correctly', async () => {
      const coachProfile = { ...mockProfile, role: 'coach' };
      mockGetSession = vi.fn(() =>
        Promise.resolve({ data: { session: mockSession }, error: null })
      );
      mockFromSelect = vi.fn(() => Promise.resolve({ data: coachProfile, error: null }));

      let authContext;
      render(
        <AuthProvider>
          <TestComponent onRender={(ctx) => (authContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('profile').textContent).toBe('coach');
      });

      expect(authContext.isCoach()).toBe(true);
      expect(authContext.isAdmin()).toBe(false);
    });

    it('should check hasAnyRole correctly', async () => {
      mockGetSession = vi.fn(() =>
        Promise.resolve({ data: { session: mockSession }, error: null })
      );
      mockFromSelect = vi.fn(() => Promise.resolve({ data: mockProfile, error: null }));

      let authContext;
      render(
        <AuthProvider>
          <TestComponent onRender={(ctx) => (authContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('profile').textContent).toBe('admin');
      });

      expect(authContext.hasAnyRole(['admin', 'coach'])).toBe(true);
      expect(authContext.hasAnyRole(['coach', 'parent'])).toBe(false);
    });
  });

  describe('Auth State Change Events', () => {
    it('should handle TOKEN_REFRESHED event', async () => {
      mockGetSession = vi.fn(() =>
        Promise.resolve({ data: { session: mockSession }, error: null })
      );
      mockFromSelect = vi.fn(() => Promise.resolve({ data: mockProfile, error: null }));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user').textContent).toBe('test@example.com');
      });

      // Simulate token refresh
      await act(async () => {
        if (authStateCallback) {
          authStateCallback('TOKEN_REFRESHED', mockSession);
        }
      });

      // User should still be logged in
      expect(screen.getByTestId('user').textContent).toBe('test@example.com');
    });

    it('should clear errors on successful auth state change', async () => {
      let authContext;
      render(
        <AuthProvider>
          <TestComponent onRender={(ctx) => (authContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      // Set an error
      mockSignInWithPassword = vi.fn(() =>
        Promise.resolve({ data: null, error: { message: 'Test error' } })
      );

      await act(async () => {
        await authContext.signIn('test@example.com', 'wrong');
      });

      expect(screen.getByTestId('error').textContent).toBe('Test error');

      // Simulate successful sign in via auth state change
      mockFromSelect = vi.fn(() => Promise.resolve({ data: mockProfile, error: null }));
      await act(async () => {
        if (authStateCallback) {
          authStateCallback('SIGNED_IN', mockSession);
        }
      });

      // Error should be cleared
      await waitFor(() => {
        expect(screen.getByTestId('error').textContent).toBe('null');
      });
    });
  });

  describe('Cleanup', () => {
    it('should unsubscribe from auth changes on unmount', async () => {
      const { unmount } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      unmount();

      expect(unsubscribeMock).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should set error on session error', async () => {
      mockGetSession = vi.fn(() =>
        Promise.resolve({ data: { session: null }, error: { message: 'Session error' } })
      );

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error').textContent).toBe('Session error');
      });
    });

    it('should handle profile fetch error gracefully', async () => {
      mockGetSession = vi.fn(() =>
        Promise.resolve({ data: { session: mockSession }, error: null })
      );
      mockFromSelect = vi.fn(() =>
        Promise.resolve({ data: null, error: { message: 'Profile error' } })
      );

      // Spy on console.error
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user').textContent).toBe('test@example.com');
      });

      // Profile should be null due to error
      expect(screen.getByTestId('profile').textContent).toBe('null');

      consoleSpy.mockRestore();
    });

    it('should return error from signOut if it fails', async () => {
      mockGetSession = vi.fn(() =>
        Promise.resolve({ data: { session: mockSession }, error: null })
      );
      mockFromSelect = vi.fn(() => Promise.resolve({ data: mockProfile, error: null }));
      mockSignOut = vi.fn(() => Promise.resolve({ error: { message: 'Sign out failed' } }));

      let authContext;
      render(
        <AuthProvider>
          <TestComponent onRender={(ctx) => (authContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user').textContent).toBe('test@example.com');
      });

      const result = await act(async () => {
        return await authContext.signOut();
      });

      expect(result.error).toBe('Sign out failed');
    });
  });
});
