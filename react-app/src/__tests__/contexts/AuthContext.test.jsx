import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, AuthContext } from '../../contexts/AuthContext';
import { useContext } from 'react';

// Mock Supabase
const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockSignOut = vi.fn();
const mockFromSelect = vi.fn();

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: () => mockGetSession(),
      onAuthStateChange: (callback) => {
        mockOnAuthStateChange(callback);
        return {
          data: {
            subscription: {
              unsubscribe: vi.fn(),
            },
          },
        };
      },
      signInWithPassword: (params) => mockSignInWithPassword(params),
      signOut: () => mockSignOut(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: () => mockFromSelect(),
        })),
      })),
    })),
  },
  withTimeout: (promise) => promise,
}));

// Test component to consume auth context
function TestConsumer() {
  const auth = useContext(AuthContext);
  return (
    <div>
      <div data-testid="loading">{auth.loading ? 'loading' : 'ready'}</div>
      <div data-testid="user">{auth.user?.email || 'no-user'}</div>
      <div data-testid="profile">{auth.profile?.role || 'no-profile'}</div>
      <div data-testid="error">{auth.error || 'no-error'}</div>
      <button onClick={() => auth.signIn('test@example.com', 'password')}>Sign In</button>
      <button onClick={auth.signOut}>Sign Out</button>
      <div data-testid="is-admin">{auth.isAdmin() ? 'yes' : 'no'}</div>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: no session
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    mockFromSelect.mockResolvedValue({ data: null, error: null });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial loading state', () => {
    it('should start with loading true', async () => {
      // Make getSession hang
      mockGetSession.mockImplementation(() => new Promise(() => {}));

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      expect(screen.getByTestId('loading').textContent).toBe('loading');
    });

    it('should finish loading after session check', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('ready');
      });
    });
  });

  describe('session restoration', () => {
    it('should restore user from existing session', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockProfile = { id: 'user-123', role: 'admin', first_name: 'Test' };

      mockGetSession.mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null,
      });
      mockFromSelect.mockResolvedValue({ data: mockProfile, error: null });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user').textContent).toBe('test@example.com');
      });

      await waitFor(() => {
        expect(screen.getByTestId('profile').textContent).toBe('admin');
      });
    });

    it('should handle session error gracefully', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Session expired' },
      });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error').textContent).toBe('Session expired');
      });
    });
  });

  describe('sign in', () => {
    it('should sign in user successfully', async () => {
      const user = userEvent.setup();
      const mockUser = { id: 'user-123', email: 'test@example.com' };

      mockSignInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: { user: mockUser } },
        error: null,
      });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('ready');
      });

      await act(async () => {
        await user.click(screen.getByText('Sign In'));
      });

      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
    });

    it('should handle sign in error', async () => {
      const user = userEvent.setup();

      mockSignInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' },
      });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('ready');
      });

      await act(async () => {
        await user.click(screen.getByText('Sign In'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('error').textContent).toBe('Invalid credentials');
      });
    });
  });

  describe('sign out', () => {
    it('should clear user state on sign out', async () => {
      const user = userEvent.setup();
      const mockUser = { id: 'user-123', email: 'test@example.com' };

      mockGetSession.mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null,
      });
      mockFromSelect.mockResolvedValue({
        data: { role: 'admin' },
        error: null,
      });
      mockSignOut.mockResolvedValue({ error: null });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user').textContent).toBe('test@example.com');
      });

      // Simulate the auth state change callback being called on sign out
      await act(async () => {
        await user.click(screen.getByText('Sign Out'));
        // The onAuthStateChange callback should be triggered with SIGNED_OUT
        const callback = mockOnAuthStateChange.mock.calls[0][0];
        callback('SIGNED_OUT', null);
      });

      await waitFor(() => {
        expect(screen.getByTestId('user').textContent).toBe('no-user');
      });
    });
  });

  describe('role checking utilities', () => {
    it('should correctly identify admin role', async () => {
      const mockUser = { id: 'user-123', email: 'admin@example.com' };
      const mockProfile = { id: 'user-123', role: 'admin' };

      mockGetSession.mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null,
      });
      mockFromSelect.mockResolvedValue({ data: mockProfile, error: null });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('profile').textContent).toBe('admin');
      });

      await waitFor(() => {
        expect(screen.getByTestId('is-admin').textContent).toBe('yes');
      });
    });

    it('should return false for non-admin users', async () => {
      const mockUser = { id: 'user-123', email: 'parent@example.com' };
      const mockProfile = { id: 'user-123', role: 'parent' };

      mockGetSession.mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null,
      });
      mockFromSelect.mockResolvedValue({ data: mockProfile, error: null });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('profile').textContent).toBe('parent');
      });

      await waitFor(() => {
        expect(screen.getByTestId('is-admin').textContent).toBe('no');
      });
    });
  });

  describe('auth state change listener', () => {
    it('should register auth state change listener on mount', async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(mockOnAuthStateChange).toHaveBeenCalled();
      });
    });

    it('should update state when auth state changes', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('ready');
      });

      // Simulate sign in through auth state change
      await act(async () => {
        const callback = mockOnAuthStateChange.mock.calls[0][0];
        callback('SIGNED_IN', { user: mockUser });
      });

      await waitFor(() => {
        expect(screen.getByTestId('user').textContent).toBe('test@example.com');
      });
    });
  });
});
