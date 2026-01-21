import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
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
      const { data, error: fetchError } = await supabase
        .from('games')
        .select(`
          *,
          game_teams(
            id,
            team_id,
            opponent,
            is_home_game,
            result,
            notes,
            team:teams(id, name, grade_level, gender)
          )
        `)
        .eq('season_id', selectedSeason.id)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (fetchError) throw fetchError;

      // Add computed fields
      const gamesWithCounts = (data || []).map(game => ({
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

  // Create a new game/tournament
  const createGame = async (gameData) => {
    const { data, error } = await supabase
      .from('games')
      .insert({
        ...gameData,
        season_id: selectedSeason.id,
      })
      .select()
      .single();

    if (error) throw error;
    await fetchGames();
    return data;
  };

  // Update a game/tournament
  const updateGame = async (id, gameData) => {
    const { data, error } = await supabase
      .from('games')
      .update(gameData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    await fetchGames();
    return data;
  };

  // Delete a game/tournament
  const deleteGame = async (id) => {
    const { error } = await supabase
      .from('games')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchGames();
  };

  // Assign teams to a game (batch operation)
  const assignTeams = async (gameId, teamIds) => {
    // Get current assignments
    const { data: currentAssignments } = await supabase
      .from('game_teams')
      .select('team_id')
      .eq('game_id', gameId);

    const currentTeamIds = (currentAssignments || []).map(a => a.team_id);

    // Teams to add (in teamIds but not in current)
    const teamsToAdd = teamIds.filter(id => !currentTeamIds.includes(id));

    // Teams to remove (in current but not in teamIds)
    const teamsToRemove = currentTeamIds.filter(id => !teamIds.includes(id));

    // Remove teams
    if (teamsToRemove.length > 0) {
      const { error: removeError } = await supabase
        .from('game_teams')
        .delete()
        .eq('game_id', gameId)
        .in('team_id', teamsToRemove);

      if (removeError) throw removeError;
    }

    // Add teams
    if (teamsToAdd.length > 0) {
      const newAssignments = teamsToAdd.map(teamId => ({
        game_id: gameId,
        team_id: teamId,
      }));

      const { error: addError } = await supabase
        .from('game_teams')
        .insert(newAssignments);

      if (addError) throw addError;
    }

    await fetchGames();
  };

  // Update a specific team assignment (opponent, result, etc.)
  const updateTeamAssignment = async (assignmentId, data) => {
    const { error } = await supabase
      .from('game_teams')
      .update(data)
      .eq('id', assignmentId);

    if (error) throw error;
    await fetchGames();
  };

  // Remove a team from a game
  const removeTeamFromGame = async (gameId, teamId) => {
    const { error } = await supabase
      .from('game_teams')
      .delete()
      .eq('game_id', gameId)
      .eq('team_id', teamId);

    if (error) throw error;
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
 * Returns games with team assignments for display
 */
export function usePublicGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGames = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error: fetchError } = await supabase
        .from('games')
        .select(`
          *,
          game_teams(
            id,
            team_id,
            opponent,
            is_home_game,
            result,
            team:teams(id, name, grade_level, gender)
          )
        `)
        .gte('date', today)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (fetchError) throw fetchError;
      setGames(data || []);
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
