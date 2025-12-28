import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePracticeSchedule, formatPracticeTime, formatPracticeSession } from '../../hooks/usePracticeSchedule';

// Create a chainable mock that handles all Supabase query patterns
const createChainableMock = (returnData = []) => {
  const mock = {
    select: vi.fn(() => mock),
    eq: vi.fn(() => mock),
    order: vi.fn(() => mock),
    single: vi.fn(() => Promise.resolve({ data: returnData, error: null })),
    then: (resolve) => resolve({ data: returnData, error: null }),
  };
  Object.defineProperty(mock, 'then', {
    value: (resolve) => resolve({ data: returnData, error: null }),
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

describe('usePracticeSchedule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => usePracticeSchedule('test-team-id'));

    expect(result.current.loading).toBe(true);
    expect(result.current.practices).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should set loading to false when no teamId provided', async () => {
    const { result } = renderHook(() => usePracticeSchedule(null));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.practices).toEqual([]);
  });

  it('should return practices after loading', async () => {
    const { result } = renderHook(() => usePracticeSchedule('test-team-id'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(Array.isArray(result.current.practices)).toBe(true);
  });
});

describe('formatPracticeTime', () => {
  it('should format morning time correctly', () => {
    expect(formatPracticeTime('09:30:00')).toBe('9:30 AM');
  });

  it('should format afternoon time correctly', () => {
    expect(formatPracticeTime('14:00:00')).toBe('2:00 PM');
  });

  it('should format evening time correctly', () => {
    expect(formatPracticeTime('18:30:00')).toBe('6:30 PM');
  });

  it('should handle noon correctly', () => {
    expect(formatPracticeTime('12:00:00')).toBe('12:00 PM');
  });

  it('should handle midnight correctly', () => {
    expect(formatPracticeTime('00:00:00')).toBe('12:00 AM');
  });

  it('should return empty string for null/undefined', () => {
    expect(formatPracticeTime(null)).toBe('');
    expect(formatPracticeTime(undefined)).toBe('');
    expect(formatPracticeTime('')).toBe('');
  });
});

describe('formatPracticeSession', () => {
  it('should format a practice session correctly', () => {
    const practice = {
      day_of_week: 'Monday',
      start_time: '18:00:00',
      end_time: '19:30:00',
      location: 'Monroe MS',
    };

    expect(formatPracticeSession(practice)).toBe('Mon 6:00-7:30 PM at Monroe MS');
  });

  it('should handle different AM/PM periods', () => {
    const practice = {
      day_of_week: 'Saturday',
      start_time: '09:00:00',
      end_time: '10:30:00',
      location: 'Central HS',
    };

    expect(formatPracticeSession(practice)).toBe('Sat 9:00-10:30 AM at Central HS');
  });

  it('should abbreviate day of week', () => {
    const practice = {
      day_of_week: 'Wednesday',
      start_time: '18:00:00',
      end_time: '19:30:00',
      location: 'Test Location',
    };

    expect(formatPracticeSession(practice)).toContain('Wed');
  });
});
