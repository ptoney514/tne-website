import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useCoaches() {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCoaches = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all coaches (admins can see all)
      const { data: coachesData, error: coachesError } = await supabase
        .from('coaches')
        .select('*')
        .order('last_name', { ascending: true });

      if (coachesError) throw coachesError;

      // Fetch team assignments for each coach
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('id, name, grade_level, gender, head_coach_id, assistant_coach_id, season:seasons(id, name, is_active)')
        .eq('is_active', true);

      if (teamsError) throw teamsError;

      // Map team assignments to coaches
      const coachesWithTeams = coachesData?.map((coach) => {
        const assignedTeams = teamsData?.filter(
          (team) => team.head_coach_id === coach.id || team.assistant_coach_id === coach.id
        ).map((team) => ({
          ...team,
          role: team.head_coach_id === coach.id ? 'head' : 'assistant',
        })) || [];

        return {
          ...coach,
          teams: assignedTeams,
          team_count: assignedTeams.length,
        };
      }) || [];

      setCoaches(coachesWithTeams);
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
    const { data, error } = await supabase
      .from('coaches')
      .insert([coachData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    await fetchCoaches();
    return data;
  };

  const updateCoach = async (id, coachData) => {
    const { data, error } = await supabase
      .from('coaches')
      .update(coachData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    await fetchCoaches();
    return data;
  };

  const deleteCoach = async (id) => {
    // First check if coach is assigned to any teams
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('id, name')
      .or(`head_coach_id.eq.${id},assistant_coach_id.eq.${id}`)
      .eq('is_active', true);

    if (teamsError) {
      throw teamsError;
    }

    if (teams && teams.length > 0) {
      throw new Error(`Cannot delete coach. They are assigned to ${teams.length} team(s): ${teams.map(t => t.name).join(', ')}`);
    }

    const { error } = await supabase
      .from('coaches')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    await fetchCoaches();
  };

  const getCoachById = async (id) => {
    const { data, error } = await supabase
      .from('coaches')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  };

  // Get coaching history (all teams across all seasons)
  const getCoachingHistory = async (coachId) => {
    const { data, error } = await supabase
      .from('teams')
      .select(`
        id,
        name,
        grade_level,
        gender,
        head_coach_id,
        assistant_coach_id,
        season:seasons(id, name, start_date, end_date, is_active)
      `)
      .or(`head_coach_id.eq.${coachId},assistant_coach_id.eq.${coachId}`)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Group by season and add role
    const history = data?.map((team) => ({
      ...team,
      role: team.head_coach_id === coachId ? 'Head Coach' : 'Assistant Coach',
    })) || [];

    return history;
  };

  // Get total players coached (unique players across all teams)
  const getPlayersCoached = async (coachId) => {
    // Get all teams this coach has been on
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('id')
      .or(`head_coach_id.eq.${coachId},assistant_coach_id.eq.${coachId}`);

    if (teamsError) {
      throw teamsError;
    }

    if (!teams || teams.length === 0) {
      return 0;
    }

    const teamIds = teams.map((t) => t.id);

    // Get unique players from those teams
    const { data: roster, error: rosterError } = await supabase
      .from('team_roster')
      .select('player_id')
      .in('team_id', teamIds);

    if (rosterError) {
      throw rosterError;
    }

    // Count unique players
    const uniquePlayers = new Set(roster?.map((r) => r.player_id) || []);
    return uniquePlayers.size;
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
