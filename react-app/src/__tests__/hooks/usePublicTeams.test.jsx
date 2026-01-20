import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { usePublicTeams } from '../../hooks/usePublicTeams';

// Mock team data
const mockTeams = [
  {
    id: '1',
    name: 'Express United 4th - Foster',
    grade_level: '4th',
    gender: 'male',
    tier: 'express',
    practice_location: 'Monroe MS',
    practice_days: 'Tue/Thu',
    practice_time: '6:00 PM',
    head_coach: { id: 'c1', first_name: 'Coach', last_name: 'Foster' },
    player_count: 12,
  },
  {
    id: '2',
    name: 'Express United 5th - Mitchell',
    grade_level: '5th',
    gender: 'male',
    tier: 'express',
    practice_location: 'Central HS',
    practice_days: 'Mon/Wed',
    practice_time: '5:30 PM',
    head_coach: { id: 'c2', first_name: 'Coach', last_name: 'Mitchell' },
    player_count: 10,
  },
];

const mockActiveSeason = { id: 'season-1', name: '2024-25 Winter' };

// Create a chainable mock that handles all Supabase query patterns
const createChainableMock = (resolveValue = { data: [], error: null }) => {
  const mock = {
    select: vi.fn(() => mock),
    eq: vi.fn(() => mock),
    in: vi.fn(() => mock),
    order: vi.fn(() => mock),
    limit: vi.fn(() => mock),
    single: vi.fn(() => Promise.resolve(resolveValue)),
    then: (resolve) => resolve(resolveValue),
  };
  Object.defineProperty(mock, 'then', {
    value: (resolve) => resolve(resolveValue),
    configurable: true,
  });
  return mock;
};

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    _getStore: () => store,
    _setStore: (newStore) => { store = newStore; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock supabase module
const mockSupabaseFrom = vi.fn();

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: (...args) => mockSupabaseFrom(...args),
  },
  withTimeout: (promise) => promise,
}));

