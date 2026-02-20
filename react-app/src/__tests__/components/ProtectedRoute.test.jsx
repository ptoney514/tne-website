import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AuthContext } from '../../contexts/AuthContext';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');

  return {
    ...actual,
    Navigate: ({ to }) => <div data-testid="navigate" data-to={to} />,
  };
});

const renderWithAuth = (ui, authValue) => {
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={authValue}>{ui}</AuthContext.Provider>
    </MemoryRouter>
  );
};

const mockAuthValue = (overrides = {}) => ({
  user: null,
  profile: null,
  loading: false,
  error: null,
  signIn: vi.fn(),
  signOut: vi.fn(),
  hasRole: vi.fn(),
  isAdmin: vi.fn(() => false),
  isCoach: vi.fn(() => false),
  isParent: vi.fn(() => false),
  hasAnyRole: vi.fn(() => false),
  ...overrides,
});

describe('ProtectedRoute', () => {
  it('should show loading state while checking auth', () => {
    renderWithAuth(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      mockAuthValue({ loading: true })
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render children when user is authenticated', () => {
    renderWithAuth(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      mockAuthValue({ user: { id: '123' }, profile: { role: 'admin' } })
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect when user is not authenticated', () => {
    renderWithAuth(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      mockAuthValue({ user: null })
    );

    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/login');
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should show access denied when user lacks required role', () => {
    renderWithAuth(
      <ProtectedRoute allowedRoles={['admin']}>
        <div>Admin Content</div>
      </ProtectedRoute>,
      mockAuthValue({ user: { id: '123' }, profile: { role: 'parent' } })
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('should render children when user has required role', () => {
    renderWithAuth(
      <ProtectedRoute allowedRoles={['admin']}>
        <div>Admin Content</div>
      </ProtectedRoute>,
      mockAuthValue({ user: { id: '123' }, profile: { role: 'admin' } })
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('should allow access when user has any of the allowed roles', () => {
    renderWithAuth(
      <ProtectedRoute allowedRoles={['admin', 'coach']}>
        <div>Staff Content</div>
      </ProtectedRoute>,
      mockAuthValue({ user: { id: '123' }, profile: { role: 'coach' } })
    );

    expect(screen.getByText('Staff Content')).toBeInTheDocument();
  });
});
