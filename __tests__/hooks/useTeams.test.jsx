import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

// Setup mock before importing the hook
const { mockApi } = vi.hoisted(() => ({
  mockApi: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('@/lib/api-client', () => ({
  api: mockApi,
}));

// Mock SeasonContext
vi.mock('@/contexts/SeasonContext', () => ({
  useSeason: () => ({
    selectedSeason: { id: 'season-1', name: '2025-26 Winter' },
    seasons: [{ id: 'season-1', name: '2025-26 Winter' }],
  }),
}));

import { useTeams } from '@/hooks/useTeams';

// Sample test data
const mockTeams = [
  {
    id: 'team-1',
    name: '5th Grade Boys Elite',
    gradeLevel: '5th',
    gender: 'male',
    season: { id: 'season-1', name: '2025-26 Winter' },
    headCoach: { id: 'coach-1', firstName: 'John', lastName: 'Smith' },
    assistantCoach: null,
    playerCount: 3,
  },
  {
    id: 'team-2',
    name: '6th Grade Boys Elite',
    gradeLevel: '6th',
    gender: 'male',
    season: { id: 'season-1', name: '2025-26 Winter' },
    headCoach: null,
    assistantCoach: null,
    playerCount: 1,
  },
];

const mockCoaches = [
  { id: 'coach-1', firstName: 'John', lastName: 'Smith', isActive: true },
  { id: 'coach-2', firstName: 'Jane', lastName: 'Doe', isActive: true },
];

describe('useTeams', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementations
    mockApi.get.mockImplementation((url) => {
      if (url.includes('/admin/teams')) return Promise.resolve(mockTeams);
      if (url.includes('/admin/coaches')) return Promise.resolve(mockCoaches);
      return Promise.resolve([]);
    });
    mockApi.post.mockResolvedValue({ id: 'new-team' });
    mockApi.patch.mockResolvedValue({ id: 'team-1' });
    mockApi.delete.mockResolvedValue(undefined);
  });

  it('should start with loading state', () => {
    const { result } = renderHook(() => useTeams());
    expect(result.current.loading).toBe(true);
    expect(result.current.teams).toEqual([]);
  });

  it('should fetch teams with relationships and player counts', async () => {
    const { result } = renderHook(() => useTeams());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.teams).toHaveLength(2);
    expect(result.current.teams[0].playerCount).toBe(3);
    expect(result.current.teams[1].playerCount).toBe(1);
  });

  it('should fetch coaches', async () => {
    const { result } = renderHook(() => useTeams());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.coaches).toHaveLength(2);
  });

  it('should handle fetch error', async () => {
    const errorMessage = 'Database connection failed';
    mockApi.get.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useTeams());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
  });

  it('should create a team', async () => {
    const newTeam = {
      id: 'team-3',
      name: '7th Grade Boys',
      gradeLevel: '7th',
      gender: 'male',
    };

    mockApi.post.mockResolvedValue(newTeam);

    const { result } = renderHook(() => useTeams());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const created = await result.current.createTeam(newTeam);
      expect(created).toEqual(newTeam);
    });

    expect(mockApi.post).toHaveBeenCalledWith('/admin/teams', expect.any(Object));
  });

  it('should update a team', async () => {
    const updatedTeam = { ...mockTeams[0], name: 'Updated Team Name' };
    mockApi.patch.mockResolvedValue(updatedTeam);

    const { result } = renderHook(() => useTeams());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const updated = await result.current.updateTeam('team-1', { name: 'Updated Team Name' });
      expect(updated).toEqual(updatedTeam);
    });

    expect(mockApi.patch).toHaveBeenCalledWith('/admin/teams?id=team-1', expect.any(Object));
  });

  it('should delete a team', async () => {
    const { result } = renderHook(() => useTeams());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.deleteTeam('team-1');
    });

    expect(mockApi.delete).toHaveBeenCalledWith('/admin/teams?id=team-1');
  });

  it('should throw error on create failure', async () => {
    const errorMessage = 'Insert failed';
    mockApi.post.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useTeams());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await expect(
      act(async () => {
        await result.current.createTeam({ name: 'Test' });
      })
    ).rejects.toThrow(errorMessage);
  });

  it('should provide refetch function', async () => {
    const { result } = renderHook(() => useTeams());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe('function');
  });
});
