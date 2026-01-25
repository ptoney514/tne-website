import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTeamRegistration } from '../../hooks/useTeamRegistration';

// Mock fetch globally
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

// Sample test data
const mockTeamsData = {
  teams: [
    {
      id: 'team-1',
      name: '5th Grade Boys Elite',
      grade_level: '5th',
      gender: 'male',
      team_fee: 450.0,
      uniform_fee: 75.0,
    },
    {
      id: 'team-2',
      name: '6th Grade Boys Elite',
      grade_level: '6th',
      gender: 'male',
      team_fee: 475.0,
      uniform_fee: 75.0,
    },
  ],
  season: { id: 'season-1', name: '2025-26 Winter' },
};

const mockConfigData = {
  season: { id: 'season-1', name: '2025-26 Winter' },
};

const mockRegistrationData = {
  teamId: 'team-1',
  playerFirstName: 'John',
  playerLastName: 'Doe',
  playerDob: '2015-03-15',
  playerGraduatingYear: 2027,
  playerGrade: '5th',
  playerGender: 'male',
  jerseySize: 'YM',
  position: 'Guard',
  parentFirstName: 'Jane',
  parentLastName: 'Doe',
  parentEmail: 'jane.doe@example.com',
  parentPhone: '555-123-4567',
  addressStreet: '123 Main St',
  addressCity: 'Chicago',
  addressState: 'IL',
  addressZip: '60601',
  relationship: 'Mother',
  emergencyName: 'Bob Doe',
  emergencyPhone: '555-987-6543',
  waiverLiability: true,
  waiverMedical: true,
  waiverMedia: true,
  paymentPlanType: 'full',
  paymentConfirmed: true,
  initialAmountDue: 525,
  remainingBalance: 0,
  paymentReferenceId: 'PAY-123',
};

