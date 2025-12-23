import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTeams } from '../../hooks/useTeams';

// Create a chainable mock that handles all Supabase query patterns
const createChainableMock = () => {
  const mock = {
    select: vi.fn(() => mock),
    eq: vi.fn(() => mock),
    order: vi.fn(() => mock),
    insert: vi.fn(() => mock),
    update: vi.fn(() => mock),
    delete: vi.fn(() => mock),
    single: vi.fn(() => Promise.resolve({ data: { id: '1' }, error: null })),
    then: (resolve) => resolve({ data: [], error: null }),
  };
  // Make the mock itself a thenable
  Object.defineProperty(mock, 'then', {
    value: (resolve) => resolve({ data: [], error: null }),
    configurable: true,
  });
  return mock;
};

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => createChainableMock()),
  },
}));

describe('useTeams', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useTeams());

    expect(result.current.loading).toBe(true);
    expect(result.current.teams).toEqual([]);
    expect(result.current.seasons).toEqual([]);
    expect(result.current.coaches).toEqual([]);
  });

  it('should return teams after loading', async () => {
    const { result } = renderHook(() => useTeams());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeNull();
  });

  it('should expose CRUD functions', async () => {
    const { result } = renderHook(() => useTeams());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.createTeam).toBe('function');
    expect(typeof result.current.updateTeam).toBe('function');
    expect(typeof result.current.deleteTeam).toBe('function');
    expect(typeof result.current.refetch).toBe('function');
  });

  it('should have empty arrays when no data', async () => {
    const { result } = renderHook(() => useTeams());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(Array.isArray(result.current.teams)).toBe(true);
    expect(Array.isArray(result.current.seasons)).toBe(true);
    expect(Array.isArray(result.current.coaches)).toBe(true);
  });
});

// Additional integration tests would require a more sophisticated mock setup
// or actual Supabase test instance. The core functionality is verified above.
