import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

// Mock SeasonContext
vi.mock('../../contexts/SeasonContext', () => ({
  useSeason: vi.fn(() => ({
    selectedSeason: { id: 'season-1', name: '2025-26 Winter' },
  })),
}));

// Setup mock before importing the hook
const mockFrom = vi.fn();

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: (...args) => mockFrom(...args),
  },
}));

import { useGames, usePublicGames } from '../../hooks/useGames';

// Helper to create chainable mock
const createChainableMock = (data = [], error = null) => {
  // Create a mock that tracks order() call count
  let orderCallCount = 0;
  const mock = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    in: vi.fn(),
    gte: vi.fn(),
    order: vi.fn(),
    single: vi.fn().mockResolvedValue({ data: data[0] || null, error }),
  };
  // Make all methods chainable
  mock.select.mockReturnValue(mock);
  mock.eq.mockReturnValue(mock);
  mock.in.mockReturnValue(mock);
  mock.gte.mockReturnValue(mock);
  // order() - first call returns mock, subsequent calls resolve
  mock.order.mockImplementation(() => {
    orderCallCount++;
    if (orderCallCount >= 2) {
      return Promise.resolve({ data, error });
    }
    return mock;
  });
  return mock;
};

// Sample test data
const mockGames = [
  {
    id: 'game-1',
    name: 'Tournament A',
    date: '2025-02-01',
    start_time: '10:00',
    game_type: 'tournament',
    location: 'Sports Complex',
    game_teams: [
      { id: 'gt-1', team_id: 'team-1', opponent: 'Team X', team: { id: 'team-1', name: '5th Grade Elite' } },
    ],
  },
  {
    id: 'game-2',
    name: 'Regular Game',
    date: '2025-02-05',
    start_time: '14:00',
    game_type: 'league',
    location: 'Home Gym',
    game_teams: [],
  },
];

describe('useGames', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should start with loading state', () => {
    mockFrom.mockImplementation(() => createChainableMock([]));

    const { result } = renderHook(() => useGames());

    expect(result.current.loading).toBe(true);
    expect(result.current.games).toEqual([]);
  });

  it('should fetch games with team assignments', async () => {
    mockFrom.mockImplementation((table) => {
      if (table === 'games') {
        return createChainableMock(mockGames);
      }
      return createChainableMock([]);
    });

    const { result } = renderHook(() => useGames());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.games).toHaveLength(2);
    expect(result.current.games[0].teams_count).toBe(1);
    expect(result.current.games[0].assigned_teams).toHaveLength(1);
  });

  it('should handle fetch error', async () => {
    mockFrom.mockImplementation(() =>
      createChainableMock([], { message: 'Database error' })
    );

    const { result } = renderHook(() => useGames());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Database error');
  });

  it('should create a game', async () => {
    const newGame = { id: 'game-3', name: 'New Tournament', date: '2025-03-01' };

    mockFrom.mockImplementation((table) => {
      if (table === 'games') {
        const mock = createChainableMock(mockGames);
        mock.insert = vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: newGame, error: null }),
          }),
        });
        return mock;
      }
      return createChainableMock([]);
    });

    const { result } = renderHook(() => useGames());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const created = await result.current.createGame({ name: 'New Tournament', date: '2025-03-01' });
      expect(created).toEqual(newGame);
    });
  });

  it('should update a game', async () => {
    const updatedGame = { ...mockGames[0], name: 'Updated Tournament' };

    mockFrom.mockImplementation((table) => {
      if (table === 'games') {
        const mock = createChainableMock(mockGames);
        mock.update = vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: updatedGame, error: null }),
            }),
          }),
        });
        return mock;
      }
      return createChainableMock([]);
    });

    const { result } = renderHook(() => useGames());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const updated = await result.current.updateGame('game-1', { name: 'Updated Tournament' });
      expect(updated.name).toBe('Updated Tournament');
    });
  });

  it('should delete a game', async () => {
    mockFrom.mockImplementation((table) => {
      if (table === 'games') {
        const mock = createChainableMock(mockGames);
        mock.delete = vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        });
        return mock;
      }
      return createChainableMock([]);
    });

    const { result } = renderHook(() => useGames());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.deleteGame('game-1');
    });

    expect(mockFrom).toHaveBeenCalledWith('games');
  });

  it('should assign teams to game', async () => {
    const currentAssignments = [{ team_id: 'team-1' }];

    mockFrom.mockImplementation((table) => {
      if (table === 'game_teams') {
        const mock = createChainableMock([]);
        mock.select = vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: currentAssignments, error: null }),
        });
        mock.insert = vi.fn().mockResolvedValue({ error: null });
        mock.delete = vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({ error: null }),
          }),
        });
        return mock;
      }
      if (table === 'games') {
        return createChainableMock(mockGames);
      }
      return createChainableMock([]);
    });

    const { result } = renderHook(() => useGames());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      // Assign team-1 and team-2 (team-1 already assigned, team-2 is new)
      await result.current.assignTeams('game-1', ['team-1', 'team-2']);
    });

    expect(mockFrom).toHaveBeenCalledWith('game_teams');
  });

  it('should provide refetch function', async () => {
    mockFrom.mockImplementation(() => createChainableMock([]));

    const { result } = renderHook(() => useGames());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe('function');
  });
});

describe('usePublicGames', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch upcoming games', async () => {
    mockFrom.mockImplementation((table) => {
      if (table === 'games') {
        return createChainableMock(mockGames);
      }
      return createChainableMock([]);
    });

    const { result } = renderHook(() => usePublicGames());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.games).toHaveLength(2);
  });

  it('should handle error', async () => {
    mockFrom.mockImplementation(() =>
      createChainableMock([], { message: 'Network error' })
    );

    const { result } = renderHook(() => usePublicGames());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.games).toEqual([]);
  });

  it('should provide refetch function', async () => {
    mockFrom.mockImplementation(() => createChainableMock([]));

    const { result } = renderHook(() => usePublicGames());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe('function');
  });
});
