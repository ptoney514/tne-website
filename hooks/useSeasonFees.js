import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api-client';

/**
 * Hook for fetching public season fees for a given season.
 * Returns active, public fees ordered by displayOrder then amount.
 */
export function useSeasonFees(seasonId) {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFees = useCallback(async () => {
    if (!seasonId) {
      setFees([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await api.get(`/public/seasons/${seasonId}/fees`);
      setFees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching season fees:', err);
      setError(err.message);
      setFees([]);
    } finally {
      setLoading(false);
    }
  }, [seasonId]);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  return { fees, loading, error, refetch: fetchFees };
}
