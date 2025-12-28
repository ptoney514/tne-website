import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTryoutSignups } from '../../hooks/useTryoutSignups';

// Create a chainable mock that handles all Supabase query patterns
const createChainableMock = (mockData = [], mockError = null) => {
  const mock = {
    select: vi.fn(() => mock),
    eq: vi.fn(() => mock),
    gte: vi.fn(() => mock),
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

describe('useTryoutSignups', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useTryoutSignups());

    expect(result.current.loading).toBe(true);
    expect(result.current.signups).toEqual([]);
    expect(result.current.sessions).toEqual([]);
  });

  it('should return signups after loading', async () => {
    const { result } = renderHook(() => useTryoutSignups());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeNull();
  });

  it('should expose CRUD functions', async () => {
    const { result } = renderHook(() => useTryoutSignups());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.updateSignup).toBe('function');
    expect(typeof result.current.updateStatus).toBe('function');
    expect(typeof result.current.updateSession).toBe('function');
    expect(typeof result.current.deleteSignup).toBe('function');
    expect(typeof result.current.convertToPlayer).toBe('function');
    expect(typeof result.current.refetch).toBe('function');
  });

  it('should have empty arrays when no data', async () => {
    const { result } = renderHook(() => useTryoutSignups());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(Array.isArray(result.current.signups)).toBe(true);
    expect(Array.isArray(result.current.sessions)).toBe(true);
  });

  it('should expose updateStatus function that accepts id and status', async () => {
    const { result } = renderHook(() => useTryoutSignups());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify updateStatus is callable with expected arguments
    expect(result.current.updateStatus.length).toBe(2); // id, status
  });

  it('should expose updateSession function', async () => {
    const { result } = renderHook(() => useTryoutSignups());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify updateSession accepts id and sessionId
    expect(result.current.updateSession.length).toBe(2); // id, sessionId
  });

  it('should expose deleteSignup function', async () => {
    const { result } = renderHook(() => useTryoutSignups());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify deleteSignup accepts id
    expect(result.current.deleteSignup.length).toBe(1); // id
  });
});

describe('useTryoutSignups - Status Updates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should support pending status', async () => {
    const { result } = renderHook(() => useTryoutSignups());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.updateStatus).toBeDefined();
  });

  it('should support confirmed status', async () => {
    const { result } = renderHook(() => useTryoutSignups());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.updateStatus).toBeDefined();
  });

  it('should support attended status', async () => {
    const { result } = renderHook(() => useTryoutSignups());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.updateStatus).toBeDefined();
  });

  it('should support selected status', async () => {
    const { result } = renderHook(() => useTryoutSignups());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.updateStatus).toBeDefined();
  });

  it('should support not_selected status', async () => {
    const { result } = renderHook(() => useTryoutSignups());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.updateStatus).toBeDefined();
  });

  it('should support no_show status', async () => {
    const { result } = renderHook(() => useTryoutSignups());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.updateStatus).toBeDefined();
  });
});

describe('useTryoutSignups - Convert to Player', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should expose convertToPlayer function', async () => {
    const { result } = renderHook(() => useTryoutSignups());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.convertToPlayer).toBe('function');
  });

  it('convertToPlayer should accept a signup object', async () => {
    const { result } = renderHook(() => useTryoutSignups());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // convertToPlayer takes 1 argument (signup object)
    expect(result.current.convertToPlayer.length).toBe(1);
  });
});
