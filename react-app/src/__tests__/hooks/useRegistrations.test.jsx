import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

// Setup mock before importing the hook
const mockFrom = vi.fn();

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: (...args) => mockFrom(...args),
  },
}));

import { useRegistrations } from '../../hooks/useRegistrations';

// Helper to create chainable mock
const createChainableMock = (data = [], error = null) => {
  const mock = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: data[0] || null, error }),
  };
  mock.order.mockResolvedValue({ data, error });
  mock.eq.mockReturnValue(mock);
  mock.select.mockReturnValue(mock);
  return mock;
};

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

describe('useRegistrations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should start with loading state', () => {
    mockFrom.mockImplementation(() => createChainableMock([]));

    const { result } = renderHook(() => useRegistrations());

    expect(result.current.loading).toBe(true);
    expect(result.current.registrations).toEqual([]);
  });

  it('should fetch registrations with team info', async () => {
    mockFrom.mockImplementation((table) => {
      if (table === 'registrations') {
        return createChainableMock(mockRegistrations);
      }
      if (table === 'teams') {
        return createChainableMock(mockTeams);
      }
      return createChainableMock([]);
    });

    const { result } = renderHook(() => useRegistrations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.registrations).toHaveLength(2);
    expect(result.current.registrations[0].team.name).toBe('5th Grade Elite');
  });

  it('should fetch teams for assignment', async () => {
    mockFrom.mockImplementation((table) => {
      if (table === 'registrations') {
        return createChainableMock(mockRegistrations);
      }
      if (table === 'teams') {
        return createChainableMock(mockTeams);
      }
      return createChainableMock([]);
    });

    const { result } = renderHook(() => useRegistrations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.teams).toHaveLength(2);
  });

  it('should handle fetch error', async () => {
    mockFrom.mockImplementation(() =>
      createChainableMock([], { message: 'Database error' })
    );

    const { result } = renderHook(() => useRegistrations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Database error');
  });

  it('should update registration status', async () => {
    const updatedReg = { ...mockRegistrations[0], status: 'approved' };

    mockFrom.mockImplementation((table) => {
      if (table === 'registrations') {
        const mock = createChainableMock(mockRegistrations);
        mock.update = vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: updatedReg, error: null }),
            }),
          }),
        });
        return mock;
      }
      if (table === 'teams') {
        return createChainableMock(mockTeams);
      }
      return createChainableMock([]);
    });

    const { result } = renderHook(() => useRegistrations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const updated = await result.current.updateStatus('reg-1', 'approved');
      expect(updated.status).toBe('approved');
    });
  });

  it('should update payment status', async () => {
    const updatedReg = { ...mockRegistrations[0], payment_status: 'paid' };

    mockFrom.mockImplementation((table) => {
      if (table === 'registrations') {
        const mock = createChainableMock(mockRegistrations);
        mock.update = vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: updatedReg, error: null }),
            }),
          }),
        });
        return mock;
      }
      if (table === 'teams') {
        return createChainableMock(mockTeams);
      }
      return createChainableMock([]);
    });

    const { result } = renderHook(() => useRegistrations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const updated = await result.current.updatePaymentStatus('reg-1', 'paid', 525);
      expect(updated.payment_status).toBe('paid');
    });
  });

  it('should assign registration to team', async () => {
    const updatedReg = { ...mockRegistrations[0], team_id: 'team-2' };

    mockFrom.mockImplementation((table) => {
      if (table === 'registrations') {
        const mock = createChainableMock(mockRegistrations);
        mock.update = vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: updatedReg, error: null }),
            }),
          }),
        });
        return mock;
      }
      if (table === 'teams') {
        return createChainableMock(mockTeams);
      }
      return createChainableMock([]);
    });

    const { result } = renderHook(() => useRegistrations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const updated = await result.current.assignToTeam('reg-1', 'team-2');
      expect(updated.team_id).toBe('team-2');
    });
  });

  it('should delete registration', async () => {
    mockFrom.mockImplementation((table) => {
      if (table === 'registrations') {
        const mock = createChainableMock(mockRegistrations);
        mock.delete = vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        });
        return mock;
      }
      if (table === 'teams') {
        return createChainableMock(mockTeams);
      }
      return createChainableMock([]);
    });

    const { result } = renderHook(() => useRegistrations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.deleteRegistration('reg-1');
    });

    expect(mockFrom).toHaveBeenCalledWith('registrations');
  });

  it('should convert registration to player', async () => {
    const newPlayer = { id: 'player-1', first_name: 'John', last_name: 'Doe' };
    const newParent = { id: 'parent-1', first_name: 'Jane', last_name: 'Doe' };

    mockFrom.mockImplementation((table) => {
      switch (table) {
        case 'registrations': {
          const mock = createChainableMock(mockRegistrations);
          mock.update = vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockRegistrations[0], error: null }),
              }),
            }),
          });
          return mock;
        }
        case 'players': {
          const mock = createChainableMock([]);
          mock.insert = vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: newPlayer, error: null }),
            }),
          });
          mock.update = vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          });
          return mock;
        }
        case 'parents': {
          const mock = createChainableMock([]);
          mock.insert = vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: newParent, error: null }),
            }),
          });
          return mock;
        }
        case 'team_roster': {
          const mock = createChainableMock([]);
          mock.insert = vi.fn().mockResolvedValue({ error: null });
          return mock;
        }
        case 'teams':
          return createChainableMock(mockTeams);
        default:
          return createChainableMock([]);
      }
    });

    const { result } = renderHook(() => useRegistrations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const player = await result.current.convertToPlayer(mockRegistrations[0]);
      expect(player).toEqual(newPlayer);
    });
  });

  it('should provide refetch function', async () => {
    mockFrom.mockImplementation(() => createChainableMock([]));

    const { result } = renderHook(() => useRegistrations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe('function');
  });
});
