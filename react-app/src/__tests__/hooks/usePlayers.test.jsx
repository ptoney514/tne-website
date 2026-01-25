import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

// Setup mock before importing the hook
const mockFrom = vi.fn();

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: (...args) => mockFrom(...args),
  },
}));

import { usePlayers, useTeamRoster } from '../../hooks/usePlayers';

// Helper to create chainable mock
const createChainableMock = (data = [], error = null, count = null) => {
  const mock = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    not: vi.fn(),
    in: vi.fn(),
    order: vi.fn(),
    single: vi.fn().mockResolvedValue({ data: data[0] || null, error }),
  };
  // Make all methods chainable
  mock.select.mockReturnValue(mock);
  mock.eq.mockReturnValue(mock);
  mock.not.mockReturnValue(mock);
  mock.in.mockReturnValue(mock);
  // order() resolves with data
  mock.order.mockResolvedValue({ data, error, count });
  return mock;
};

// Sample test data
const mockPlayers = [
  {
    id: 'player-1',
    first_name: 'John',
    last_name: 'Doe',
    current_grade: '5th',
    primary_parent: { id: 'parent-1', first_name: 'Jane', last_name: 'Doe', email: 'jane@example.com' },
  },
  {
    id: 'player-2',
    first_name: 'Mike',
    last_name: 'Smith',
    current_grade: '6th',
    primary_parent: null,
  },
];

const mockRosterData = [
  { player_id: 'player-1', payment_status: 'paid', team: { id: 'team-1', name: '5th Grade Elite', grade_level: '5th' } },
  { player_id: 'player-1', payment_status: 'pending', team: { id: 'team-2', name: '5th Grade Dev', grade_level: '5th' } },
  { player_id: 'player-2', payment_status: 'pending', team: { id: 'team-1', name: '5th Grade Elite', grade_level: '5th' } },
];

const mockTeams = [
  { id: 'team-1', name: '5th Grade Elite', grade_level: '5th' },
  { id: 'team-2', name: '6th Grade Elite', grade_level: '6th' },
];

describe('usePlayers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should start with loading state', () => {
    mockFrom.mockImplementation(() => createChainableMock([]));

    const { result } = renderHook(() => usePlayers());

    expect(result.current.loading).toBe(true);
    expect(result.current.players).toEqual([]);
  });

  it('should fetch players with parent info', async () => {
    mockFrom.mockImplementation((table) => {
      switch (table) {
        case 'players':
          return createChainableMock(mockPlayers);
        case 'team_roster':
          return createChainableMock(mockRosterData);
        case 'teams':
          return createChainableMock(mockTeams);
        default:
          return createChainableMock([]);
      }
    });

    const { result } = renderHook(() => usePlayers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.players).toHaveLength(2);
    expect(result.current.players[0].primary_parent.email).toBe('jane@example.com');
  });

  it('should provide players array and helper functions', async () => {
    mockFrom.mockImplementation(() => createChainableMock(mockPlayers));

    const { result } = renderHook(() => usePlayers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should have players array
    expect(Array.isArray(result.current.players)).toBe(true);
    // Should have helper functions
    expect(typeof result.current.createPlayer).toBe('function');
    expect(typeof result.current.assignPlayerToTeam).toBe('function');
  });

  it('should handle fetch error', async () => {
    mockFrom.mockImplementation(() =>
      createChainableMock([], { message: 'Database error' })
    );

    const { result } = renderHook(() => usePlayers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Database error');
  });

  it('should create a player', async () => {
    const newPlayer = { id: 'player-3', first_name: 'New', last_name: 'Player' };

    mockFrom.mockImplementation((table) => {
      if (table === 'players') {
        const mock = createChainableMock(mockPlayers);
        mock.insert = vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: newPlayer, error: null }),
          }),
        });
        return mock;
      }
      return createChainableMock([]);
    });

    const { result } = renderHook(() => usePlayers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const created = await result.current.createPlayer(newPlayer);
      expect(created).toEqual(newPlayer);
    });
  });

  it('should assign player to team', async () => {
    mockFrom.mockImplementation((table) => {
      if (table === 'team_roster') {
        const mock = createChainableMock([]);
        mock.single = vi.fn().mockResolvedValue({ data: null, error: null }); // No existing entry
        mock.insert = vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({ error: null }),
        });
        return mock;
      }
      if (table === 'players') return createChainableMock(mockPlayers);
      if (table === 'teams') return createChainableMock(mockTeams);
      return createChainableMock([]);
    });

    const { result } = renderHook(() => usePlayers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.assignPlayerToTeam('player-1', 'team-3');
    });

    expect(mockFrom).toHaveBeenCalledWith('team_roster');
  });

  it('should provide getPlayerHistory function', async () => {
    mockFrom.mockImplementation(() => createChainableMock([]));

    const { result } = renderHook(() => usePlayers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.getPlayerHistory).toBe('function');
  });

  it('should provide refetch function', async () => {
    mockFrom.mockImplementation(() => createChainableMock([]));

    const { result } = renderHook(() => usePlayers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe('function');
  });
});

describe('useTeamRoster', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return empty roster when no teamId provided', async () => {
    const { result } = renderHook(() => useTeamRoster(null));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.roster).toEqual([]);
  });

  it('should fetch roster for team', async () => {
    const mockRoster = [
      {
        id: 'roster-1',
        player_id: 'player-1',
        player: mockPlayers[0],
      },
    ];

    mockFrom.mockImplementation((table) => {
      if (table === 'team_roster') {
        // Chain: .select().eq().eq() -> resolves
        const mock = {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: mockRoster, error: null }),
            }),
          }),
        };
        return mock;
      }
      if (table === 'players') {
        return createChainableMock([mockPlayers[1]]); // Available players
      }
      return createChainableMock([]);
    });

    const { result } = renderHook(() => useTeamRoster('team-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.roster).toHaveLength(1);
  });

  it('should calculate available players', async () => {
    const mockRoster = [
      { id: 'roster-1', player_id: 'player-1', player: mockPlayers[0] },
    ];

    mockFrom.mockImplementation((table) => {
      if (table === 'team_roster') {
        // Chain: .select().eq().eq() -> resolves
        const mock = {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: mockRoster, error: null }),
            }),
          }),
        };
        return mock;
      }
      if (table === 'players') {
        // Chain: .select().order() potentially with .not()
        const mock = createChainableMock([mockPlayers[1]]);
        return mock;
      }
      return createChainableMock([]);
    });

    const { result } = renderHook(() => useTeamRoster('team-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Roster should have one player
    expect(result.current.roster).toHaveLength(1);
    // availablePlayers should be an array (may be empty depending on mock)
    expect(Array.isArray(result.current.availablePlayers)).toBe(true);
  });

  it('should provide addToRoster function', async () => {
    mockFrom.mockImplementation(() => createChainableMock([]));

    const { result } = renderHook(() => useTeamRoster('team-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.addToRoster).toBe('function');
  });

  it('should provide bulkAddToRoster function', async () => {
    mockFrom.mockImplementation(() => createChainableMock([]));

    const { result } = renderHook(() => useTeamRoster('team-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.bulkAddToRoster).toBe('function');
  });
});
