import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { api } from '@/lib/api-client';
import { useRegistrationStatus } from '@/hooks/useRegistrationStatus';

vi.mock('@/lib/api-client', () => ({
  api: {
    get: vi.fn(),
  },
}));

describe('useRegistrationStatus', () => {
  let fetchSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    fetchSpy = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('uses active season status from API data', async () => {
    api.get.mockResolvedValue([
      {
        id: 'season-upcoming',
        name: 'Summer 2026',
        is_active: false,
        start_date: '2026-06-01',
        end_date: '2026-08-01',
        tryouts_open: false,
        tryouts_label: null,
        registration_open: true,
        registration_label: 'Summer Registration',
      },
      {
        id: 'season-active',
        name: 'Spring 2026',
        is_active: true,
        start_date: '2026-02-01',
        end_date: '2026-05-31',
        tryouts_open: true,
        tryouts_label: 'Spring 2026 Tryouts',
        registration_open: false,
        registration_label: 'Spring 2026',
      },
    ]);

    const { result } = renderHook(() => useRegistrationStatus());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(api.get).toHaveBeenCalledWith('/public/seasons?includeInactive=true', {
      cache: 'no-store',
    });
    expect(result.current.isTryoutsOpen).toBe(true);
    expect(result.current.tryoutsLabel).toBe('Spring 2026 Tryouts');
    expect(result.current.isRegistrationOpen).toBe(false);
    expect(result.current.registrationLabel).toBe('Spring 2026');
    expect(result.current.seasonId).toBe('season-active');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('falls back to static config when seasons API has no data', async () => {
    api.get.mockResolvedValue([]);
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({
        season: { id: 'config-season', name: 'Fallback Season' },
        tryouts: { is_open: false, label: 'Fallback Tryouts' },
        registration: { is_open: true, label: 'Fallback Registration' },
      }),
    });

    const { result } = renderHook(() => useRegistrationStatus());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(fetchSpy).toHaveBeenCalledWith('/data/json/config.json', { cache: 'no-store' });
    expect(result.current.isTryoutsOpen).toBe(false);
    expect(result.current.tryoutsLabel).toBe('Fallback Tryouts');
    expect(result.current.isRegistrationOpen).toBe(true);
    expect(result.current.registrationLabel).toBe('Fallback Registration');
    expect(result.current.seasonId).toBe('config-season');
  });

  it('defaults to closed and exposes error when both sources fail', async () => {
    api.get.mockRejectedValue(new Error('Seasons API failed'));

    const { result } = renderHook(() => useRegistrationStatus());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Seasons API failed');
    expect(result.current.isTryoutsOpen).toBe(false);
    expect(result.current.isRegistrationOpen).toBe(false);
    expect(result.current.seasonId).toBe(null);
  });
});
