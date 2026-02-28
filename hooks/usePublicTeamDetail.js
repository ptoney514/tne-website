import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';

/**
 * Hook for fetching a single team's details including coach info, roster,
 * schedule, and practice sessions.
 * Fetches from API endpoints in parallel.
 */
export function usePublicTeamDetail(teamId) {
  const [team, setTeam] = useState(null);
  const [roster, setRoster] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [practices, setPractices] = useState([]);
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
        // Fetch team detail, schedule, and practices in parallel
        const [teamData, scheduleData, practiceData] = await Promise.all([
          api.get(`/public/teams/${teamId}`),
          api.get(`/public/schedule?teamId=${teamId}&limit=10`).catch(() => []),
          api.get(`/public/practice-schedule?teamId=${teamId}`).catch(() => []),
        ]);

        setTeam(teamData);
        setRoster(teamData.roster || []);
        setSchedule(scheduleData || []);
        setPractices(practiceData || []);
      } catch (err) {
        console.error('Error fetching team detail:', err);
        setError(err.message || 'Failed to load team');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamDetail();
  }, [teamId]);

  return { team, roster, schedule, practices, loading, error };
}
