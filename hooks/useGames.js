import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api-client';
import { useSeason } from '@/contexts/SeasonContext';

/**
 * Hook for managing games and tournaments
 * Games/tournaments are created first, then teams are assigned to them
 */
export function useGames() {
  const { selectedSeason, loading: seasonLoading } = useSeason();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const normalizeGame = useCallback((game) => {
    const assignedTeams =
      game.assigned_teams
      || game.game_teams
      || game.gameTeams
      || [];

    const normalizedAssignedTeams = assignedTeams.map((assignment) => ({
      ...assignment,
      team_id: assignment.team_id || assignment.teamId,
      game_id: assignment.game_id || assignment.gameId,
      team: assignment.team || null,
    }));

    return {
      ...game,
      season_id: game.season_id || game.seasonId || null,
      game_type: game.game_type || game.gameType || 'game',
      end_date: game.end_date || game.endDate || null,
      start_time: game.start_time || game.startTime || null,
      end_time: game.end_time || game.endTime || null,
      external_url: game.external_url || game.externalUrl || null,
      is_featured: game.is_featured ?? game.isFeatured ?? false,
      is_cancelled: game.is_cancelled ?? game.isCancelled ?? false,
      assigned_teams: normalizedAssignedTeams,
      game_teams: normalizedAssignedTeams,
      teams_count: game.teams_count ?? normalizedAssignedTeams.length,
    };
  }, []);

  const toApiPayload = useCallback((gameData) => {
    const payload = {
      seasonId: gameData.season_id || selectedSeason?.id || null,
      gameType: gameData.game_type || 'tournament',
      name: gameData.name,
      description: gameData.description || null,
      date: gameData.date,
      endDate: gameData.end_date || null,
      startTime: gameData.start_time || null,
      endTime: gameData.end_time || null,
      location: gameData.location || null,
      address: gameData.address || null,
      externalUrl: gameData.external_url || null,
      isFeatured: Boolean(gameData.is_featured),
      notes: gameData.notes || null,
      isCancelled: Boolean(gameData.is_cancelled),
    };

    return payload;
  }, [selectedSeason?.id]);

  const fetchGames = useCallback(async () => {
    if (seasonLoading) {
      return;
    }

    if (!selectedSeason?.id) {
      setGames([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await api.get(
        `/admin/games?seasonId=${selectedSeason.id}&gameType=tournament`
      );
      const normalizedGames = (data || []).map(normalizeGame);
      setGames(normalizedGames);
    } catch (err) {
      console.error('Error fetching games:', err);
      setError(err.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedSeason?.id, seasonLoading, normalizeGame]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const createGame = async (gameData) => {
    const payload = toApiPayload(gameData);
    const created = await api.post('/admin/games', payload);
    await fetchGames();
    return normalizeGame(created);
  };

  const updateGame = async (id, gameData) => {
    const payload = toApiPayload(gameData);
    const updated = await api.patch(`/admin/games?id=${id}`, payload);
    await fetchGames();
    return normalizeGame(updated);
  };

  const deleteGame = async (id) => {
    await api.delete(`/admin/games?id=${id}`);
    await fetchGames();
  };

  const assignTeams = async (gameId, teamIds) => {
    await api.patch(`/admin/games?id=${gameId}`, { teamIds });
    await fetchGames();
  };

  const updateTeamAssignment = async (assignmentId, data) => {
    console.log('updateTeamAssignment not yet implemented', assignmentId, data);
    await fetchGames();
  };

  const removeTeamFromGame = async (gameId, teamId) => {
    const currentGame = games.find((game) => game.id === gameId);
    if (!currentGame) return;

    const teamIds = (currentGame.assigned_teams || [])
      .map((assignment) => assignment.team_id)
      .filter((id) => id && id !== teamId);

    await assignTeams(gameId, teamIds);
    await fetchGames();
  };

  return {
    games,
    loading,
    error,
    createGame,
    updateGame,
    deleteGame,
    assignTeams,
    updateTeamAssignment,
    removeTeamFromGame,
    refetch: fetchGames,
  };
}

/**
 * Hook for fetching games for the public schedule
 */
export function usePublicGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGames = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.get('/public/schedule');
      const gamesData = (data || []).filter(e => e.type === 'game' || e.type === 'tournament');
      setGames(gamesData);
    } catch (err) {
      console.error('Error fetching public games:', err);
      setError(err.message);
      setGames([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  return {
    games,
    loading,
    error,
    refetch: fetchGames,
  };
}