describe('usePublicTeams', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Cache miss scenarios', () => {
    it('should show loading state and fetch from Supabase when no cache exists', async () => {
      // Setup mocks for fresh fetch
      mockSupabaseFrom.mockImplementation((table) => {
        if (table === 'seasons') {
          return createChainableMock({ data: mockActiveSeason, error: null });
        }
        if (table === 'teams') {
          return createChainableMock({ data: mockTeams, error: null });
        }
        if (table === 'team_roster') {
          return createChainableMock({ data: [], error: null });
        }
        return createChainableMock();
      });

      const { result } = renderHook(() => usePublicTeams());

      // Initially loading
      expect(result.current.loading).toBe(true);
      expect(result.current.teams).toEqual([]);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should have fetched and saved to cache
      expect(localStorageMock.setItem).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Loaded'));
    });

    it('should return empty teams when no active season exists', async () => {
      mockSupabaseFrom.mockImplementation((table) => {
        if (table === 'seasons') {
          return createChainableMock({ data: null, error: null });
        }
        return createChainableMock();
      });

      const { result } = renderHook(() => usePublicTeams());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.teams).toEqual([]);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Cache hit scenarios', () => {
    it('should serve cached data immediately when valid cache exists', async () => {
      // Setup valid cache
      const validCache = {
        data: mockTeams,
        timestamp: Date.now(),
        version: '2025-01-01T00:00:00Z',
        seasonId: 'season-1',
      };
      localStorageMock._setStore({
        tne_teams_cache: JSON.stringify(validCache),
      });

      // Mock version check to return same version
      mockSupabaseFrom.mockImplementation((table) => {
        if (table === 'teams') {
          return createChainableMock({ data: { updated_at: '2025-01-01T00:00:00Z' }, error: null });
        }
        return createChainableMock();
      });

      const { result } = renderHook(() => usePublicTeams());

      // Should immediately have teams from cache, not loading
      await waitFor(() => {
        expect(result.current.teams.length).toBe(2);
        expect(result.current.loading).toBe(false);
      });

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('from cache'));
    });

    it('should not refetch when cache is valid and version unchanged', async () => {
      const validCache = {
        data: mockTeams,
        timestamp: Date.now(),
        version: '2025-01-01T00:00:00Z',
        seasonId: 'season-1',
      };
      localStorageMock._setStore({
        tne_teams_cache: JSON.stringify(validCache),
      });

      mockSupabaseFrom.mockImplementation((table) => {
        if (table === 'teams') {
          return createChainableMock({ data: { updated_at: '2025-01-01T00:00:00Z' }, error: null });
        }
        return createChainableMock();
      });

      const { result } = renderHook(() => usePublicTeams());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('no refresh needed'));
    });
  });

  describe('Cache expiration scenarios', () => {
    it('should background refresh when cache is expired', async () => {
      // Setup expired cache (over 1 hour old)
      const expiredCache = {
        data: mockTeams,
        timestamp: Date.now() - (2 * 60 * 60 * 1000), // 2 hours ago
        version: '2025-01-01T00:00:00Z',
        seasonId: 'season-1',
      };
      localStorageMock._setStore({
        tne_teams_cache: JSON.stringify(expiredCache),
      });

      // Mock fresh fetch
      mockSupabaseFrom.mockImplementation((table) => {
        if (table === 'seasons') {
          return createChainableMock({ data: mockActiveSeason, error: null });
        }
        if (table === 'teams') {
          const mock = createChainableMock({ data: mockTeams, error: null });
          // Override for version check
          mock.single = vi.fn(() => Promise.resolve({ data: { updated_at: '2025-01-02T00:00:00Z' }, error: null }));
          return mock;
        }
        if (table === 'team_roster') {
          return createChainableMock({ data: [], error: null });
        }
        return createChainableMock();
      });

      const { result } = renderHook(() => usePublicTeams());

      // Should show cached data immediately
      await waitFor(() => {
        expect(result.current.teams.length).toBe(2);
      });

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('expired'));
    });
  });

  describe('Version invalidation scenarios', () => {
    it('should refresh when database version changes', async () => {
      const validCache = {
        data: mockTeams,
        timestamp: Date.now(),
        version: '2025-01-01T00:00:00Z',
        seasonId: 'season-1',
      };
      localStorageMock._setStore({
        tne_teams_cache: JSON.stringify(validCache),
      });

      // Mock with newer version
      mockSupabaseFrom.mockImplementation((table) => {
        if (table === 'seasons') {
          return createChainableMock({ data: mockActiveSeason, error: null });
        }
        if (table === 'teams') {
          const mock = createChainableMock({ data: mockTeams, error: null });
          mock.single = vi.fn(() => Promise.resolve({ data: { updated_at: '2025-01-02T00:00:00Z' }, error: null }));
          return mock;
        }
        if (table === 'team_roster') {
          return createChainableMock({ data: [], error: null });
        }
        return createChainableMock();
      });

      const { result } = renderHook(() => usePublicTeams());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Version changed'));
    });
  });

  describe('Error handling scenarios', () => {
    it('should show cached data when network error occurs', async () => {
      // Setup valid cache
      const validCache = {
        data: mockTeams,
        timestamp: Date.now() - (2 * 60 * 60 * 1000), // Expired so it will try to refresh
        version: '2025-01-01T00:00:00Z',
        seasonId: 'season-1',
      };
      localStorageMock._setStore({
        tne_teams_cache: JSON.stringify(validCache),
      });

      // Mock network error
      mockSupabaseFrom.mockImplementation((table) => {
        if (table === 'seasons') {
          return createChainableMock({ data: null, error: { message: 'Network error' } });
        }
        if (table === 'teams') {
          return createChainableMock({ data: { updated_at: '2025-01-01T00:00:00Z' }, error: null });
        }
        return createChainableMock();
      });

      const { result } = renderHook(() => usePublicTeams());

      await waitFor(() => {
        // Should still have cached teams visible
        expect(result.current.teams.length).toBe(2);
      });
    });

    it('should handle corrupted cache gracefully', async () => {
      // Setup corrupted cache
      localStorageMock._setStore({
        tne_teams_cache: 'invalid-json{{{',
      });

      // Mock fresh fetch
      mockSupabaseFrom.mockImplementation((table) => {
        if (table === 'seasons') {
          return createChainableMock({ data: mockActiveSeason, error: null });
        }
        if (table === 'teams') {
          return createChainableMock({ data: mockTeams, error: null });
        }
        if (table === 'team_roster') {
          return createChainableMock({ data: [], error: null });
        }
        return createChainableMock();
      });

      const { result } = renderHook(() => usePublicTeams());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should have cleared corrupted cache and fetched fresh data
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('tne_teams_cache');
    });
  });

  describe('Refetch functionality', () => {
    it('should expose refetch function', async () => {
      mockSupabaseFrom.mockImplementation((table) => {
        if (table === 'seasons') {
          return createChainableMock({ data: mockActiveSeason, error: null });
        }
        if (table === 'teams') {
          return createChainableMock({ data: mockTeams, error: null });
        }
        if (table === 'team_roster') {
          return createChainableMock({ data: [], error: null });
        }
        return createChainableMock();
      });

      const { result } = renderHook(() => usePublicTeams());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(typeof result.current.refetch).toBe('function');
    });

    it('should force refresh when refetch is called with true', async () => {
      // Setup valid cache
      const validCache = {
        data: mockTeams,
        timestamp: Date.now(),
        version: '2025-01-01T00:00:00Z',
        seasonId: 'season-1',
      };
      localStorageMock._setStore({
        tne_teams_cache: JSON.stringify(validCache),
      });

      mockSupabaseFrom.mockImplementation((table) => {
        if (table === 'seasons') {
          return createChainableMock({ data: mockActiveSeason, error: null });
        }
        if (table === 'teams') {
          return createChainableMock({ data: mockTeams, error: null });
        }
        if (table === 'team_roster') {
          return createChainableMock({ data: [], error: null });
        }
        return createChainableMock();
      });

      const { result } = renderHook(() => usePublicTeams());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Call refetch with force refresh
      await act(async () => {
        await result.current.refetch(true);
      });

      // Should have fetched from Supabase
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('from Supabase'));
    });
  });

  describe('Initial state', () => {
    it('should initialize with correct default values', () => {
      mockSupabaseFrom.mockImplementation(() => createChainableMock());

      const { result } = renderHook(() => usePublicTeams());

      expect(result.current.teams).toEqual([]);
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.refetch).toBe('function');
    });
  });
});
