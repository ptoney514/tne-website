import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { api } from '@/lib/api-client';
import { SeasonProvider } from '@/contexts/SeasonContext';

// Mock api-client
vi.mock('@/lib/api-client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { useRegistrations } from '@/hooks/useRegistrations';

// Sample test data
const mockRegistrations = [
  {
    id: 'reg-1',
    player_first_name: 'John',
    player_last_name: 'Doe',
    player_date_of_birth: '2015-03-15',
    player_gender: 'male',
    player_current_grade: '5th',
    parent_first_name: 'Jane',
    parent_last_name: 'Doe',
    parent_email: 'jane@example.com',
    parent_phone: '555-123-4567',
    status: 'pending',
    payment_status: 'pending',
    team_id: 'team-1',
    team: { id: 'team-1', name: '5th Grade Elite', grade_level: '5th', gender: 'male' },
    created_at: '2025-01-15',
  },
  {
    id: 'reg-2',
    player_first_name: 'Mike',
    player_last_name: 'Smith',
    player_date_of_birth: '2014-06-20',
    player_gender: 'male',
    player_current_grade: '6th',
    parent_first_name: 'Bob',
    parent_last_name: 'Smith',
    parent_email: 'bob@example.com',
    parent_phone: '555-987-6543',
    status: 'approved',
    payment_status: 'paid',
    team_id: 'team-2',
    team: { id: 'team-2', name: '6th Grade Elite', grade_level: '6th', gender: 'male' },
    created_at: '2025-01-10',
  },
];

const mockTeams = [
  { id: 'team-1', name: '5th Grade Elite', grade_level: '5th', gender: 'male' },
  { id: 'team-2', name: '6th Grade Elite', grade_level: '6th', gender: 'male' },
];

const mockSeasons = [
  { id: 'season-1', name: 'Winter 2025', is_active: true },
];

// Wrapper with SeasonProvider
const wrapper = ({ children }) => (
  <SeasonProvider>{children}</SeasonProvider>
);

describe('useRegistrations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock returns for SeasonContext
    api.get.mockImplementation((path) => {
      if (path.includes('/public/seasons')) return Promise.resolve(mockSeasons);
      if (path.includes('/admin/registrations')) return Promise.resolve(mockRegistrations);
      if (path.includes('/admin/teams')) return Promise.resolve(mockTeams);
      return Promise.resolve([]);
    });
  });

  it('should start with loading state', () => {
    api.get.mockReturnValue(new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useRegistrations(), { wrapper });

    expect(result.current.loading).toBe(true);
    expect(result.current.registrations).toEqual([]);
  });

  it('should fetch registrations with team info', async () => {
    const { result } = renderHook(() => useRegistrations(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.registrations).toHaveLength(2);
    expect(result.current.registrations[0].team.name).toBe('5th Grade Elite');
  });

  it('should fetch teams for assignment', async () => {
    const { result } = renderHook(() => useRegistrations(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.teams).toHaveLength(2);
  });

  it('should handle fetch error', async () => {
    api.get.mockImplementation((path) => {
      if (path.includes('/public/seasons')) return Promise.resolve(mockSeasons);
      return Promise.reject(new Error('Database error'));
    });

    const { result } = renderHook(() => useRegistrations(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Database error');
  });

  it('should update registration status', async () => {
    const updatedReg = { ...mockRegistrations[0], status: 'approved' };
    api.patch.mockResolvedValue(updatedReg);

    const { result } = renderHook(() => useRegistrations(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const updated = await result.current.updateStatus('reg-1', 'approved');
      expect(updated.status).toBe('approved');
    });

    expect(api.patch).toHaveBeenCalledWith(
      '/admin/registrations?id=reg-1&action=approve',
      {}
    );
  });

  it('should update payment status', async () => {
    const updatedReg = { ...mockRegistrations[0], payment_status: 'paid' };
    api.patch.mockResolvedValue(updatedReg);

    const { result } = renderHook(() => useRegistrations(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const updated = await result.current.updatePaymentStatus('reg-1', 'paid', 525);
      expect(updated.payment_status).toBe('paid');
    });

    expect(api.patch).toHaveBeenCalledWith('/admin/registrations?id=reg-1', {
      payment_status: 'paid',
      amount_paid: 525,
    });
  });

  it('should assign registration to team', async () => {
    const updatedReg = { ...mockRegistrations[0], team_id: 'team-2' };
    api.patch.mockResolvedValue(updatedReg);

    const { result } = renderHook(() => useRegistrations(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const updated = await result.current.assignToTeam('reg-1', 'team-2');
      expect(updated.team_id).toBe('team-2');
    });

    expect(api.patch).toHaveBeenCalledWith('/admin/registrations?id=reg-1', { team_id: 'team-2' });
  });

  it('should delete registration', async () => {
    api.delete.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useRegistrations(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.deleteRegistration('reg-1');
    });

    expect(api.delete).toHaveBeenCalledWith('/admin/registrations?id=reg-1');
  });

  it('should convert registration to player', async () => {
    const approvedRegistration = { ...mockRegistrations[0], status: 'approved' };
    api.patch.mockResolvedValue(approvedRegistration);

    const { result } = renderHook(() => useRegistrations(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const player = await result.current.convertToPlayer(mockRegistrations[0]);
      expect(player).toEqual(approvedRegistration);
    });

    expect(api.patch).toHaveBeenCalledWith(
      '/admin/registrations?id=reg-1&action=approve',
      {}
    );
  });

  it('should provide refetch function', async () => {
    const { result } = renderHook(() => useRegistrations(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe('function');
  });
});
