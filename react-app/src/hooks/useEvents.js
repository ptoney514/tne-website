import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, withTimeout } from '../lib/supabase';
import { useSeason } from '../contexts/SeasonContext';

// Set to true to skip Supabase and use sample data (faster for development)
const USE_SAMPLE_DATA = false;

// Cache configuration
const CACHE_KEY = 'tne_schedule_cache';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Get the latest updated_at timestamp from the games table
 * Used for cache invalidation when admin makes changes
 */
async function getScheduleVersion() {
  try {
    const { data, error } = await withTimeout(
      supabase
        .from('games')
        .select('updated_at')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single(),
      5000,
      'Version check timed out'
    );

    if (error || !data) return null;
    return data.updated_at;
  } catch {
    return null;
  }
}

/**
 * Load cached data from localStorage
 */
function loadFromCache() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp, version } = JSON.parse(cached);
    const age = Date.now() - timestamp;

    // Return cache info including whether it's expired
    return {
      data,
      version,
      isExpired: age > CACHE_TTL,
      age,
    };
  } catch {
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
}

/**
 * Save data to localStorage cache
 */
function saveToCache(data, version) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now(),
      version,
    }));
  } catch (err) {
    console.warn('[useEvents] Failed to save cache:', err.message);
  }
}

/**
 * Hook for fetching and displaying events on the public schedule page
 * Fetches from both 'events' table (practices/tryouts) and 'games' table (games/tournaments)
 *
 * Features:
 * - Shows cached data immediately for instant load
 * - Refreshes in background if cache is stale or version changed
 * - 1 hour cache TTL with smart invalidation on admin changes
 */
export function useEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isBackgroundRefresh = useRef(false);

  /**
   * Fetch fresh data from Supabase
   */
  const fetchFromSupabase = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];

    // Fetch from both tables in parallel (with 10s timeout to prevent infinite loading)
    const [eventsResult, gamesResult] = await withTimeout(
      Promise.all([
        // Fetch practices/tryouts from events table
        supabase
          .from('events')
          .select(`
            *,
            team:teams(id, name, grade_level)
          `)
          .gte('date', today)
          .order('date', { ascending: true })
          .order('start_time', { ascending: true }),

        // Fetch tournaments only from games table (exclude league games)
        supabase
          .from('games')
          .select(`
            *,
            game_teams(
              id,
              team_id,
              opponent,
              is_home_game,
              result,
              team:teams(id, name, grade_level, gender)
            )
          `)
          .eq('game_type', 'tournament') // Only fetch tournaments, not league games
          .gte('date', today)
          .order('date', { ascending: true })
          .order('start_time', { ascending: true }),
      ]),
      10000,
      'Schedule data request timed out'
    );

    if (eventsResult.error) {
      console.error('Error fetching events:', eventsResult.error);
    }
    if (gamesResult.error) {
      console.error('Error fetching games:', gamesResult.error);
    }

    // Convert games to event-like format for unified display
    const eventsData = eventsResult.data || [];
    const gamesData = (gamesResult.data || []).map(game => ({
      id: game.id,
      event_type: game.game_type, // 'game' or 'tournament'
      date: game.date,
      start_time: game.start_time,
      end_time: game.end_time,
      location: game.location,
      address: game.address,
      notes: game.notes,
      is_featured: game.is_featured,
      external_url: game.external_url,
      // For games, use the first team's info or show as multi-team event
      team: game.game_teams?.[0]?.team || null,
      opponent: game.game_teams?.[0]?.opponent || null,
      // Keep original game data for tournaments display
      game_teams: game.game_teams,
      name: game.name,
      tournament_name: game.game_type === 'tournament' ? game.name : null,
    }));

    // Combine and sort by date/time
    const allEvents = [...eventsData, ...gamesData].sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return (a.start_time || '').localeCompare(b.start_time || '');
    });

    return { events: allEvents, eventsCount: eventsData.length, gamesCount: gamesData.length };
  }, []);

  /**
   * Main fetch function with caching
   */
  const fetchEvents = useCallback(async (forceRefresh = false) => {
    // Use sample data for development (instant load)
    if (USE_SAMPLE_DATA) {
      setEvents(getSampleEvents());
      setLoading(false);
      return;
    }

    // Check cache first (unless forcing refresh)
    const cached = !forceRefresh ? loadFromCache() : null;

    if (cached?.data && cached.data.length > 0) {
      // Show cached data immediately
      setEvents(cached.data);
      setLoading(false);
      console.log(`[useEvents] Loaded ${cached.data.length} events from cache (age: ${Math.round(cached.age / 1000)}s)`);

      // If cache isn't expired, check version in background
      if (!cached.isExpired) {
        isBackgroundRefresh.current = true;

        // Check if version changed (admin made updates)
        const currentVersion = await getScheduleVersion();
        if (currentVersion && currentVersion !== cached.version) {
          console.log('[useEvents] Version changed, refreshing data...');
        } else {
          // Cache is still valid
          console.log('[useEvents] Cache is valid, no refresh needed');
          isBackgroundRefresh.current = false;
          return;
        }
      } else {
        console.log('[useEvents] Cache expired, refreshing in background...');
        isBackgroundRefresh.current = true;
      }
    } else {
      // No cache, show loading
      setLoading(true);
    }

    setError(null);

    try {
      const { events: freshEvents, eventsCount, gamesCount } = await fetchFromSupabase();
      const version = await getScheduleVersion();

      // If no data returned, use sample data
      if (freshEvents.length === 0) {
        console.log('[useEvents] No events in database, using sample data');
        setEvents(getSampleEvents());
      } else {
        console.log(`[useEvents] Loaded ${eventsCount} events + ${gamesCount} tournaments from Supabase`);
        setEvents(freshEvents);

        // Save to cache
        saveToCache(freshEvents, version);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.message || 'Failed to fetch events');

      // If we don't have cached data, use sample data as fallback
      if (!cached?.data || cached.data.length === 0) {
        setEvents(getSampleEvents());
      }
      // Otherwise keep showing cached data
    } finally {
      setLoading(false);
      isBackgroundRefresh.current = false;
    }
  }, [fetchFromSupabase]);

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
