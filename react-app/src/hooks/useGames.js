import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api-client';
import { useSeason } from '../contexts/SeasonContext';

/**
 * Hook for managing games and tournaments
 * Games/tournaments are created first, then teams are assigned to them
 */
export function useGames() {
  const { selectedSeason } = useSeason();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGames = useCallback(async () => {
    if (!selectedSeason?.id) {
      setGames([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Games would need a dedicated admin endpoint
      // For now, use the public schedule and filter
      const data = await api.get(`/public/schedule?seasonId=${selectedSeason.id}`);
      const gamesData = (data || []).filter(e => e.type === 'game' || e.type === 'tournament');

      const gamesWithCounts = gamesData.map(game => ({
        ...game,
        teams_count: game.game_teams?.length || 0,
        assigned_teams: game.game_teams || [],
      }));

      setGames(gamesWithCounts);
    } catch (err) {
      console.error('Error fetching games:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedSeason?.id]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const createGame = async (gameData) => {
    // Would need /admin/games endpoint
    console.log('createGame not yet implemented', gameData);
    await fetchGames();
    return {};
  };

  const updateGame = async (id, gameData) => {
    console.log('updateGame not yet implemented', id, gameData);
    await fetchGames();
    return {};
  };

  const deleteGame = async (id) => {
    console.log('deleteGame not yet implemented', id);
    await fetchGames();
  };

  const assignTeams = async (gameId, teamIds) => {
    console.log('assignTeams not yet implemented', gameId, teamIds);
    await fetchGames();
  };

  const updateTeamAssignment = async (assignmentId, data) => {
    console.log('updateTeamAssignment not yet implemented', assignmentId, data);
    await fetchGames();
  };

  const removeTeamFromGame = async (gameId, teamId) => {
    console.log('removeTeamFromGame not yet implemented', gameId, teamId);
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
