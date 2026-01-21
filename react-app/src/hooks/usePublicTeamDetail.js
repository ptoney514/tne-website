import { useState, useEffect } from 'react';

/**
 * Hook for fetching a single team's details including coach info, roster, and schedule.
 * Used on the TeamDetailPage.
 * Fetches from static JSON files.
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
        // Fetch teams, coaches, schedule, and rosters in parallel
        const [teamsResponse, coachesResponse, scheduleResponse, rostersResponse] = await Promise.all([
          fetch('/data/json/teams.json'),
          fetch('/data/json/coaches.json'),
          fetch('/data/json/schedule.json'),
          fetch('/data/json/rosters.json'),
        ]);

        if (!teamsResponse.ok) {
          throw new Error(`Failed to fetch teams: ${teamsResponse.status}`);
        }

        const teamsData = await teamsResponse.json();
        const coachesData = coachesResponse.ok ? await coachesResponse.json() : { coaches: [] };
        const scheduleData = scheduleResponse.ok ? await scheduleResponse.json() : { events: [] };
        const rostersData = rostersResponse.ok ? await rostersResponse.json() : { rosters: [] };

        // Build coach lookup map
        const coachMap = {};
        (coachesData.coaches || []).forEach(coach => {
          coachMap[coach.id] = coach;
        });

        // Find the requested team
        const teamData = (teamsData.teams || []).find(t => t.id === teamId);

        if (!teamData) {
          throw new Error('Team not found');
        }

        // Build team object with coach info
        const headCoach = teamData.head_coach_id ? coachMap[teamData.head_coach_id] : null;
        const assistantCoach = teamData.assistant_coach_id ? coachMap[teamData.assistant_coach_id] : null;

        const enrichedTeam = {
          ...teamData,
          head_coach: headCoach ? {
            id: headCoach.id,
            first_name: headCoach.first_name,
            last_name: headCoach.last_name,
            bio: headCoach.bio,
            email: headCoach.email,
            phone: headCoach.phone,
          } : null,
          assistant_coach: assistantCoach ? {
            id: assistantCoach.id,
            first_name: assistantCoach.first_name,
            last_name: assistantCoach.last_name,
          } : null,
          season: {
            id: teamsData.season?.id,
            name: teamsData.season?.name,
            is_active: true,
          },
        };

        setTeam(enrichedTeam);

        // Find roster for this team
        const teamRoster = (rostersData.rosters || []).find(r => r.team_id === teamId);
        if (teamRoster && teamRoster.players) {
          // Transform to expected format: { id, jersey_number, player: { first_name, last_name, jersey_number, graduating_year } }
          const formattedRoster = teamRoster.players.map(p => ({
            id: p.id,
            jersey_number: p.jersey_number,
            player: {
              first_name: p.first_name,
              last_name: p.last_name,
              jersey_number: p.jersey_number,
              graduating_year: p.graduating_year,
            },
          }));
          setRoster(formattedRoster);
        } else {
          setRoster([]);
        }

        // Filter schedule events for this team's gender or "both"
        const today = new Date().toISOString().split('T')[0];
        const teamGender = teamData.gender;

        const relevantEvents = (scheduleData.events || [])
          .filter(event => {
            // Filter by date (upcoming only)
            if (event.date < today) return false;

            // Filter by gender
            if (event.gender === 'both' || event.gender === teamGender) return true;

            // Check if team is explicitly assigned
            if (event.team_ids && event.team_ids.includes(teamId)) return true;

            return false;
          })
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 10) // Limit to 10 upcoming events
          .map(event => ({
            id: event.id,
            opponent: null,
            is_home_game: false,
            result: null,
            game: {
              id: event.id,
              game_type: event.game_type,
              name: event.name,
              date: event.date,
              start_time: event.start_time,
              end_time: event.end_time || event.end_date,
              location: event.location,
              notes: event.notes,
            },
          }));

        setSchedule(relevantEvents);

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
