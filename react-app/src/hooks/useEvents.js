import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useSeason } from '../contexts/SeasonContext';

// Set to true to skip Supabase and use sample data (faster for development)
const USE_SAMPLE_DATA = false;

/**
 * Hook for fetching and displaying events on the public schedule page
 */
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
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
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
      const date = event.date || event.event_date;
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

/**
 * Hook for managing events in admin panel (CRUD operations)
 * @param {Object} options - Filter options
 * @param {string} options.eventType - Filter by event type ('practice', 'game', 'tournament', 'tryout', 'other')
 * @param {string} options.teamId - Filter by team ID
 */
export function useAdminEvents({ eventType = null, teamId = null } = {}) {
  const { selectedSeason } = useSeason();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = useCallback(async () => {
    if (!selectedSeason?.id) {
      setEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('events')
        .select(`
          *,
          team:teams(id, name, grade_level, gender)
        `)
        .eq('season_id', selectedSeason.id)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      // Apply filters
      if (eventType) {
        query = query.eq('event_type', eventType);
      }
      if (teamId) {
        query = query.eq('team_id', teamId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setEvents(data || []);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedSeason?.id, eventType, teamId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const createEvent = async (eventData) => {
    const { data, error } = await supabase
      .from('events')
      .insert({
        ...eventData,
        season_id: selectedSeason.id,
      })
      .select(`
        *,
        team:teams(id, name, grade_level, gender)
      `)
      .single();

    if (error) throw error;
    await fetchEvents();
    return data;
  };

  const updateEvent = async (id, eventData) => {
    const { data, error } = await supabase
      .from('events')
      .update(eventData)
      .eq('id', id)
      .select(`
        *,
        team:teams(id, name, grade_level, gender)
      `)
      .single();

    if (error) throw error;
    await fetchEvents();
    return data;
  };

  const deleteEvent = async (id) => {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchEvents();
  };

  return {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    refetch: fetchEvents,
  };
}

/**
 * Hook specifically for tournament events in admin panel
 * Provides tournament-specific filtering and helpers
 */
export function useTournamentEvents() {
  const { events, loading, error, createEvent, updateEvent, deleteEvent, refetch } =
    useAdminEvents({ eventType: 'tournament' });

  // Group tournaments by tournament_name for display
  const groupedTournaments = events.reduce((groups, event) => {
    const name = event.tournament_name || event.title;
    if (!groups[name]) {
      groups[name] = {
        name,
        events: [],
        is_featured: false,
        earliest_date: event.date,
        location: event.location,
        external_url: event.external_url,
      };
    }
    groups[name].events.push(event);
    if (event.is_featured) {
      groups[name].is_featured = true;
    }
    if (event.date < groups[name].earliest_date) {
      groups[name].earliest_date = event.date;
    }
    return groups;
  }, {});

  const tournamentGroups = Object.values(groupedTournaments).sort((a, b) =>
    new Date(a.earliest_date) - new Date(b.earliest_date)
  );

  // Create a tournament event
  const createTournament = async (tournamentData) => {
    return createEvent({
      ...tournamentData,
      event_type: 'tournament',
    });
  };

  return {
    tournaments: events,
    tournamentGroups,
    loading,
    error,
    createTournament,
    updateEvent,
    deleteEvent,
    refetch,
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
      date: formatDate(0),
      start_time: '18:00',
      end_time: '19:30',
      location: 'Monroe MS Gym, Court 1',
      team: { id: '1', name: 'Express United 4th - Foster', grade_level: 4 },
    },
    {
      id: '2',
      event_type: 'practice',
      date: formatDate(0),
      start_time: '18:00',
      end_time: '19:30',
      location: 'Central HS',
      team: { id: '2', name: 'Express United 7th - Mitchell', grade_level: 7 },
    },
    {
      id: '3',
      event_type: 'practice',
      date: formatDate(1),
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
      date: formatDate(5),
      start_time: '14:15',
      end_time: '15:30',
      location: 'Central Fieldhouse',
      opponent: 'Metro Elite',
      team: { id: '1', name: 'Express United 4th - Foster', grade_level: 4 },
    },
    {
      id: '5',
      event_type: 'game',
      date: formatDate(5),
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
    {
      id: '6',
      event_type: 'tournament',
      date: formatDate(12),
      start_time: '08:00',
      end_time: '18:00',
      location: 'Metro Sports Complex',
      tournament_name: 'Winter Classic Invitational',
      is_featured: true,
      external_url: 'https://example.com/winter-classic',
      team: { id: '1', name: 'Express United 4th - Foster', grade_level: 4 },
    },
    {
      id: '7',
      event_type: 'tournament',
      date: formatDate(12),
      start_time: '08:00',
      end_time: '18:00',
      location: 'Metro Sports Complex',
      tournament_name: 'Winter Classic Invitational',
      is_featured: true,
      external_url: 'https://example.com/winter-classic',
      team: { id: '2', name: 'Express United 7th - Mitchell', grade_level: 7 },
    },
  ];
}
