import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api-client';

export function useCoaches() {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCoaches = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const coachesData = await api.get('/admin/coaches');
      // Transform team_assignments to teams for backwards compatibility
      const transformed = (coachesData || []).map(coach => ({
        ...coach,
        teams: coach.team_assignments?.map(ta => ({
          id: ta.team_id,
          name: ta.team_name,
          grade_level: ta.grade_level,
          role: ta.role,
        })) || [],
        team_count: coach.team_assignments?.length || 0,
      }));
      setCoaches(transformed);
    } catch (err) {
      console.error('Error fetching coaches:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoaches();
  }, [fetchCoaches]);

  const createCoach = async (coachData) => {
    const data = await api.post('/admin/coaches', coachData);
    await fetchCoaches();
    return data;
  };

  const updateCoach = async (id, coachData) => {
    const data = await api.patch(`/admin/coaches?id=${id}`, coachData);
    await fetchCoaches();
    return data;
  };

  const deleteCoach = async (id) => {
    await api.delete(`/admin/coaches?id=${id}`);
    await fetchCoaches();
  };

  const getCoachById = async (id) => {
    const coach = coaches.find(c => c.id === id);
    return coach || null;
  };

  const getCoachingHistory = async (coachId) => {
    const coach = coaches.find(c => c.id === coachId);
    return coach?.team_assignments || [];
  };

  const getPlayersCoached = async (_coachId) => {
    // This would need a specific endpoint to get accurate count
    return 0;
  };

  return {
    coaches,
    loading,
    error,
    refetch: fetchCoaches,
    createCoach,
    updateCoach,
    deleteCoach,
    getCoachById,
    getCoachingHistory,
    getPlayersCoached,
  };
}
