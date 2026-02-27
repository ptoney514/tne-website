import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api-client';
import { useSeason } from '@/contexts/SeasonContext';

export function useTeams() {
  const { selectedSeason } = useSeason();
  const [teams, setTeams] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = selectedSeason?.id ? `?seasonId=${selectedSeason.id}` : '';
      const teamsData = await api.get(`/admin/teams${params}`);
      setTeams(teamsData || []);
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedSeason?.id]);

  const fetchSeasons = useCallback(async () => {
    try {
      const data = await api.get('/admin/seasons');
      setSeasons(data || []);
    } catch (err) {
      console.error('Error fetching seasons:', err);
    }
  }, []);

  const fetchCoaches = useCallback(async () => {
    try {
      const data = await api.get('/admin/coaches');
      setCoaches(data || []);
    } catch (err) {
      console.error('Error fetching coaches:', err);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
    fetchSeasons();
    fetchCoaches();
  }, [fetchTeams, fetchSeasons, fetchCoaches]);

  const createTeam = async (teamData) => {
    const data = await api.post('/admin/teams', teamData);
    await fetchTeams();
    return data;
  };

  const updateTeam = async (id, teamData) => {
    const data = await api.patch(`/admin/teams?id=${id}`, teamData);
    await fetchTeams();
    return data;
  };

  const deleteTeam = async (id) => {
    await api.delete(`/admin/teams?id=${id}`);
    await fetchTeams();
  };

  return {
    teams,
    seasons,
    coaches,
    loading,
    error,
    refetch: fetchTeams,
    createTeam,
    updateTeam,
    deleteTeam,
  };
}
