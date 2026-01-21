import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useTeams() {
  const [teams, setTeams] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch teams with related data
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select(`
          *,
          season:seasons(id, name),
          head_coach:coaches!teams_head_coach_id_fkey(id, first_name, last_name),
          assistant_coach:coaches!teams_assistant_coach_id_fkey(id, first_name, last_name)
        `)
        .order('grade_level', { ascending: true });

      if (teamsError) throw teamsError;

      // Fetch roster counts for each team
      const { data: rosterCounts, error: rosterError } = await supabase
        .from('team_roster')
        .select('team_id')
        .eq('is_active', true);

      if (rosterError) throw rosterError;

      // Count players per team
      const countMap = {};
      rosterCounts?.forEach((r) => {
        countMap[r.team_id] = (countMap[r.team_id] || 0) + 1;
      });

      // Add player counts to teams
      const teamsWithCounts = teamsData?.map((team) => ({
        ...team,
        player_count: countMap[team.id] || 0,
      })) || [];

      setTeams(teamsWithCounts);
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSeasons = useCallback(async () => {
    const { data, error } = await supabase
      .from('seasons')
      .select('*')
      .order('start_date', { ascending: false });

    if (error) {
      console.error('Error fetching seasons:', error);
      return;
    }
    setSeasons(data || []);
  }, []);

  const fetchCoaches = useCallback(async () => {
    const { data, error } = await supabase
      .from('coaches')
      .select('*')
      .eq('is_active', true)
      .order('last_name', { ascending: true });

    if (error) {
      console.error('Error fetching coaches:', error);
      return;
    }
    setCoaches(data || []);
  }, []);

  useEffect(() => {
    fetchTeams();
    fetchSeasons();
    fetchCoaches();
  }, [fetchTeams, fetchSeasons, fetchCoaches]);

  const createTeam = async (teamData) => {
    const { data, error } = await supabase
      .from('teams')
      .insert([teamData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    await fetchTeams();
    return data;
  };

  const updateTeam = async (id, teamData) => {
    const { data, error } = await supabase
      .from('teams')
      .update(teamData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    await fetchTeams();
    return data;
  };

  const deleteTeam = async (id) => {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

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
