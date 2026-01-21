import { useState, useEffect, useCallback, useRef } from 'react';

// Cache configuration
const CACHE_KEY = 'tne_teams_cache';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

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
    console.warn('[usePublicTeams] Failed to save cache:', err.message);
  }
}

/**
 * Hook for fetching teams on the public Teams page.
 * Fetches from static JSON files.
 *
 * Features:
 * - Shows cached data immediately for instant load
 * - Refreshes in background if cache is stale
 * - 1 hour cache TTL
 */
export function usePublicTeams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const isBackgroundRefresh = useRef(false);

  /**
   * Fetch fresh data from JSON files
   */
  const fetchFromJSON = useCallback(async () => {
    // Fetch teams and coaches in parallel
    const [teamsResponse, coachesResponse] = await Promise.all([
      fetch('/data/json/teams.json'),
      fetch('/data/json/coaches.json'),
    ]);

    if (!teamsResponse.ok) {
      throw new Error(`Failed to fetch teams: ${teamsResponse.status}`);
    }

    const teamsData = await teamsResponse.json();
    const coachesData = coachesResponse.ok ? await coachesResponse.json() : { coaches: [] };

    // Build coach lookup map
    const coachMap = {};
    (coachesData.coaches || []).forEach(coach => {
      coachMap[coach.id] = coach;
    });

    // Transform teams to match expected format (with head_coach object)
    const transformedTeams = (teamsData.teams || []).map(team => {
      const headCoach = team.head_coach_id ? coachMap[team.head_coach_id] : null;

      return {
        ...team,
        head_coach: headCoach ? {
          id: headCoach.id,
          first_name: headCoach.first_name,
          last_name: headCoach.last_name,
        } : null,
      };
    });

    return {
      teams: transformedTeams,
      version: teamsData.updated_at,
    };
  }, []);

  /**
   * Main fetch function with caching
   */
  const fetchTeams = useCallback(async (forceRefresh = false) => {
    // Check cache first (unless forcing refresh)
    const cached = !forceRefresh ? loadFromCache() : null;

    if (cached?.data && cached.data.length > 0) {
      // Show cached data immediately
      setTeams(cached.data);
      setLoading(false);
      // Set lastUpdated from cache version
      if (cached.version) {
        setLastUpdated(cached.version);
      }
      console.log(`[usePublicTeams] Loaded ${cached.data.length} teams from cache (age: ${Math.round(cached.age / 1000)}s)`);

      // If cache isn't expired, no need to refresh
      if (!cached.isExpired) {
        console.log('[usePublicTeams] Cache is valid, no refresh needed');
        return;
      }

      console.log('[usePublicTeams] Cache expired, refreshing in background...');
      isBackgroundRefresh.current = true;
    } else {
      // No cache, show loading
      setLoading(true);
    }

    setError(null);

    try {
      const { teams: freshTeams, version } = await fetchFromJSON();

      console.log(`[usePublicTeams] Loaded ${freshTeams.length} teams from JSON`);
      setTeams(freshTeams);

      // Set lastUpdated from version timestamp
      if (version) {
        setLastUpdated(version);
      }

      // Save to cache
      if (freshTeams.length > 0) {
        saveToCache(freshTeams, version);
      }
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError(err.message || 'Failed to fetch teams');

      // If we have cached data, keep showing it despite error
      if (!cached?.data || cached.data.length === 0) {
        setTeams([]);
      }
      // Otherwise keep showing cached data
    } finally {
      setLoading(false);
      isBackgroundRefresh.current = false;
    }
  }, [fetchFromJSON]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return { teams, loading, error, refetch: fetchTeams, lastUpdated };
}
