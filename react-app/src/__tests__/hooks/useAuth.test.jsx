import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuth } from '../../hooks/useAuth';
import { AuthContext } from '../../contexts/AuthContext';

// Helper to create a wrapper with AuthContext
const createWrapper = (contextValue) => {
  return function Wrapper({ children }) {
    return (
      <AuthContext.Provider value={contextValue}>
        {children}
      </AuthContext.Provider>
    );
  };
};

// Mock auth context value factory
const mockAuthValue = (overrides = {}) => ({
  user: null,
  profile: null,
  profileLoading: false,
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

describe('useAuth', () => {
  it('should throw error when used outside AuthProvider', () => {
    // Suppress console.error for this test since we expect an error
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleSpy.mockRestore();
  });

  it('should return context value when inside AuthProvider', () => {
    const mockContext = mockAuthValue({ user: { id: '123', email: 'test@example.com' } });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(mockContext),
    });

    expect(result.current).toBe(mockContext);
    expect(result.current.user).toEqual({ id: '123', email: 'test@example.com' });
  });

  it('should return loading state correctly', () => {
    const mockContext = mockAuthValue({ loading: true });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(mockContext),
    });

    expect(result.current.loading).toBe(true);
  });

  it('should return profile when authenticated', () => {
    const mockProfile = { id: '123', role: 'admin', first_name: 'Test' };
    const mockContext = mockAuthValue({
      user: { id: '123' },
      profile: mockProfile,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(mockContext),
    });

    expect(result.current.profile).toEqual(mockProfile);
  });

  it('should return error state correctly', () => {
    const mockContext = mockAuthValue({ error: 'Authentication failed' });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(mockContext),
    });

    expect(result.current.error).toBe('Authentication failed');
  });

  it('should provide signIn function', () => {
    const signInMock = vi.fn();
    const mockContext = mockAuthValue({ signIn: signInMock });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(mockContext),
    });

    expect(result.current.signIn).toBe(signInMock);
  });

  it('should provide signOut function', () => {
    const signOutMock = vi.fn();
    const mockContext = mockAuthValue({ signOut: signOutMock });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(mockContext),
    });

    expect(result.current.signOut).toBe(signOutMock);
  });

  it('should provide role checking utilities', () => {
    const isAdminMock = vi.fn(() => true);
    const mockContext = mockAuthValue({
      user: { id: '123' },
      profile: { role: 'admin' },
      isAdmin: isAdminMock,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(mockContext),
    });

    expect(result.current.isAdmin).toBe(isAdminMock);
    expect(result.current.isAdmin()).toBe(true);
  });
});
