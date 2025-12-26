import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useRegistrationStatus } from '../../hooks/useRegistrationStatus';

// Create a chainable mock that handles Supabase query patterns
const createChainableMock = (responseData = null, responseError = null) => {
  const mock = {
    select: vi.fn(() => mock),
    eq: vi.fn(() => mock),
    single: vi.fn(() => Promise.resolve({ data: responseData, error: responseError })),
  };
  return mock;
};

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => createChainableMock()),
  },
}));

describe('useRegistrationStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading state and closed registration', () => {
    const { result } = renderHook(() => useRegistrationStatus());

    expect(result.current.loading).toBe(true);
    expect(result.current.isOpen).toBe(false);
    expect(result.current.label).toBeNull();
    expect(result.current.seasonId).toBeNull();
  });

  it('should return registration status after loading', async () => {
    const { result } = renderHook(() => useRegistrationStatus());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should complete loading without crashing
    expect(result.current.loading).toBe(false);
  });

  it('should expose refetch function', async () => {
    const { result } = renderHook(() => useRegistrationStatus());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe('function');
  });

  it('should have correct shape of returned data', async () => {
    const { result } = renderHook(() => useRegistrationStatus());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Check that all expected properties exist
    expect(result.current).toHaveProperty('isOpen');
    expect(result.current).toHaveProperty('label');
    expect(result.current).toHaveProperty('seasonId');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('refetch');
  });

  it('should default to closed registration when no active season found', async () => {
    const { result } = renderHook(() => useRegistrationStatus());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // When no season is found, registration should be closed
    expect(result.current.isOpen).toBe(false);
  });
});

describe('useRegistrationStatus - with mocked data', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return open registration when season has registration_open true', async () => {
    const mockSeasonData = {
      id: 'test-season-id',
      name: '2025-26 Winter',
      registration_open: true,
      registration_label: "Fall/Winter '25-26",
    };

    // Override the mock for this specific test
    const { supabase } = await import('../../lib/supabase');
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockSeasonData, error: null }),
        }),
      }),
    });

    const { result } = renderHook(() => useRegistrationStatus());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.label).toBe("Fall/Winter '25-26");
    expect(result.current.seasonId).toBe('test-season-id');
  });

  it('should return closed registration when season has registration_open false', async () => {
    const mockSeasonData = {
      id: 'test-season-id',
      name: '2025-26 Winter',
      registration_open: false,
      registration_label: null,
    };

    const { supabase } = await import('../../lib/supabase');
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockSeasonData, error: null }),
        }),
      }),
    });

    const { result } = renderHook(() => useRegistrationStatus());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('should handle errors gracefully', async () => {
    const { supabase } = await import('../../lib/supabase');
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' }
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useRegistrationStatus());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should default to closed on error
    expect(result.current.isOpen).toBe(false);
  });

  it('should use season name as fallback when registration_label is empty', async () => {
    const mockSeasonData = {
      id: 'test-season-id',
      name: '2025-26 Winter',
      registration_open: true,
      registration_label: null,
    };

    const { supabase } = await import('../../lib/supabase');
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockSeasonData, error: null }),
        }),
      }),
    });

    const { result } = renderHook(() => useRegistrationStatus());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.label).toBe('2025-26 Winter');
  });
});
