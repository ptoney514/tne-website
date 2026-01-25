import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

// Setup mock before importing the hook
const mockFrom = vi.fn();

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: (...args) => mockFrom(...args),
  },
}));

import { useTeams } from '../../hooks/useTeams';

// Helper to create chainable mock
const createChainableMock = (data = [], error = null) => {
  const mock = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    single: vi.fn().mockResolvedValue({ data: data[0] || null, error }),
  };
  // Make all methods chainable by returning mock
  mock.select.mockReturnValue(mock);
  mock.eq.mockReturnValue(mock);
  // order() is often the terminal method, so it returns the promise
  mock.order.mockResolvedValue({ data, error });
  return mock;
};

// Sample test data
const mockTeams = [
  {
    id: 'team-1',
    name: '5th Grade Boys Elite',
    grade_level: '5th',
    gender: 'male',
    season: { id: 'season-1', name: '2025-26 Winter' },
    head_coach: { id: 'coach-1', first_name: 'John', last_name: 'Smith' },
    assistant_coach: null,
  },
  {
    id: 'team-2',
    name: '6th Grade Boys Elite',
    grade_level: '6th',
    gender: 'male',
    season: { id: 'season-1', name: '2025-26 Winter' },
    head_coach: null,
    assistant_coach: null,
  },
];

const mockSeasons = [
  { id: 'season-1', name: '2025-26 Winter', start_date: '2025-11-01' },
  { id: 'season-2', name: '2025 Spring', start_date: '2025-03-01' },
];

const mockCoaches = [
  { id: 'coach-1', first_name: 'John', last_name: 'Smith', is_active: true },
  { id: 'coach-2', first_name: 'Jane', last_name: 'Doe', is_active: true },
];

const mockRosterCounts = [
  { team_id: 'team-1' },
  { team_id: 'team-1' },
  { team_id: 'team-1' },
  { team_id: 'team-2' },
];

describe('useTeams', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should start with loading state', () => {
    // Setup mocks that never resolve immediately
    mockFrom.mockImplementation(() => createChainableMock([]));

    const { result } = renderHook(() => useTeams());

    expect(result.current.loading).toBe(true);
    expect(result.current.teams).toEqual([]);
  });

  it('should fetch teams with relationships and player counts', async () => {
    // Setup mocks for each table query
    mockFrom.mockImplementation((table) => {
      switch (table) {
        case 'teams': {
          const mock = createChainableMock(mockTeams);
          return mock;
        }
        case 'team_roster': {
          // team_roster uses .select().eq().then resolves with data
          const mock = {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: mockRosterCounts, error: null }),
            }),
          };
          return mock;
        }
        case 'seasons':
          return createChainableMock(mockSeasons);
        case 'coaches':
          return createChainableMock(mockCoaches);
        default:
          return createChainableMock([]);
      }
    });

    const { result } = renderHook(() => useTeams());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.teams).toHaveLength(2);
    expect(result.current.teams[0].player_count).toBe(3); // team-1 has 3 roster entries
    expect(result.current.teams[1].player_count).toBe(1); // team-2 has 1 roster entry
  });

  it('should fetch seasons', async () => {
    mockFrom.mockImplementation((table) => {
      if (table === 'seasons') {
        return createChainableMock(mockSeasons);
      }
      return createChainableMock([]);
    });

    const { result } = renderHook(() => useTeams());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.seasons).toHaveLength(2);
    expect(result.current.seasons[0].name).toBe('2025-26 Winter');
  });

  it('should fetch coaches', async () => {
    mockFrom.mockImplementation((table) => {
      if (table === 'coaches') {
        return createChainableMock(mockCoaches);
      }
      return createChainableMock([]);
    });

    const { result } = renderHook(() => useTeams());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.coaches).toHaveLength(2);
  });

  it('should handle fetch error', async () => {
    const errorMessage = 'Database connection failed';
    mockFrom.mockImplementation(() =>
      createChainableMock([], { message: errorMessage })
    );

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
      grade_level: '7th',
      gender: 'male',
    };

    mockFrom.mockImplementation((table) => {
      if (table === 'teams') {
        const mock = createChainableMock([newTeam]);
        mock.insert = vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: newTeam, error: null }),
          }),
        });
        return mock;
      }
      return createChainableMock([]);
    });

    const { result } = renderHook(() => useTeams());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const created = await result.current.createTeam(newTeam);
      expect(created).toEqual(newTeam);
    });
  });

  it('should update a team', async () => {
    const updatedTeam = { ...mockTeams[0], name: 'Updated Team Name' };

    mockFrom.mockImplementation((table) => {
      if (table === 'teams') {
        const mock = createChainableMock(mockTeams);
        mock.update = vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: updatedTeam, error: null }),
            }),
          }),
        });
        return mock;
      }
      return createChainableMock([]);
    });

    const { result } = renderHook(() => useTeams());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const updated = await result.current.updateTeam('team-1', { name: 'Updated Team Name' });
      expect(updated).toEqual(updatedTeam);
    });
  });

  it('should delete a team', async () => {
    mockFrom.mockImplementation((table) => {
      if (table === 'teams') {
        const mock = createChainableMock(mockTeams);
        mock.delete = vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        });
        return mock;
      }
      return createChainableMock([]);
    });

    const { result } = renderHook(() => useTeams());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.deleteTeam('team-1');
    });

    // Should have called delete
    expect(mockFrom).toHaveBeenCalledWith('teams');
  });

  it('should throw error on create failure', async () => {
    const errorMessage = 'Insert failed';
    mockFrom.mockImplementation((table) => {
      if (table === 'teams') {
        const mock = createChainableMock([]);
        mock.insert = vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: errorMessage } }),
          }),
        });
        return mock;
      }
      return createChainableMock([]);
    });

    const { result } = renderHook(() => useTeams());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await expect(
      act(async () => {
        await result.current.createTeam({ name: 'Test' });
      })
    ).rejects.toEqual({ message: errorMessage });
  });

  it('should provide refetch function', async () => {
    mockFrom.mockImplementation(() => createChainableMock([]));

    const { result } = renderHook(() => useTeams());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe('function');
  });
});