describe('useTeamRegistration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('team fetching', () => {
    it('should start with loading state', () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      const { result } = renderHook(() => useTeamRegistration());

      expect(result.current.loading).toBe(true);
      expect(result.current.teams).toEqual([]);
    });

    it('should fetch teams from JSON files', async () => {
      mockFetch.mockImplementation((url) => {
        if (url.includes('teams.json')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockTeamsData),
          });
        }
        if (url.includes('config.json')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockConfigData),
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const { result } = renderHook(() => useTeamRegistration());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.teams).toHaveLength(2);
      expect(result.current.teams[0].name).toBe('5th Grade Boys Elite');
      expect(result.current.teams[0].season.name).toBe('2025-26 Winter');
    });

    it('should handle fetch error and use fallback data', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useTeamRegistration());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should have fallback sample teams
      expect(result.current.teams.length).toBeGreaterThan(0);
      expect(result.current.error).toBe('Network error');
    });

    it('should provide refetch function', async () => {
      mockFetch.mockImplementation((url) => {
        if (url.includes('teams.json')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockTeamsData),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockConfigData),
        });
      });

      const { result } = renderHook(() => useTeamRegistration());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(typeof result.current.refetch).toBe('function');
    });
  });

  describe('payment status determination', () => {
    beforeEach(() => {
      mockFetch.mockImplementation((url) => {
        if (url.includes('teams.json') || url.includes('config.json')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockTeamsData),
          });
        }
        if (url.includes('/api/register')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true, referenceId: 'REF-123' }),
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });
    });

    it('should set pending_verification for full payment confirmed', async () => {
      const { result } = renderHook(() => useTeamRegistration());

      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.submitRegistration({
          ...mockRegistrationData,
          paymentPlanType: 'full',
          paymentConfirmed: true,
        });
      });

      // Check the payload sent to API
      const registerCall = mockFetch.mock.calls.find((call) =>
        call[0].includes('/api/register')
      );
      const payload = JSON.parse(registerCall[1].body);
      expect(payload.registration.payment_status).toBe('pending_verification');
    });

    it('should set payment_plan_active for installment plan', async () => {
      const { result } = renderHook(() => useTeamRegistration());

      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.submitRegistration({
          ...mockRegistrationData,
          paymentPlanType: 'installment',
          paymentConfirmed: false,
        });
      });

      const registerCall = mockFetch.mock.calls.find((call) =>
        call[0].includes('/api/register')
      );
      const payload = JSON.parse(registerCall[1].body);
      expect(payload.registration.payment_status).toBe('payment_plan_active');
    });

    it('should set awaiting_approval for special request', async () => {
      const { result } = renderHook(() => useTeamRegistration());

      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.submitRegistration({
          ...mockRegistrationData,
          paymentPlanType: 'special_request',
          specialRequestReason: 'Financial hardship',
        });
      });

      const registerCall = mockFetch.mock.calls.find((call) =>
        call[0].includes('/api/register')
      );
      const payload = JSON.parse(registerCall[1].body);
      expect(payload.registration.payment_status).toBe('awaiting_approval');
    });

    it('should set pending for full payment not confirmed', async () => {
      const { result } = renderHook(() => useTeamRegistration());

      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.submitRegistration({
          ...mockRegistrationData,
          paymentPlanType: 'full',
          paymentConfirmed: false,
        });
      });

      const registerCall = mockFetch.mock.calls.find((call) =>
        call[0].includes('/api/register')
      );
      const payload = JSON.parse(registerCall[1].body);
      expect(payload.registration.payment_status).toBe('pending');
    });
  });

  describe('waiver handling', () => {
    beforeEach(() => {
      mockFetch.mockImplementation((url) => {
        if (url.includes('teams.json') || url.includes('config.json')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockTeamsData),
          });
        }
        if (url.includes('/api/register')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true, referenceId: 'REF-123' }),
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });
    });

    it('should set waiver_accepted true when all waivers are accepted', async () => {
      const { result } = renderHook(() => useTeamRegistration());

      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.submitRegistration({
          ...mockRegistrationData,
          waiverLiability: true,
          waiverMedical: true,
          waiverMedia: true,
        });
      });

      const registerCall = mockFetch.mock.calls.find((call) =>
        call[0].includes('/api/register')
      );
      const payload = JSON.parse(registerCall[1].body);
      expect(payload.registration.waiver_accepted).toBe(true);
      expect(payload.registration.waiver_accepted_at).toBeTruthy();
    });

    it('should set waiver_accepted false when any waiver is not accepted', async () => {
      const { result } = renderHook(() => useTeamRegistration());

      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.submitRegistration({
          ...mockRegistrationData,
          waiverLiability: true,
          waiverMedical: false,
          waiverMedia: true,
        });
      });

      const registerCall = mockFetch.mock.calls.find((call) =>
        call[0].includes('/api/register')
      );
      const payload = JSON.parse(registerCall[1].body);
      expect(payload.registration.waiver_accepted).toBe(false);
      expect(payload.registration.waiver_accepted_at).toBe(null);
    });
  });

  describe('registration submission', () => {
    beforeEach(() => {
      mockFetch.mockImplementation((url) => {
        if (url.includes('teams.json') || url.includes('config.json')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockTeamsData),
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });
    });

    it('should set submitting state during submission', async () => {
      let resolveSubmit;
      mockFetch.mockImplementation((url) => {
        if (url.includes('teams.json') || url.includes('config.json')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockTeamsData),
          });
        }
        if (url.includes('/api/register')) {
          return new Promise((resolve) => {
            resolveSubmit = resolve;
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const { result } = renderHook(() => useTeamRegistration());

      await waitFor(() => expect(result.current.loading).toBe(false));

      let submitPromise;
      act(() => {
        submitPromise = result.current.submitRegistration(mockRegistrationData);
      });

      expect(result.current.submitting).toBe(true);

      await act(async () => {
        resolveSubmit({
          ok: true,
          json: () => Promise.resolve({ success: true, referenceId: 'REF-123' }),
        });
        await submitPromise;
      });

      expect(result.current.submitting).toBe(false);
    });

    it('should return success result on successful submission', async () => {
      mockFetch.mockImplementation((url) => {
        if (url.includes('teams.json') || url.includes('config.json')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockTeamsData),
          });
        }
        if (url.includes('/api/register')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true, referenceId: 'REF-123' }),
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const { result } = renderHook(() => useTeamRegistration());

      await waitFor(() => expect(result.current.loading).toBe(false));

      let submitResult;
      await act(async () => {
        submitResult = await result.current.submitRegistration(mockRegistrationData);
      });

      expect(submitResult).toEqual({ success: true, referenceId: 'REF-123' });
      expect(result.current.submitSuccess).toBe(true);
      expect(result.current.submitError).toBe(null);
    });

    it('should handle submission error', async () => {
      mockFetch.mockImplementation((url) => {
        if (url.includes('teams.json') || url.includes('config.json')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockTeamsData),
          });
        }
        if (url.includes('/api/register')) {
          return Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ error: 'Registration failed' }),
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const { result } = renderHook(() => useTeamRegistration());

      await waitFor(() => expect(result.current.loading).toBe(false));

      let submitResult;
      await act(async () => {
        submitResult = await result.current.submitRegistration(mockRegistrationData);
      });

      expect(submitResult.success).toBe(false);
      expect(submitResult.error).toBe('Registration failed');
      expect(result.current.submitError).toBe('Registration failed');
    });

    it('should include turnstile token when provided', async () => {
      mockFetch.mockImplementation((url) => {
        if (url.includes('teams.json') || url.includes('config.json')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockTeamsData),
          });
        }
        if (url.includes('/api/register')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true, referenceId: 'REF-123' }),
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const { result } = renderHook(() => useTeamRegistration());

      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.submitRegistration(mockRegistrationData, 'turnstile-token-123');
      });

      const registerCall = mockFetch.mock.calls.find((call) =>
        call[0].includes('/api/register')
      );
      const payload = JSON.parse(registerCall[1].body);
      expect(payload.turnstileToken).toBe('turnstile-token-123');
    });
  });

  describe('resetSubmitState', () => {
    it('should reset submission state', async () => {
      mockFetch.mockImplementation((url) => {
        if (url.includes('teams.json') || url.includes('config.json')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockTeamsData),
          });
        }
        if (url.includes('/api/register')) {
          return Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ error: 'Error' }),
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const { result } = renderHook(() => useTeamRegistration());

      await waitFor(() => expect(result.current.loading).toBe(false));

      // Create error state
      await act(async () => {
        await result.current.submitRegistration(mockRegistrationData);
      });

      expect(result.current.submitError).toBe('Error');

      // Reset
      act(() => {
        result.current.resetSubmitState();
      });

      expect(result.current.submitting).toBe(false);
      expect(result.current.submitError).toBe(null);
      expect(result.current.submitSuccess).toBe(false);
    });
  });
});
