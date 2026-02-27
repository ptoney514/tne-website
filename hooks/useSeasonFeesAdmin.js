import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api-client';

/**
 * Admin hook for CRUD operations on season fees.
 * Returns all fees (including inactive/private) for a given season.
 */
export function useSeasonFeesAdmin(seasonId) {
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
      const data = await api.get(`/admin/seasons/${seasonId}/fees`);
      setFees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching admin season fees:', err);
      setError(err.message);
      setFees([]);
    } finally {
      setLoading(false);
    }
  }, [seasonId]);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  const createFee = useCallback(async (feeData) => {
    const newFee = await api.post(`/admin/seasons/${seasonId}/fees`, feeData);
    await fetchFees();
    return newFee;
  }, [seasonId, fetchFees]);

  const updateFee = useCallback(async (feeId, feeData) => {
    const updated = await api.patch(`/admin/seasons/${seasonId}/fees?feeId=${feeId}`, feeData);
    await fetchFees();
    return updated;
  }, [seasonId, fetchFees]);

  const deleteFee = useCallback(async (feeId) => {
    await api.delete(`/admin/seasons/${seasonId}/fees?feeId=${feeId}`);
    await fetchFees();
  }, [seasonId, fetchFees]);

  return {
    fees,
    loading,
    error,
    refetch: fetchFees,
    createFee,
    updateFee,
    deleteFee,
  };
}
