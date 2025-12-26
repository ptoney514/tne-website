import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// Set to false to use real Supabase data
const USE_SAMPLE_DATA = false;

const SAMPLE_REGISTRATION_STATUS = {
  isOpen: true,
  label: "Fall/Winter '25-26",
  seasonId: 'sample-season-id',
};

export function useRegistrationStatus() {
  const [registrationStatus, setRegistrationStatus] = useState({
    isOpen: false,
    label: null,
    seasonId: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRegistrationStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (USE_SAMPLE_DATA) {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 100));
        setRegistrationStatus(SAMPLE_REGISTRATION_STATUS);
        return;
      }

      // Fetch the active season with registration status
      const { data, error: fetchError } = await supabase
        .from('seasons')
        .select('id, name, registration_open, registration_label')
        .eq('is_active', true)
        .single();

      if (fetchError) {
        // If no active season found, registration is closed
        if (fetchError.code === 'PGRST116') {
          setRegistrationStatus({
            isOpen: false,
            label: null,
            seasonId: null,
          });
          return;
        }
        throw fetchError;
      }

      // Handle case where no data returned (no active season)
      if (!data) {
        setRegistrationStatus({
          isOpen: false,
          label: null,
          seasonId: null,
        });
        return;
      }

      setRegistrationStatus({
        isOpen: data.registration_open || false,
        label: data.registration_label || data.name,
        seasonId: data.id,
      });
    } catch (err) {
      console.error('Registration status error:', err);
      setError(err.message);
      // Default to closed on error
      setRegistrationStatus({
        isOpen: false,
        label: null,
        seasonId: null,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegistrationStatus();
  }, [fetchRegistrationStatus]);

  return {
    ...registrationStatus,
    loading,
    error,
    refetch: fetchRegistrationStatus,
  };
}
