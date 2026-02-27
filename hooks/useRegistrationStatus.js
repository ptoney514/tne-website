import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api-client';

/**
 * Hook for fetching registration and tryout status.
 * Primary source is seasons API (so admin dashboard toggles apply immediately).
 * Falls back to static config.json for environments without seasons data.
 */
export function useRegistrationStatus() {
  const [status, setStatus] = useState({
    isTryoutsOpen: false,
    tryoutsLabel: null,
    isRegistrationOpen: false,
    registrationLabel: null,
    seasonId: null,
    seasonName: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const mapSeasonToStatus = (season) => ({
    isTryoutsOpen: season.tryouts_open || false,
    tryoutsLabel: season.tryouts_label || season.name || null,
    isRegistrationOpen: season.registration_open || false,
    registrationLabel: season.registration_label || season.name || null,
    seasonId: season.id || null,
    seasonName: season.name || null,
  });

  const pickPreferredSeason = (seasons) => {
    if (!Array.isArray(seasons) || seasons.length === 0) return null;

    const activeSeason = seasons.find((season) => season.is_active);
    if (activeSeason) return activeSeason;

    const today = new Date().toISOString().split('T')[0];
    const currentSeason = seasons.find(
      (season) => season.start_date <= today && season.end_date >= today
    );
    if (currentSeason) return currentSeason;

    return seasons[0];
  };

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const seasonsData = await api.get('/public/seasons?includeInactive=true', {
        cache: 'no-store',
      });
      const preferredSeason = pickPreferredSeason(seasonsData);

      if (preferredSeason) {
        setStatus(mapSeasonToStatus(preferredSeason));
        return;
      }

      const response = await fetch('/data/json/config.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(`Failed to fetch config: ${response.status}`);

      const data = await response.json();
      setStatus({
        isTryoutsOpen: data.tryouts?.is_open || false,
        tryoutsLabel: data.tryouts?.label || data.season?.name,
        isRegistrationOpen: data.registration?.is_open || false,
        registrationLabel: data.registration?.label || data.season?.name,
        seasonId: data.season?.id || null,
        seasonName: data.season?.name || null,
      });
    } catch (err) {
      console.error('Status fetch error:', err);
      setError(err.message);
      // Default to closed on error
      setStatus({
        isTryoutsOpen: false,
        tryoutsLabel: null,
        isRegistrationOpen: false,
        registrationLabel: null,
        seasonId: null,
        seasonName: null,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    ...status,
    // Backward compatibility aliases
    isOpen: status.isRegistrationOpen,
    label: status.registrationLabel,
    loading,
    error,
    refetch: fetchStatus,
  };
}
