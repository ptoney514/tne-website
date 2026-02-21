import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api-client';

/**
 * Admin hook for full CRUD on seasons.
 * Follows the pattern of useUsers.js.
 */
export function useSeasons() {
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSeasons = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.get('/admin/seasons');
      setSeasons(data || []);
    } catch (err) {
      console.error('Error fetching seasons:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSeasons();
  }, [fetchSeasons]);

  const createSeason = async (seasonData) => {
    const data = await api.post('/admin/seasons', seasonData);
    await fetchSeasons();
    return data;
  };

  const updateSeason = async (id, seasonData) => {
    const data = await api.patch(`/admin/seasons?id=${id}`, seasonData);
    await fetchSeasons();
    return data;
  };

  const deleteSeason = async (id) => {
    await api.delete(`/admin/seasons?id=${id}`);
    await fetchSeasons();
  };

  const toggleActive = async (id, isActive) => {
    const data = await api.patch(`/admin/seasons?id=${id}`, { is_active: isActive });
    await fetchSeasons();
    return data;
  };

  return {
    seasons,
    loading,
    error,
    refetch: fetchSeasons,
    createSeason,
    updateSeason,
    deleteSeason,
    toggleActive,
  };
}
