import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for fetching registration and tryout status.
 * Fetches from static config.json file.
 */
export function useRegistrationStatus() {
  const [status, setStatus] = useState({
    isTryoutsOpen: false,
    tryoutsLabel: null,
    isRegistrationOpen: false,
    registrationLabel: null,
    seasonId: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/data/json/config.json');

      if (!response.ok) {
        throw new Error(`Failed to fetch config: ${response.status}`);
      }

      const data = await response.json();

      setStatus({
        isTryoutsOpen: data.tryouts?.is_open || false,
        tryoutsLabel: data.tryouts?.label || data.season?.name,
        isRegistrationOpen: data.registration?.is_open || false,
        registrationLabel: data.registration?.label || data.season?.name,
        seasonId: data.season?.id || null,
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
