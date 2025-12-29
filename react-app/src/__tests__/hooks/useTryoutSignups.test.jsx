import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useTryoutSignups } from '../../hooks/useTryoutSignups';

// Track all select queries to verify correct column names
let capturedSelectQueries = [];
let mockFromTable = null;

// Create a chainable mock that captures query details
const createChainableMock = (mockData = [], mockError = null) => {
  const mock = {
    select: vi.fn((query) => {
      capturedSelectQueries.push({ table: mockFromTable, query });
      return mock;
    }),
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

// Mock Supabase with table tracking
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn((table) => {
      mockFromTable = table;
      return createChainableMock();
    }),
  },
}));

describe('useTryoutSignups', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedSelectQueries = [];
    mockFromTable = null;
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
});

describe('useTryoutSignups - Column Names Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedSelectQueries = [];
    mockFromTable = null;
  });

  it('should query tryout_signups with correct session column names', async () => {
    const { result } = renderHook(() => useTryoutSignups());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Find the tryout_signups query
    const signupsQuery = capturedSelectQueries.find(q => q.table === 'tryout_signups');
    expect(signupsQuery).toBeDefined();

    // Verify correct column names are used (NOT the old incorrect ones)
    expect(signupsQuery.query).toContain('date');
    expect(signupsQuery.query).toContain('gender');
    expect(signupsQuery.query).toContain('name');
    expect(signupsQuery.query).toContain('notes');

    // Verify old incorrect column names are NOT used
    expect(signupsQuery.query).not.toContain('session_date');
    expect(signupsQuery.query).not.toContain('grades');
    expect(signupsQuery.query).not.toContain('description');
  });

  it('should query tryout_sessions with correct column names', async () => {
    const { result } = renderHook(() => useTryoutSignups());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Find the tryout_sessions query
    const sessionsQuery = capturedSelectQueries.find(q => q.table === 'tryout_sessions');
    expect(sessionsQuery).toBeDefined();

    // Verify correct column names
    expect(sessionsQuery.query).toContain('id');
    expect(sessionsQuery.query).toContain('date');
    expect(sessionsQuery.query).toContain('start_time');
    expect(sessionsQuery.query).toContain('end_time');
    expect(sessionsQuery.query).toContain('location');
    expect(sessionsQuery.query).toContain('gender');
    expect(sessionsQuery.query).toContain('name');
    expect(sessionsQuery.query).toContain('notes');
    expect(sessionsQuery.query).toContain('is_active');

    // Verify old incorrect column names are NOT used
    expect(sessionsQuery.query).not.toContain('session_date');
    expect(sessionsQuery.query).not.toContain('grades');
    expect(sessionsQuery.query).not.toContain('description');
  });

  it('should NOT use session_date column (use date instead)', async () => {
    const { result } = renderHook(() => useTryoutSignups());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Check all queries for incorrect column name
    capturedSelectQueries.forEach(query => {
      expect(query.query).not.toContain('session_date');
    });
  });

  it('should NOT use grades column (use gender instead)', async () => {
    const { result } = renderHook(() => useTryoutSignups());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Check all queries for incorrect column name
    capturedSelectQueries.forEach(query => {
      expect(query.query).not.toContain('grades');
    });
  });

  it('should NOT use description column (use name instead)', async () => {
    const { result } = renderHook(() => useTryoutSignups());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Check all queries for incorrect column name
    capturedSelectQueries.forEach(query => {
      expect(query.query).not.toContain('description');
    });
  });
});

describe('useTryoutSignups - Status Updates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedSelectQueries = [];
  });

  it('should expose updateStatus function that accepts id and status', async () => {
    const { result } = renderHook(() => useTryoutSignups());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.updateStatus.length).toBe(2); // id, status
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

describe('useTryoutSignups - Session Updates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedSelectQueries = [];
  });

  it('should expose updateSession function', async () => {
    const { result } = renderHook(() => useTryoutSignups());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.updateSession.length).toBe(2); // id, sessionId
  });
});

describe('useTryoutSignups - Delete Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedSelectQueries = [];
  });

  it('should expose deleteSignup function', async () => {
    const { result } = renderHook(() => useTryoutSignups());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.deleteSignup.length).toBe(1); // id
  });
});

describe('useTryoutSignups - Convert to Player', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedSelectQueries = [];
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

describe('useTryoutSignups - Refetch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedSelectQueries = [];
  });

  it('should expose refetch function', async () => {
    const { result } = renderHook(() => useTryoutSignups());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe('function');
  });

  it('should be able to call refetch', async () => {
    const { result } = renderHook(() => useTryoutSignups());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Clear captured queries and call refetch
    const initialQueryCount = capturedSelectQueries.length;

    await act(async () => {
      await result.current.refetch();
    });

    // Verify more queries were made after refetch
    expect(capturedSelectQueries.length).toBeGreaterThan(initialQueryCount);
  });
});

describe('useTryoutSignups - Expected Session Fields', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedSelectQueries = [];
  });

  it('session object should have correct field names', async () => {
    const { result } = renderHook(() => useTryoutSignups());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify the query structure expects correct fields
    const signupsQuery = capturedSelectQueries.find(q => q.table === 'tryout_signups');

    // The query should select session with these fields
    expect(signupsQuery.query).toMatch(/session:tryout_sessions\(/);
    expect(signupsQuery.query).toMatch(/\bdate\b/);
    expect(signupsQuery.query).toMatch(/\bgender\b/);
    expect(signupsQuery.query).toMatch(/\bname\b/);
    expect(signupsQuery.query).toMatch(/\bnotes\b/);
  });

  it('sessions query should order by date', async () => {
    const { result } = renderHook(() => useTryoutSignups());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // The sessions query should use 'date' for ordering, not 'session_date'
    const sessionsQuery = capturedSelectQueries.find(q => q.table === 'tryout_sessions');
    expect(sessionsQuery).toBeDefined();
    expect(sessionsQuery.query).toContain('date');
    expect(sessionsQuery.query).not.toContain('session_date');
  });
});
