import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// Set to true to skip Supabase and use sample data (faster for development)
const USE_SAMPLE_DATA = true;

export function useEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Use sample data for development (instant load)
    if (USE_SAMPLE_DATA) {
      setEvents(getSampleEvents());
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('events')
        .select(`
          *,
          team:teams(id, name, grade_level)
        `)
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('event_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (fetchError) throw fetchError;

      // If no data returned, use sample data
      if (!data || data.length === 0) {
        console.log('[useEvents] No events in database, using sample data');
        setEvents(getSampleEvents());
      } else {
        setEvents(data);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.message || 'Failed to fetch events');
      // Return sample data for now if Supabase fetch fails
      setEvents(getSampleEvents());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filterByType = useCallback(
    (type) => {
      if (type === 'all') return events;
      return events.filter((event) => event.event_type === type);
    },
    [events]
  );

  const filterByTeam = useCallback(
    (teamId) => {
      if (teamId === 'all') return events;
      return events.filter((event) => event.team_id === teamId);
    },
    [events]
  );

  const groupByDate = useCallback((eventsList) => {
    const grouped = {};
    eventsList.forEach((event) => {
      const date = event.event_date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(event);
    });
    return grouped;
  }, []);

  return {
    events,
    loading,
    error,
    refetch: fetchEvents,
    filterByType,
    filterByTeam,
    groupByDate,
  };
}

// Sample data for development/fallback
function getSampleEvents() {
  const today = new Date();
  const formatDate = (daysOffset) => {
    const date = new Date(today);
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split('T')[0];
  };

  return [
    {
      id: '1',
      event_type: 'practice',
      event_date: formatDate(0),
      start_time: '18:00',
      end_time: '19:30',
      location: 'Monroe MS Gym, Court 1',
      team: { id: '1', name: 'Express United 4th - Foster', grade_level: 4 },
    },
    {
      id: '2',
      event_type: 'practice',
      event_date: formatDate(0),
      start_time: '18:00',
      end_time: '19:30',
      location: 'Central HS',
      team: { id: '2', name: 'Express United 7th - Mitchell', grade_level: 7 },
    },
    {
      id: '3',
      event_type: 'practice',
      event_date: formatDate(1),
      start_time: '18:00',
      end_time: '19:30',
      location: 'Northwest HS',
      team: {
        id: '3',
        name: 'Express United 4th - Grisby/Evans',
        grade_level: 4,
      },
    },
    {
      id: '4',
      event_type: 'game',
      event_date: formatDate(5),
      start_time: '14:15',
      end_time: '15:30',
      location: 'Central Fieldhouse',
      opponent: 'Metro Elite',
      team: { id: '1', name: 'Express United 4th - Foster', grade_level: 4 },
    },
    {
      id: '5',
      event_type: 'game',
      event_date: formatDate(5),
      start_time: '16:30',
      end_time: '17:45',
      location: 'Central Fieldhouse',
      opponent: 'Rocket Stars',
      team: {
        id: '3',
        name: 'Express United 4th - Grisby/Evans',
        grade_level: 4,
      },
    },
  ];
}
