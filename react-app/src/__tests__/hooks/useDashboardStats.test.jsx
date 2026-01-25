import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

// Setup mock before importing the hook
const mockFrom = vi.fn();

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: (...args) => mockFrom(...args),
  },
}));

import { useDashboardStats } from '../../hooks/useDashboardStats';

// Helper to create count query mock
const createCountMock = (count, error = null) => ({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockResolvedValue({ data: [], error, count }),
});

// Sample data
const mockRecentActivity = [
  { id: '1', player_first_name: 'John', player_last_name: 'Doe', status: 'pending', created_at: '2025-01-20' },
  { id: '2', player_first_name: 'Jane', player_last_name: 'Smith', status: 'approved', created_at: '2025-01-19' },
];

const mockUpcomingEvents = [
  { id: '1', title: 'Practice', event_type: 'practice', date: '2025-01-26', start_time: '10:00', location: 'Gym' },
  { id: '2', title: 'Game', event_type: 'game', date: '2025-01-27', start_time: '14:00', location: 'Court A' },
];

describe('useDashboardStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should start with loading state', () => {
    mockFrom.mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnValue(new Promise(() => {})), // Never resolves
    }));

    const { result } = renderHook(() => useDashboardStats());

    expect(result.current.loading).toBe(true);
    expect(result.current.stats.teams).toBe(0);
  });

  it('should fetch all stats in parallel', async () => {
    mockFrom.mockImplementation((table) => {
      const mock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn(),
      };

      switch (table) {
        case 'teams':
          mock.select.mockReturnValue({
            eq: vi.fn().mockResolvedValue({ count: 5, error: null }),
          });
          return mock;
        case 'players':
          mock.select.mockResolvedValue({ count: 25, error: null });
          return mock;
        case 'registrations':
          mock.select.mockReturnValue({
            eq: vi.fn().mockResolvedValue({ count: 3, error: null }),
          });
          mock.order = vi.fn().mockReturnThis();
          mock.limit = vi.fn().mockResolvedValue({ data: mockRecentActivity, error: null });
          return mock;
        case 'team_roster':
          mock.select.mockReturnValue({
            eq: vi.fn().mockResolvedValue({ count: 8, error: null }),
          });
          return mock;
        case 'tryout_signups':
          mock.select.mockReturnValue({
            eq: vi.fn().mockResolvedValue({ count: 12, error: null }),
          });
          return mock;
        case 'events':
          mock.select.mockReturnThis();
          mock.gte.mockReturnThis();
          mock.eq.mockReturnThis();
          mock.order.mockReturnThis();
          mock.limit.mockResolvedValue({ data: mockUpcomingEvents, error: null });
          return mock;
        default:
          return createCountMock(0);
      }
    });

    const { result } = renderHook(() => useDashboardStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Stats should be populated
    expect(result.current.stats).toHaveProperty('teams');
    expect(result.current.stats).toHaveProperty('players');
    expect(result.current.stats).toHaveProperty('registrations');
  });

  it('should return recent activity', async () => {
    mockFrom.mockImplementation((table) => {
      if (table === 'registrations') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ count: 10, error: null }),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({ data: mockRecentActivity, error: null }),
        };
      }
      return createCountMock(0);
    });

    const { result } = renderHook(() => useDashboardStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.recentActivity).toEqual(mockRecentActivity);
  });

  it('should return upcoming events', async () => {
    mockFrom.mockImplementation((table) => {
      if (table === 'events') {
        return {
          select: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({ data: mockUpcomingEvents, error: null }),
        };
      }
      return createCountMock(0);
    });

    const { result } = renderHook(() => useDashboardStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.upcomingEvents).toEqual(mockUpcomingEvents);
  });

  it('should handle errors gracefully', async () => {
    mockFrom.mockImplementation(() => {
      throw new Error('Database connection failed');
    });

    const { result } = renderHook(() => useDashboardStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Database connection failed');
  });

  it('should provide refetch function', async () => {
    mockFrom.mockImplementation(() => createCountMock(0));

    const { result } = renderHook(() => useDashboardStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe('function');
  });

  it('should refetch stats when refetch is called', async () => {
    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      return createCountMock(callCount);
    });

    const { result } = renderHook(() => useDashboardStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const initialCallCount = callCount;

    await act(async () => {
      await result.current.refetch();
    });

    expect(callCount).toBeGreaterThan(initialCallCount);
  });

  it('should have correct initial stats structure', async () => {
    mockFrom.mockImplementation(() => createCountMock(0));

    const { result } = renderHook(() => useDashboardStats());

    expect(result.current.stats).toEqual({
      teams: 0,
      players: 0,
      registrations: 0,
      pendingRegistrations: 0,
      pendingPayments: 0,
      tryoutSignups: 0,
    });
  });
});
