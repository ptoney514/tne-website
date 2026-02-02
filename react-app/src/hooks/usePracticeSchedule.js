import { useState, useEffect } from 'react';
import { api } from '../lib/api-client';

/**
 * Hook for fetching practice schedules for a specific team.
 * Used on the TeamDetailPage.
 * No authentication required (public read).
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
        const data = await api.get(`/public/practice-schedule?teamId=${teamId}`);

        // Sort by day of week
        const dayOrder = {
          Monday: 1,
          monday: 1,
          Tuesday: 2,
          tuesday: 2,
          Wednesday: 3,
          wednesday: 3,
          Thursday: 4,
          thursday: 4,
          Friday: 5,
          friday: 5,
          Saturday: 6,
          saturday: 6,
          Sunday: 7,
          sunday: 7,
        };

        const practiceList = (data || []).sort((a, b) => {
          const dayDiff = (dayOrder[a.dayOfWeek] || dayOrder[a.day_of_week] || 8) -
                         (dayOrder[b.dayOfWeek] || dayOrder[b.day_of_week] || 8);
          if (dayDiff !== 0) return dayDiff;
          const startA = a.startTime || a.start_time || '';
          const startB = b.startTime || b.start_time || '';
          return startA.localeCompare(startB);
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
  const dayOfWeek = practice.dayOfWeek || practice.day_of_week || '';
  const dayShort = dayOfWeek.slice(0, 3);
  const startTime = formatPracticeTime(practice.startTime || practice.start_time);
  const endTime = formatPracticeTime(practice.endTime || practice.end_time);
  const location = practice.location || '';

  // Remove duplicate AM/PM if both times are same period
  const startPeriod = startTime.slice(-2);
  const endPeriod = endTime.slice(-2);
  const startDisplay = startPeriod === endPeriod
    ? startTime.slice(0, -3)
    : startTime;

  return `${dayShort} ${startDisplay}-${endTime} at ${location}`;
}
