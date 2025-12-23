import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function usePlayers() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPlayers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch players with parent info
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select(`
          *,
          primary_parent:parents!players_primary_parent_id_fkey(id, first_name, last_name, email, phone)
        `)
        .order('last_name', { ascending: true });

      if (playersError) throw playersError;

      // Fetch team assignments for each player with payment status
      const { data: rosterData, error: rosterError } = await supabase
        .from('team_roster')
        .select(`
          player_id,
          payment_status,
          team:teams(id, name, grade_level)
        `)
        .eq('is_active', true);

      if (rosterError) throw rosterError;

      // Map team assignments to players
      const teamMap = {};
      const paymentMap = {};
      rosterData?.forEach((r) => {
        if (!teamMap[r.player_id]) {
          teamMap[r.player_id] = [];
        }
        teamMap[r.player_id].push(r.team);
        // Use the most "urgent" payment status (pending > partial > paid > waived)
        const priority = { pending: 0, partial: 1, paid: 2, waived: 3 };
        const current = paymentMap[r.player_id];
        if (!current || priority[r.payment_status] < priority[current]) {
          paymentMap[r.player_id] = r.payment_status;
        }
      });

      // Add team info to players
      const playersWithTeams = playersData?.map((player) => ({
        ...player,
        teams: teamMap[player.id] || [],
        payment_status: paymentMap[player.id] || null,
      })) || [];

      setPlayers(playersWithTeams);
    } catch (err) {
      console.error('Error fetching players:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTeams = useCallback(async () => {
    const { data, error } = await supabase
      .from('teams')
      .select('id, name, grade_level')
      .order('grade_level', { ascending: true });

    if (error) {
      console.error('Error fetching teams:', error);
      return;
    }
    setTeams(data || []);
  }, []);

  useEffect(() => {
    fetchPlayers();
    fetchTeams();
  }, [fetchPlayers, fetchTeams]);

  const createPlayer = async (playerData) => {
    const { data, error } = await supabase
      .from('players')
      .insert([playerData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    await fetchPlayers();
    return data;
  };

  const updatePlayer = async (id, playerData) => {
    const { data, error } = await supabase
      .from('players')
      .update(playerData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    await fetchPlayers();
    return data;
  };

  const deletePlayer = async (id) => {
    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    await fetchPlayers();
  };

  /**
   * Get player's team history across all seasons
   * @param {string} playerId
   * @returns {Promise<Array>} Array of roster entries with team and season info
   */
  const getPlayerHistory = useCallback(async (playerId) => {
    if (!playerId) return [];

    const { data, error } = await supabase
      .from('team_roster')
      .select(`
        id,
        jersey_number,
        position,
        payment_status,
        joined_date,
        team:teams(
          id,
          name,
          grade_level,
          season:seasons(id, name, is_active)
        )
      `)
      .eq('player_id', playerId)
      .order('joined_date', { ascending: false });

    if (error) {
      console.error('Error fetching player history:', error);
      return [];
    }

    // Flatten the season data
    return (data || []).map((entry) => ({
      ...entry,
      season: entry.team?.season,
    }));
  }, []);

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
      // Get current roster with player and parent data
      const { data: rosterData, error: rosterError } = await supabase
        .from('team_roster')
        .select(`
          *,
          player:players(
            *,
            primary_parent:parents!players_primary_parent_id_fkey(
              id, first_name, last_name, phone, email
            )
          )
        `)
        .eq('team_id', teamId)
        .eq('is_active', true);

      if (rosterError) throw rosterError;

      setRoster(rosterData || []);

      // Get players not on this team
      const rosterPlayerIds = rosterData?.map((r) => r.player_id) || [];

      let query = supabase
        .from('players')
        .select('*')
        .order('last_name', { ascending: true });

      if (rosterPlayerIds.length > 0) {
        query = query.not('id', 'in', `(${rosterPlayerIds.join(',')})`);
      }

      const { data: availableData, error: availableError } = await query;

      if (availableError) throw availableError;

      setAvailablePlayers(availableData || []);
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
    const { error } = await supabase
      .from('team_roster')
      .insert([{
        team_id: teamId,
        player_id: playerId,
        joined_date: new Date().toISOString().split('T')[0],
        is_active: true,
        payment_status: 'pending',
        ...rosterData,
      }]);

    if (error) {
      throw error;
    }

    await fetchRoster();
  };

  const removeFromRoster = async (rosterId) => {
    const { error } = await supabase
      .from('team_roster')
      .update({ is_active: false })
      .eq('id', rosterId);

    if (error) {
      throw error;
    }

    await fetchRoster();
  };

  const updateRosterEntry = async (rosterId, data) => {
    const { error } = await supabase
      .from('team_roster')
      .update(data)
      .eq('id', rosterId);

    if (error) {
      throw error;
    }

    await fetchRoster();
  };

  /**
   * Bulk add players to roster (for Quick Add feature)
   * Creates new player records if needed, then adds them to the roster
   * @param {Array} players - Array of { firstName, lastName, jerseyNumber, position }
   * @param {Object} teamData - Team data with grade_level, gender for new players
   * @returns {Object} Results with added count and any errors
   */
  const bulkAddToRoster = async (players, teamData = {}) => {
    const results = {
      added: 0,
      errors: [],
    };

    for (const player of players) {
      try {
        // Create the player record
        const { data: newPlayer, error: playerError } = await supabase
          .from('players')
          .insert([{
            first_name: player.firstName,
            last_name: player.lastName || '',
            current_grade: teamData.grade_level || '',
            gender: teamData.gender || 'male',
            graduating_year: calculateGraduatingYear(teamData.grade_level),
            date_of_birth: '2015-01-01', // Placeholder - needs parent input later
            jersey_number: player.jerseyNumber || null,
            position: player.position || null,
          }])
          .select()
          .single();

        if (playerError) throw playerError;

        // Add to roster
        const { error: rosterError } = await supabase
          .from('team_roster')
          .insert([{
            team_id: teamId,
            player_id: newPlayer.id,
            jersey_number: player.jerseyNumber || null,
            position: player.position || null,
            joined_date: new Date().toISOString().split('T')[0],
            is_active: true,
            payment_status: 'pending',
          }]);

        if (rosterError) throw rosterError;

        results.added++;
      } catch (err) {
        console.error(`Error adding player ${player.firstName} ${player.lastName}:`, err);
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

/**
 * Calculate graduating year based on current grade
 * Assumes current school year (e.g., 5th grader in 2025 graduates 2032)
 */
function calculateGraduatingYear(gradeLevel) {
  if (!gradeLevel) return new Date().getFullYear() + 7;

  const gradeNum = parseInt(gradeLevel.replace(/\D/g, ''), 10);
  if (isNaN(gradeNum)) return new Date().getFullYear() + 7;

  // Years until 12th grade graduation
  const yearsUntilGraduation = 12 - gradeNum;
  return new Date().getFullYear() + yearsUntilGraduation;
}
