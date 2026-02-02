import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { api } from '../../lib/api-client';

// Mock api-client
vi.mock('../../lib/api-client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { usePlayers, useTeamRoster } from '../../hooks/usePlayers';

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

describe('usePlayers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock returns empty arrays
    api.get.mockResolvedValue([]);
    api.post.mockResolvedValue({});
  });

  it('should start with loading state', () => {
    api.get.mockReturnValue(new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => usePlayers());

    expect(result.current.loading).toBe(true);
    expect(result.current.players).toEqual([]);
  });

  it('should fetch players with parent info', async () => {
    api.get.mockResolvedValue(mockPlayers);

    const { result } = renderHook(() => usePlayers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.players).toHaveLength(2);
    expect(result.current.players[0].primary_parent.email).toBe('jane@example.com');
  });

  it('should provide players array and helper functions', async () => {
    api.get.mockResolvedValue(mockPlayers);

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
    api.get.mockRejectedValue(new Error('Database error'));

    const { result } = renderHook(() => usePlayers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Database error');
  });

  it('should create a player', async () => {
    const newPlayer = { id: 'player-3', first_name: 'New', last_name: 'Player' };
    api.get.mockResolvedValue(mockPlayers);
    api.post.mockResolvedValue(newPlayer);

    const { result } = renderHook(() => usePlayers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const created = await result.current.createPlayer(newPlayer);
      expect(created).toEqual(newPlayer);
    });

    expect(api.post).toHaveBeenCalledWith('/admin/players', newPlayer);
  });

  it('should assign player to team', async () => {
    api.get.mockResolvedValue(mockPlayers);
    api.post.mockResolvedValue({ success: true });

    const { result } = renderHook(() => usePlayers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.assignPlayerToTeam('player-1', 'team-3');
    });

    expect(api.post).toHaveBeenCalledWith('/admin/players/player-1/assign', { teamId: 'team-3' });
  });

  it('should provide getPlayerHistory function', async () => {
    api.get.mockResolvedValue([]);

    const { result } = renderHook(() => usePlayers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.getPlayerHistory).toBe('function');
  });

  it('should provide refetch function', async () => {
    api.get.mockResolvedValue([]);

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
    api.get.mockResolvedValue([]);
    api.post.mockResolvedValue({});
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
    api.get.mockResolvedValue(mockRoster);

    const { result } = renderHook(() => useTeamRoster('team-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.roster).toHaveLength(1);
    expect(api.get).toHaveBeenCalledWith('/admin/teams/team-1/roster');
  });

  it('should calculate available players', async () => {
    const mockRoster = [
      { id: 'roster-1', player_id: 'player-1', player: mockPlayers[0] },
    ];
    api.get.mockResolvedValue(mockRoster);

    const { result } = renderHook(() => useTeamRoster('team-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Roster should have one player
    expect(result.current.roster).toHaveLength(1);
    // availablePlayers should be an array
    expect(Array.isArray(result.current.availablePlayers)).toBe(true);
  });

  it('should provide addToRoster function', async () => {
    api.get.mockResolvedValue([]);

    const { result } = renderHook(() => useTeamRoster('team-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.addToRoster).toBe('function');
  });

  it('should provide bulkAddToRoster function', async () => {
    api.get.mockResolvedValue([]);

    const { result } = renderHook(() => useTeamRoster('team-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.bulkAddToRoster).toBe('function');
  });
});
