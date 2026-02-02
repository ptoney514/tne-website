import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../lib/api-client';
import { useSeason } from '../contexts/SeasonContext';

// Cache configuration
const CACHE_KEY = 'tne_schedule_cache';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Load cached data from localStorage
 */
function loadFromCache() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const age = Date.now() - timestamp;

    return {
      data,
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
function saveToCache(data) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    );
  } catch (err) {
    console.warn('[useEvents] Failed to save cache:', err.message);
  }
}

/**
 * Hook for fetching and displaying events on the public schedule page
 * Features:
 * - Shows cached data immediately for instant load
 * - Refreshes in background if cache is stale
 * - 1 hour cache TTL
 */
export function useEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isBackgroundRefresh = useRef(false);

  const fetchFromAPI = useCallback(async () => {
    const data = await api.get('/public/schedule');
    return data || [];
  }, []);

  const fetchEvents = useCallback(
    async (forceRefresh = false) => {
      // Check cache first (unless forcing refresh)
      const cached = !forceRefresh ? loadFromCache() : null;

      if (cached?.data && cached.data.length > 0) {
        // Show cached data immediately
        setEvents(cached.data);
        setLoading(false);
        console.log(
          `[useEvents] Loaded ${cached.data.length} events from cache (age: ${Math.round(cached.age / 1000)}s)`
        );

        // If cache isn't expired, skip refresh
        if (!cached.isExpired) {
          console.log('[useEvents] Cache is valid, no refresh needed');
          return;
        }

        // Refresh in background
        console.log('[useEvents] Cache expired, refreshing in background...');
        isBackgroundRefresh.current = true;
      } else {
        // No cache, show loading
        setLoading(true);
      }

      setError(null);

      try {
        const freshEvents = await fetchFromAPI();
        console.log(`[useEvents] Loaded ${freshEvents.length} events from API`);
        setEvents(freshEvents);
        saveToCache(freshEvents);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err.message || 'Failed to fetch events');
        // Keep showing cached data if available
        if (!cached?.data || cached.data.length === 0) {
          setEvents(getSampleEvents());
        }
      } finally {
        setLoading(false);
        isBackgroundRefresh.current = false;
      }
    },
    [fetchFromAPI]
  );

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
      const params = new URLSearchParams();
      params.append('seasonId', selectedSeason.id);
      if (eventType) params.append('eventType', eventType);
      if (teamId) params.append('teamId', teamId);

      const data = await api.get(`/admin/events?${params.toString()}`);
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
    const data = await api.post('/admin/events', {
      ...eventData,
      season_id: selectedSeason.id,
    });
    await fetchEvents();
    return data;
  };

  const updateEvent = async (id, eventData) => {
    const data = await api.patch(`/admin/events?id=${id}`, eventData);
    await fetchEvents();
    return data;
  };

  const deleteEvent = async (id) => {
    await api.delete(`/admin/events?id=${id}`);
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
 */
export function useTournamentEvents() {
  const {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    refetch,
  } = useAdminEvents({ eventType: 'tournament' });

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

  const tournamentGroups = Object.values(groupedTournaments).sort(
    (a, b) => new Date(a.earliest_date) - new Date(b.earliest_date)
  );

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
      event_type: 'game',
      date: formatDate(5),
      start_time: '14:15',
      end_time: '15:30',
      location: 'Central Fieldhouse',
      opponent: 'Metro Elite',
      team: { id: '1', name: 'Express United 4th - Foster', grade_level: 4 },
    },
  ];
}
