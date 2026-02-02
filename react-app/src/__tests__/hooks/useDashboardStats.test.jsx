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

import { useDashboardStats } from '../../hooks/useDashboardStats';

// Sample data
const mockDashboardData = {
  stats: {
    teams: 5,
    players: 25,
    registrations: 10,
    pendingRegistrations: 3,
    pendingPayments: 2,
    tryoutSignups: 12,
  },
  recentActivity: [
    { id: '1', player_first_name: 'John', player_last_name: 'Doe', status: 'pending', created_at: '2025-01-20' },
    { id: '2', player_first_name: 'Jane', player_last_name: 'Smith', status: 'approved', created_at: '2025-01-19' },
  ],
  upcomingEvents: [
    { id: '1', title: 'Practice', event_type: 'practice', date: '2025-01-26', start_time: '10:00', location: 'Gym' },
    { id: '2', title: 'Game', event_type: 'game', date: '2025-01-27', start_time: '14:00', location: 'Court A' },
  ],
};

describe('useDashboardStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue(mockDashboardData);
  });

  it('should start with loading state', () => {
    api.get.mockReturnValue(new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useDashboardStats());

    expect(result.current.loading).toBe(true);
    expect(result.current.stats.teams).toBe(0);
  });

  it('should fetch all stats from API', async () => {
    const { result } = renderHook(() => useDashboardStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Stats should be populated
    expect(result.current.stats.teams).toBe(5);
    expect(result.current.stats.players).toBe(25);
    expect(result.current.stats.registrations).toBe(10);
    expect(api.get).toHaveBeenCalledWith('/admin/dashboard');
  });

  it('should return recent activity', async () => {
    const { result } = renderHook(() => useDashboardStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.recentActivity).toEqual(mockDashboardData.recentActivity);
  });

  it('should return upcoming events', async () => {
    const { result } = renderHook(() => useDashboardStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.upcomingEvents).toEqual(mockDashboardData.upcomingEvents);
  });

  it('should handle errors gracefully', async () => {
    api.get.mockRejectedValue(new Error('Database connection failed'));

    const { result } = renderHook(() => useDashboardStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Database connection failed');
  });

  it('should provide refetch function', async () => {
    const { result } = renderHook(() => useDashboardStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe('function');
  });

  it('should refetch stats when refetch is called', async () => {
    const { result } = renderHook(() => useDashboardStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const initialCallCount = api.get.mock.calls.length;

    await act(async () => {
      await result.current.refetch();
    });

    expect(api.get.mock.calls.length).toBeGreaterThan(initialCallCount);
  });

  it('should have correct initial stats structure', () => {
    api.get.mockReturnValue(new Promise(() => {})); // Never resolves

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
