import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook for fetching teams on the public Teams page.
 * Fetches only active teams from the active season.
 * No authentication required (public read via RLS).
 */
export function usePublicTeams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);
      setError(null);

      try {
        // First get active season
        const { data: activeSeason, error: seasonError } = await supabase
          .from('seasons')
          .select('id, name')
          .eq('is_active', true)
          .single();

        if (seasonError) {
          throw seasonError;
        }

        if (!activeSeason) {
          setTeams([]);
          return;
        }

        // Then get teams for that season
        const { data, error: fetchError } = await supabase
          .from('teams')
          .select(`
            id,
            name,
            grade_level,
            gender,
            tier,
            practice_location,
            practice_days,
            practice_time,
            head_coach:coaches!teams_head_coach_id_fkey(id, first_name, last_name)
          `)
          .eq('is_active', true)
          .eq('season_id', activeSeason.id)
          .order('grade_level', { ascending: true });

        if (fetchError) {
          throw fetchError;
        }

        // Fetch player counts for each team
        const teamIds = data?.map(t => t.id) || [];

        let countMap = {};
        if (teamIds.length > 0) {
          const { data: rosterCounts } = await supabase
            .from('team_roster')
            .select('team_id')
            .in('team_id', teamIds)
            .eq('is_active', true);

          rosterCounts?.forEach((r) => {
            countMap[r.team_id] = (countMap[r.team_id] || 0) + 1;
          });
        }

        // Add player counts to teams
        const teamsWithCounts = data?.map((team) => ({
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
    };

    fetchTeams();
  }, []);

  return { teams, loading, error };
}
