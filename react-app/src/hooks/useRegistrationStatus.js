import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// Set to false to use real Supabase data
const USE_SAMPLE_DATA = false;

const SAMPLE_STATUS = {
  isTryoutsOpen: true,
  tryoutsLabel: "Winter '25-26 Tryouts",
  isRegistrationOpen: false,
  registrationLabel: "Fall/Winter '25-26",
  seasonId: 'sample-season-id',
};

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

      if (USE_SAMPLE_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setStatus(SAMPLE_STATUS);
        return;
      }

      // Fetch the active season with both tryouts and registration status
      const { data, error: fetchError } = await supabase
        .from('seasons')
        .select('id, name, tryouts_open, tryouts_label, registration_open, registration_label')
        .eq('is_active', true)
        .single();

      if (fetchError) {
        // If no active season found, both are closed
        if (fetchError.code === 'PGRST116') {
          setStatus({
            isTryoutsOpen: false,
            tryoutsLabel: null,
            isRegistrationOpen: false,
            registrationLabel: null,
            seasonId: null,
          });
          return;
        }
        throw fetchError;
      }

      // Handle case where no data returned (no active season)
      if (!data) {
        setStatus({
          isTryoutsOpen: false,
          tryoutsLabel: null,
          isRegistrationOpen: false,
          registrationLabel: null,
          seasonId: null,
        });
        return;
      }

      setStatus({
        isTryoutsOpen: data.tryouts_open || false,
        tryoutsLabel: data.tryouts_label || data.name,
        isRegistrationOpen: data.registration_open || false,
        registrationLabel: data.registration_label || data.name,
        seasonId: data.id,
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
