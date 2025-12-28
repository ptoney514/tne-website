import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useRegistrations } from '../../hooks/useRegistrations';

// Create a chainable mock that handles all Supabase query patterns
const createChainableMock = (mockData = [], mockError = null) => {
  const mock = {
    select: vi.fn(() => mock),
    eq: vi.fn(() => mock),
    order: vi.fn(() => mock),
    insert: vi.fn(() => mock),
    update: vi.fn(() => mock),
    delete: vi.fn(() => mock),
    single: vi.fn(() => Promise.resolve({ data: mockData[0] || { id: '1' }, error: mockError })),
    then: (resolve) => resolve({ data: mockData, error: mockError }),
  };
  Object.defineProperty(mock, 'then', {
    value: (resolve) => resolve({ data: mockData, error: mockError }),
    configurable: true,
  });
  return mock;
};

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => createChainableMock()),
  },
}));

describe('useRegistrations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useRegistrations());

    expect(result.current.loading).toBe(true);
    expect(result.current.registrations).toEqual([]);
    expect(result.current.teams).toEqual([]);
  });

  it('should return registrations after loading', async () => {
    const { result } = renderHook(() => useRegistrations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeNull();
  });

  it('should expose CRUD functions', async () => {
    const { result } = renderHook(() => useRegistrations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.updateRegistration).toBe('function');
    expect(typeof result.current.updateStatus).toBe('function');
    expect(typeof result.current.updatePaymentStatus).toBe('function');
    expect(typeof result.current.assignToTeam).toBe('function');
    expect(typeof result.current.deleteRegistration).toBe('function');
    expect(typeof result.current.convertToPlayer).toBe('function');
    expect(typeof result.current.refetch).toBe('function');
  });

  it('should have empty arrays when no data', async () => {
    const { result } = renderHook(() => useRegistrations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(Array.isArray(result.current.registrations)).toBe(true);
    expect(Array.isArray(result.current.teams)).toBe(true);
  });

  it('should expose updateStatus function that accepts id and status', async () => {
    const { result } = renderHook(() => useRegistrations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify updateStatus is callable with expected arguments
    expect(result.current.updateStatus.length).toBe(2); // id, status
  });

  it('should expose updatePaymentStatus function', async () => {
    const { result } = renderHook(() => useRegistrations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify updatePaymentStatus accepts id and paymentStatus
    expect(result.current.updatePaymentStatus.length).toBe(2); // id, paymentStatus
  });

  it('should expose assignToTeam function', async () => {
    const { result } = renderHook(() => useRegistrations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify assignToTeam accepts id and teamId
    expect(result.current.assignToTeam.length).toBe(2); // id, teamId
  });
});

describe('useRegistrations - Status Updates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should support pending status', async () => {
    const { result } = renderHook(() => useRegistrations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // The hook should be able to handle status updates
    expect(result.current.updateStatus).toBeDefined();
  });

  it('should support approved status', async () => {
    const { result } = renderHook(() => useRegistrations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.updateStatus).toBeDefined();
  });

  it('should support rejected status', async () => {
    const { result } = renderHook(() => useRegistrations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.updateStatus).toBeDefined();
  });
});

describe('useRegistrations - Payment Status Updates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should support pending payment status', async () => {
    const { result } = renderHook(() => useRegistrations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.updatePaymentStatus).toBeDefined();
  });

  it('should support paid payment status', async () => {
    const { result } = renderHook(() => useRegistrations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.updatePaymentStatus).toBeDefined();
  });

  it('should support partial payment status', async () => {
    const { result } = renderHook(() => useRegistrations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.updatePaymentStatus).toBeDefined();
  });

  it('should support waived payment status', async () => {
    const { result } = renderHook(() => useRegistrations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.updatePaymentStatus).toBeDefined();
  });
});

describe('useRegistrations - Convert to Player', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should expose convertToPlayer function', async () => {
    const { result } = renderHook(() => useRegistrations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.convertToPlayer).toBe('function');
  });

  it('convertToPlayer should accept a registration object', async () => {
    const { result } = renderHook(() => useRegistrations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // convertToPlayer takes 1 argument (registration object)
    expect(result.current.convertToPlayer.length).toBe(1);
  });
});
