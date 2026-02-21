import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, AuthContext } from '@/contexts/AuthContext';
import { useContext, useState } from 'react';

// Mock auth-client
const mockUseSession = vi.fn();
const mockSignIn = vi.fn();
const mockSignOut = vi.fn();

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    useSession: () => mockUseSession(),
    signIn: {
      email: (params) => mockSignIn(params),
    },
    signOut: () => mockSignOut(),
  },
}));

// Test component to consume auth context
function TestConsumer() {
  const auth = useContext(AuthContext);
  const [signInResult, setSignInResult] = useState('no-signin-result');
  return (
    <div>
      <div data-testid="loading">{auth.loading ? 'loading' : 'ready'}</div>
      <div data-testid="user">{auth.user?.email || 'no-user'}</div>
      <div data-testid="profile">{auth.profile?.role || 'no-profile'}</div>
      <div data-testid="error">{auth.error || 'no-error'}</div>
      <button
        onClick={async () => {
          const result = await auth.signIn('test@example.com', 'password');
          setSignInResult(result?.error || 'success');
        }}
      >
        Sign In
      </button>
      <button onClick={auth.signOut}>Sign Out</button>
      <div data-testid="is-admin">{auth.isAdmin() ? 'yes' : 'no'}</div>
      <div data-testid="sign-in-result">{signInResult}</div>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: no session
    mockUseSession.mockReturnValue({
      data: null,
      isPending: false,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial loading state', () => {
    it('should start with loading true when session is pending', async () => {
      mockUseSession.mockReturnValue({
        data: null,
        isPending: true,
      });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      expect(screen.getByTestId('loading').textContent).toBe('loading');
    });

    it('should finish loading after session check', async () => {
      mockUseSession.mockReturnValue({
        data: null,
        isPending: false,
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
      const mockUser = { id: 'user-123', email: 'test@example.com', role: 'admin' };

      mockUseSession.mockReturnValue({
        data: { user: mockUser, session: { user: mockUser } },
        isPending: false,
      });

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
  });

  describe('sign in', () => {
    it('should sign in user successfully', async () => {
      const user = userEvent.setup();
      const mockUser = { id: 'user-123', email: 'test@example.com', role: 'admin' };

      mockUseSession.mockReturnValue({
        data: null,
        isPending: false,
      });

      mockSignIn.mockResolvedValue({
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

      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
        rememberMe: false,
      });
      expect(screen.getByTestId('sign-in-result').textContent).toBe('success');
    });

    it('should handle sign in error', async () => {
      const user = userEvent.setup();

      mockUseSession.mockReturnValue({
        data: null,
        isPending: false,
      });

      mockSignIn.mockResolvedValue({
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
        expect(screen.getByTestId('sign-in-result').textContent).toBe('Invalid credentials');
      });
    });
  });

  describe('sign out', () => {
    it('should clear user state on sign out', async () => {
      const user = userEvent.setup();
      const mockUser = { id: 'user-123', email: 'test@example.com' };

      // Start with a logged-in user
      mockUseSession.mockReturnValue({
        data: { user: mockUser, session: { user: mockUser } },
        isPending: false,
      });
      mockSignOut.mockResolvedValue({ error: null });

      const { rerender } = render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user').textContent).toBe('test@example.com');
      });

      // Simulate sign out - update the mock to return no session
      mockUseSession.mockReturnValue({
        data: null,
        isPending: false,
      });

      await act(async () => {
        await user.click(screen.getByText('Sign Out'));
      });

      // Rerender to pick up the new session state
      rerender(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user').textContent).toBe('no-user');
      });
    });
  });

  describe('role checking utilities', () => {
    it('should correctly identify admin role', async () => {
      const mockUser = { id: 'user-123', email: 'admin@example.com', role: 'admin' };

      mockUseSession.mockReturnValue({
        data: { user: mockUser, session: { user: mockUser } },
        isPending: false,
      });

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
      const mockUser = { id: 'user-123', email: 'parent@example.com', role: 'parent' };

      mockUseSession.mockReturnValue({
        data: { user: mockUser, session: { user: mockUser } },
        isPending: false,
      });

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
});
