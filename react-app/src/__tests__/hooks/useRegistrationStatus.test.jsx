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

  it('should initialize with loading state and closed status', () => {
    const { result } = renderHook(() => useRegistrationStatus());

    expect(result.current.loading).toBe(true);
    expect(result.current.isTryoutsOpen).toBe(false);
    expect(result.current.isRegistrationOpen).toBe(false);
    expect(result.current.tryoutsLabel).toBeNull();
    expect(result.current.registrationLabel).toBeNull();
    expect(result.current.seasonId).toBeNull();
  });

  it('should return status after loading', async () => {
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
    expect(result.current).toHaveProperty('isTryoutsOpen');
    expect(result.current).toHaveProperty('tryoutsLabel');
    expect(result.current).toHaveProperty('isRegistrationOpen');
    expect(result.current).toHaveProperty('registrationLabel');
    expect(result.current).toHaveProperty('seasonId');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('refetch');
    // Backward compatibility
    expect(result.current).toHaveProperty('isOpen');
    expect(result.current).toHaveProperty('label');
  });

  it('should default to closed when no active season found', async () => {
    const { result } = renderHook(() => useRegistrationStatus());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // When no season is found, both should be closed
    expect(result.current.isTryoutsOpen).toBe(false);
    expect(result.current.isRegistrationOpen).toBe(false);
  });
});

describe('useRegistrationStatus - with mocked data', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return tryouts open when season has tryouts_open true', async () => {
    const mockSeasonData = {
      id: 'test-season-id',
      name: '2025-26 Winter',
      tryouts_open: true,
      tryouts_label: "Winter '25-26 Tryouts",
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

    expect(result.current.isTryoutsOpen).toBe(true);
    expect(result.current.tryoutsLabel).toBe("Winter '25-26 Tryouts");
    expect(result.current.isRegistrationOpen).toBe(false);
    expect(result.current.seasonId).toBe('test-season-id');
  });

  it('should return registration open when season has registration_open true', async () => {
    const mockSeasonData = {
      id: 'test-season-id',
      name: '2025-26 Winter',
      tryouts_open: false,
      tryouts_label: null,
      registration_open: true,
      registration_label: "Fall/Winter '25-26",
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

    expect(result.current.isTryoutsOpen).toBe(false);
    expect(result.current.isRegistrationOpen).toBe(true);
    expect(result.current.registrationLabel).toBe("Fall/Winter '25-26");
  });

  it('should return both open when both are true', async () => {
    const mockSeasonData = {
      id: 'test-season-id',
      name: '2025-26 Winter',
      tryouts_open: true,
      tryouts_label: "Winter Tryouts",
      registration_open: true,
      registration_label: "Fall/Winter '25-26",
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

    expect(result.current.isTryoutsOpen).toBe(true);
    expect(result.current.isRegistrationOpen).toBe(true);
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
    expect(result.current.isTryoutsOpen).toBe(false);
    expect(result.current.isRegistrationOpen).toBe(false);
  });

  it('should use season name as fallback when labels are empty', async () => {
    const mockSeasonData = {
      id: 'test-season-id',
      name: '2025-26 Winter',
      tryouts_open: true,
      tryouts_label: null,
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

    expect(result.current.tryoutsLabel).toBe('2025-26 Winter');
    expect(result.current.registrationLabel).toBe('2025-26 Winter');
  });

  it('should maintain backward compatibility with isOpen and label aliases', async () => {
    const mockSeasonData = {
      id: 'test-season-id',
      name: '2025-26 Winter',
      tryouts_open: false,
      tryouts_label: null,
      registration_open: true,
      registration_label: "Fall/Winter '25-26",
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

    // isOpen should alias isRegistrationOpen
    expect(result.current.isOpen).toBe(result.current.isRegistrationOpen);
    // label should alias registrationLabel
    expect(result.current.label).toBe(result.current.registrationLabel);
  });
});
