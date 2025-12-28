import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook for fetching a single team's details including roster and schedule.
 * Used on the TeamDetailPage.
 * No authentication required (public read via RLS).
 */
export function usePublicTeamDetail(teamId) {
  const [team, setTeam] = useState(null);
  const [roster, setRoster] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!teamId) {
      setLoading(false);
      return;
    }

    const fetchTeamDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Fetch team with coaches
        const { data: teamData, error: teamError } = await supabase
          .from('teams')
          .select(`
            *,
            head_coach:coaches!teams_head_coach_id_fkey(
              id,
              first_name,
              last_name,
              bio,
              email,
              phone
            ),
            assistant_coach:coaches!teams_assistant_coach_id_fkey(
              id,
              first_name,
              last_name
            ),
            season:seasons(id, name, is_active)
          `)
          .eq('id', teamId)
          .single();

        if (teamError) {
          throw teamError;
        }

        setTeam(teamData);

        // 2. Fetch roster (active players only)
        const { data: rosterData, error: rosterError } = await supabase
          .from('team_roster')
          .select(`
            id,
            jersey_number,
            position,
            player:players(
              id,
              first_name,
              last_name,
              graduating_year,
              jersey_number,
              position
            )
          `)
          .eq('team_id', teamId)
          .eq('is_active', true);

        if (rosterError) {
          console.error('Error fetching roster:', rosterError);
        } else {
          // Sort by jersey number, then by name
          const sortedRoster = (rosterData || []).sort((a, b) => {
            const numA = a.jersey_number || a.player?.jersey_number || 999;
            const numB = b.jersey_number || b.player?.jersey_number || 999;
            if (numA !== numB) return numA - numB;
            return (a.player?.last_name || '').localeCompare(b.player?.last_name || '');
          });
          setRoster(sortedRoster);
        }

        // 3. Fetch upcoming games/schedule for this team
        const today = new Date().toISOString().split('T')[0];
        const { data: gamesData, error: gamesError } = await supabase
          .from('game_teams')
          .select(`
            id,
            opponent,
            is_home_game,
            result,
            game:games(
              id,
              game_type,
              name,
              date,
              start_time,
              end_time,
              location,
              notes
            )
          `)
          .eq('team_id', teamId)
          .gte('games.date', today)
          .order('games(date)', { ascending: true })
          .limit(10);

        if (gamesError) {
          console.error('Error fetching schedule:', gamesError);
        } else {
          // Filter out null games (from the gte filter) and sort
          const validGames = (gamesData || [])
            .filter(g => g.game !== null)
            .sort((a, b) => {
              const dateA = new Date(a.game.date);
              const dateB = new Date(b.game.date);
              return dateA - dateB;
            });
          setSchedule(validGames);
        }

      } catch (err) {
        console.error('Error fetching team detail:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamDetail();
  }, [teamId]);

  return { team, roster, schedule, loading, error };
}
