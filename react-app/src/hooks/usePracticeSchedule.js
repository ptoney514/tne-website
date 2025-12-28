import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook for fetching practice schedules for a specific team.
 * Used on the TeamDetailPage.
 * No authentication required (public read via RLS).
 */
export function usePracticeSchedule(teamId) {
  const [practices, setPractices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!teamId) {
      setLoading(false);
      return;
    }

    const fetchPractices = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch practice sessions linked to this team
        const { data, error: fetchError } = await supabase
          .from('practice_session_teams')
          .select(`
            id,
            practice_session:practice_sessions!inner(
              id,
              day_of_week,
              start_time,
              end_time,
              location,
              address,
              notes,
              is_active
            )
          `)
          .eq('team_id', teamId)
          .eq('practice_sessions.is_active', true);

        if (fetchError) {
          throw fetchError;
        }

        // Extract practice sessions and sort by day of week
        const dayOrder = {
          Monday: 1,
          Tuesday: 2,
          Wednesday: 3,
          Thursday: 4,
          Friday: 5,
          Saturday: 6,
          Sunday: 7,
        };

        const practiceList = (data || [])
          .map((p) => p.practice_session)
          .sort((a, b) => {
            const dayDiff = dayOrder[a.day_of_week] - dayOrder[b.day_of_week];
            if (dayDiff !== 0) return dayDiff;
            return a.start_time.localeCompare(b.start_time);
          });

        setPractices(practiceList);
      } catch (err) {
        console.error('Error fetching practice schedule:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPractices();
  }, [teamId]);

  return { practices, loading, error };
}

/**
 * Format time from HH:MM:SS to readable format (e.g., "6:00 PM")
 */
export function formatPracticeTime(timeStr) {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours, 10);
  const m = minutes;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
}

/**
 * Format practice session for display
 * Returns: "Mon 6:00-7:30 PM at Monroe MS"
 */
export function formatPracticeSession(practice) {
  const dayShort = practice.day_of_week.slice(0, 3);
  const startTime = formatPracticeTime(practice.start_time);
  const endTime = formatPracticeTime(practice.end_time);

  // Remove duplicate AM/PM if both times are same period
  const startPeriod = startTime.slice(-2);
  const endPeriod = endTime.slice(-2);
  const startDisplay = startPeriod === endPeriod
    ? startTime.slice(0, -3)
    : startTime;

  return `${dayShort} ${startDisplay}-${endTime} at ${practice.location}`;
}
