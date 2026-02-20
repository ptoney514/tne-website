import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../lib/api-client';

// Cache configuration
const CACHE_KEY_PREFIX = 'tne_teams_cache';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Get the cache key for a given seasonId
 */
function getCacheKey(seasonId) {
  return seasonId ? `${CACHE_KEY_PREFIX}_${seasonId}` : CACHE_KEY_PREFIX;
}

/**
 * Load cached data from localStorage
 */
function loadFromCache(seasonId) {
  try {
    const cached = localStorage.getItem(getCacheKey(seasonId));
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const age = Date.now() - timestamp;

    return {
      data,
      isExpired: age > CACHE_TTL,
      age,
    };
  } catch {
    localStorage.removeItem(getCacheKey(seasonId));
    return null;
  }
}

/**
 * Save data to localStorage cache
 */
function saveToCache(seasonId, data) {
  try {
    localStorage.setItem(
      getCacheKey(seasonId),
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    );
  } catch (err) {
    console.warn('[usePublicTeams] Failed to save cache:', err.message);
  }
}

/**
 * Hook for fetching teams on the public Teams page.
 * Uses the public API with caching for performance.
 *
 * Features:
 * - Shows cached data immediately for instant load
 * - Refreshes in background if cache is stale
 * - 1 hour cache TTL per season
 * - Falls back to JSON files if API fails
 *
 * @param {string|null|undefined} seasonId - Season UUID to filter by. null = fetch all teams. undefined = don't fetch yet.
 */
export function usePublicTeams(seasonId) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const isBackgroundRefresh = useRef(false);

  /**
   * Fetch from API
   */
  const fetchFromAPI = useCallback(async () => {
    const path = seasonId ? `/public/teams?seasonId=${seasonId}` : '/public/teams';
    const data = await api.get(path);
    return data || [];
  }, [seasonId]);

  /**
   * Fallback to JSON files if API fails
   */
  const fetchFromJSON = useCallback(async () => {
    const [teamsResponse, coachesResponse] = await Promise.all([
      fetch('/data/json/teams.json'),
      fetch('/data/json/coaches.json'),
    ]);

    if (!teamsResponse.ok) {
      throw new Error(`Failed to fetch teams: ${teamsResponse.status}`);
    }

    const teamsData = await teamsResponse.json();
    const coachesData = coachesResponse.ok
      ? await coachesResponse.json()
      : { coaches: [] };

    const coachMap = {};
    (coachesData.coaches || []).forEach((coach) => {
      coachMap[coach.id] = coach;
    });

    return (teamsData.teams || []).map((team) => {
      const headCoach = team.head_coach_id ? coachMap[team.head_coach_id] : null;
      return {
        ...team,
        head_coach: headCoach
          ? {
              id: headCoach.id,
              first_name: headCoach.first_name,
              last_name: headCoach.last_name,
            }
          : null,
      };
    });
  }, []);

  /**
   * Main fetch function with caching
   */
  const fetchTeams = useCallback(
    async (forceRefresh = false) => {
      if (seasonId === undefined) return;

      const cached = !forceRefresh ? loadFromCache(seasonId) : null;

      if (cached?.data && cached.data.length > 0) {
        setTeams(cached.data);
        setLoading(false);
        console.log(
          `[usePublicTeams] Loaded ${cached.data.length} teams from cache (age: ${Math.round(cached.age / 1000)}s)`
        );

        if (!cached.isExpired) {
          console.log('[usePublicTeams] Cache is valid, no refresh needed');
          return;
        }

        console.log('[usePublicTeams] Cache expired, refreshing in background...');
        isBackgroundRefresh.current = true;
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        // Try API first
        const freshTeams = await fetchFromAPI();
        console.log(`[usePublicTeams] Loaded ${freshTeams.length} teams from API`);
        setTeams(freshTeams);
        setLastUpdated(new Date().toISOString());

        if (freshTeams.length > 0) {
          saveToCache(seasonId, freshTeams);
        }
      } catch (apiError) {
        console.warn('[usePublicTeams] API failed, falling back to JSON:', apiError.message);

        try {
          const jsonTeams = await fetchFromJSON();
          console.log(`[usePublicTeams] Loaded ${jsonTeams.length} teams from JSON`);
          setTeams(jsonTeams);

          if (jsonTeams.length > 0) {
            saveToCache(seasonId, jsonTeams);
          }
        } catch (jsonError) {
          console.error('Error fetching teams:', jsonError);
          setError(jsonError.message || 'Failed to fetch teams');

          if (!cached?.data || cached.data.length === 0) {
            setTeams([]);
          }
        }
      } finally {
        setLoading(false);
        isBackgroundRefresh.current = false;
      }
    },
    [fetchFromAPI, fetchFromJSON, seasonId]
  );

  useEffect(() => {
    if (seasonId !== undefined) {
      fetchTeams();
    }
  }, [fetchTeams, seasonId]);

  return { teams, loading, error, refetch: fetchTeams, lastUpdated };
}
