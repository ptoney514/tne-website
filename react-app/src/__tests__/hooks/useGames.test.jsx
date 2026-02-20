import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { api } from '../../lib/api-client';
import { SeasonProvider } from '../../contexts/SeasonContext';

// Mock api-client
vi.mock('../../lib/api-client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { useGames, usePublicGames } from '../../hooks/useGames';

// Sample test data
const mockGames = [
  {
    id: 'game-1',
    type: 'tournament',
    name: 'Tournament A',
    date: '2025-02-01',
    start_time: '10:00',
    game_type: 'tournament',
    location: 'Sports Complex',
    game_teams: [
      { id: 'gt-1', team_id: 'team-1', opponent: 'Team X', team: { id: 'team-1', name: '5th Grade Elite' } },
    ],
    teams_count: 1,
    assigned_teams: [{ id: 'team-1', name: '5th Grade Elite' }],
  },
  {
    id: 'game-2',
    type: 'game',
    name: 'Regular Game',
    date: '2025-02-05',
    start_time: '14:00',
    game_type: 'game',
    location: 'Home Gym',
    game_teams: [],
    teams_count: 0,
    assigned_teams: [],
  },
];

const mockSeasons = [
  { id: 'season-1', name: '2025-26 Winter', is_active: true },
];

// Wrapper with SeasonProvider
const wrapper = ({ children }) => (
  <SeasonProvider>{children}</SeasonProvider>
);

describe('useGames', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockImplementation((path) => {
      if (path.includes('/public/seasons')) return Promise.resolve(mockSeasons);
      if (path.includes('/admin/games')) return Promise.resolve(mockGames);
      return Promise.resolve([]);
    });
  });

  it('should start with loading state', () => {
    api.get.mockReturnValue(new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useGames(), { wrapper });

    expect(result.current.loading).toBe(true);
    expect(result.current.games).toEqual([]);
  });

  it('should fetch games with team assignments', async () => {
    const { result } = renderHook(() => useGames(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.games).toHaveLength(2);
    expect(result.current.games[0].teams_count).toBe(1);
    expect(result.current.games[0].assigned_teams).toHaveLength(1);
  });

  it('should handle fetch error', async () => {
    api.get.mockImplementation((path) => {
      if (path.includes('/public/seasons')) return Promise.resolve(mockSeasons);
      return Promise.reject(new Error('Database error'));
    });

    const { result } = renderHook(() => useGames(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Database error');
  });

  it('should create a game', async () => {
    const newGame = { id: 'game-3', name: 'New Tournament', date: '2025-03-01' };
    api.post.mockResolvedValue(newGame);

    const { result } = renderHook(() => useGames(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const created = await result.current.createGame({ name: 'New Tournament', date: '2025-03-01' });
      expect(created).toMatchObject(newGame);
    });

    expect(api.post).toHaveBeenCalledWith(
      '/admin/games',
      expect.objectContaining({
        name: 'New Tournament',
        date: '2025-03-01',
        seasonId: 'season-1',
        gameType: 'tournament',
      })
    );
  });

  it('should update a game', async () => {
    const updatedGame = { ...mockGames[0], name: 'Updated Tournament' };
    api.patch.mockResolvedValue(updatedGame);

    const { result } = renderHook(() => useGames(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const updated = await result.current.updateGame('game-1', { name: 'Updated Tournament' });
      expect(updated.name).toBe('Updated Tournament');
    });

    expect(api.patch).toHaveBeenCalledWith(
      '/admin/games?id=game-1',
      expect.objectContaining({ name: 'Updated Tournament', seasonId: 'season-1' })
    );
  });

  it('should delete a game', async () => {
    api.delete.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useGames(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.deleteGame('game-1');
    });

    expect(api.delete).toHaveBeenCalledWith('/admin/games?id=game-1');
  });

  it('should assign teams to game', async () => {
    api.patch.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useGames(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.assignTeams('game-1', ['team-1', 'team-2']);
    });

    expect(api.patch).toHaveBeenCalledWith('/admin/games?id=game-1', { teamIds: ['team-1', 'team-2'] });
  });

  it('should provide refetch function', async () => {
    const { result } = renderHook(() => useGames(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe('function');
  });
});

describe('usePublicGames', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue(mockGames);
  });

  it('should fetch upcoming games', async () => {
    const { result } = renderHook(() => usePublicGames());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.games).toHaveLength(2);
    expect(api.get).toHaveBeenCalledWith('/public/schedule');
  });

  it('should handle error', async () => {
    api.get.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => usePublicGames());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.games).toEqual([]);
  });

  it('should provide refetch function', async () => {
    const { result } = renderHook(() => usePublicGames());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe('function');
  });
});
