import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api-client';

/**
 * Hook for fetching complete tournament detail data
 * Used by the public tournament detail page
 */
export function useTournamentDetail(gameId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTournamentDetail = useCallback(async () => {
    if (!gameId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await api.get(`/public/tournaments?id=${gameId}`);

      // Data is already transformed by the API
      setData(result);
    } catch (err) {
      console.error('Error fetching tournament detail:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    fetchTournamentDetail();
  }, [fetchTournamentDetail]);

  return {
    data,
    loading,
    error,
    refetch: fetchTournamentDetail,
  };
}

/**
 * Hook for fetching all tournaments (for listing page)
 */
export function useTournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTournaments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.get('/public/tournaments');
      setTournaments(data || []);
    } catch (err) {
      console.error('Error fetching tournaments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  return {
    tournaments,
    loading,
    error,
    refetch: fetchTournaments,
  };
}
