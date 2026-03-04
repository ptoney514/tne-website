import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api-client';
import { useSeason } from '@/contexts/SeasonContext';

export function usePlayers() {
  const { selectedSeason } = useSeason();
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPlayers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = selectedSeason?.id ? `?seasonId=${selectedSeason.id}` : '';
      const playersData = await api.get(`/admin/players${params}`);
      // Transform team_assignments to teams for backwards compatibility
      const transformed = (playersData || []).map(player => ({
        ...player,
        teams: player.team_assignments?.map(ta => ({
          id: ta.team_id,
          name: ta.team_name,
          grade_level: ta.grade_level,
        })) || [],
      }));
      setPlayers(transformed);
    } catch (err) {
      console.error('Error fetching players:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedSeason?.id]);

  const fetchTeams = useCallback(async () => {
    try {
      const params = selectedSeason?.id ? `?seasonId=${selectedSeason.id}` : '';
      const data = await api.get(`/admin/teams${params}`);
      setTeams((data || []).map(t => ({
        id: t.id,
        name: t.name,
        grade_level: t.grade_level,
      })));
    } catch (err) {
      console.error('Error fetching teams:', err);
    }
  }, [selectedSeason?.id]);

  useEffect(() => {
    fetchPlayers();
    fetchTeams();
  }, [fetchPlayers, fetchTeams]);

  const createPlayer = async (playerData) => {
    const data = await api.post('/admin/players', playerData);
    await fetchPlayers();
    return data;
  };

  const updatePlayer = async (id, playerData) => {
    const data = await api.patch(`/admin/players?id=${id}`, playerData);
    await fetchPlayers();
    return data;
  };

  const deletePlayer = async (id) => {
    await api.delete(`/admin/players?id=${id}`);
    await fetchPlayers();
  };

  const getPlayerHistory = useCallback(async (playerId) => {
    if (!playerId) return [];
    // For now, return team assignments from the player data
    const player = players.find(p => p.id === playerId);
    return player?.team_assignments || [];
  }, [players]);

  const assignPlayerToTeam = async (playerId, teamId) => {
    await api.post('/admin/players', {
      action: 'assign_team',
      player_id: playerId,
      team_id: teamId,
    });
    await fetchPlayers();
  };

  const removePlayerFromTeam = async (playerId, teamId) => {
    await api.post('/admin/players', {
      action: 'remove_team',
      player_id: playerId,
      team_id: teamId,
    });
    await fetchPlayers();
  };

  return {
    players,
    teams,
    loading,
    error,
    refetch: fetchPlayers,
    createPlayer,
    updatePlayer,
    deletePlayer,
    getPlayerHistory,
    assignPlayerToTeam,
    removePlayerFromTeam,
  };
}

export function useTeamRoster(teamId) {
  const [roster, setRoster] = useState([]);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRoster = useCallback(async () => {
    if (!teamId) {
      setRoster([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch players on this team
      const playersData = await api.get(`/admin/players?teamId=${teamId}`);
      setRoster(playersData || []);

      // Fetch all players to find available ones
      const allPlayers = await api.get('/admin/players');
      const rosterIds = (playersData || []).map(p => p.id);
      setAvailablePlayers((allPlayers || []).filter(p => !rosterIds.includes(p.id)));
    } catch (err) {
      console.error('Error fetching roster:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchRoster();
  }, [fetchRoster]);

  const addToRoster = async (playerId, rosterData = {}) => {
    await api.post('/admin/players', {
      action: 'assign_team',
      player_id: playerId,
      team_id: teamId,
      ...rosterData,
    });
    await fetchRoster();
  };

  const removeFromRoster = async (rosterId) => {
    // Find the player from roster
    const rosterEntry = roster.find(r => r.id === rosterId || r.roster_id === rosterId);
    if (rosterEntry) {
      await api.post('/admin/players', {
        action: 'remove_team',
        player_id: rosterEntry.id,
        team_id: teamId,
      });
    }
    await fetchRoster();
  };

  const updateRosterEntry = async (rosterId, data) => {
    await api.patch(`/admin/roster?id=${rosterId}`, data);
    await fetchRoster();
  };

  const bulkAddToRoster = async (players, teamData = {}) => {
    const results = {
      added: 0,
      errors: [],
    };

    for (const player of players) {
      try {
        // Create player and add to roster
        await api.post('/admin/players', {
          first_name: player.firstName,
          last_name: player.lastName || '',
          grade: teamData.grade_level || '',
          gender: teamData.gender || 'male',
          jersey_number: player.jerseyNumber || null,
          position: player.position || null,
          team_id: teamId,
        });
        results.added++;
      } catch (err) {
        results.errors.push({
          player: `${player.firstName} ${player.lastName}`,
          error: err.message,
        });
      }
    }

    await fetchRoster();
    return results;
  };

  return {
    roster,
    availablePlayers,
    loading,
    error,
    refetch: fetchRoster,
    addToRoster,
    removeFromRoster,
    updateRosterEntry,
    bulkAddToRoster,
  };
}
