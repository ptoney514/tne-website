import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, withTimeout } from '../lib/supabase';

// Cache configuration
const CACHE_KEY = 'tne_teams_cache';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Get the latest updated_at timestamp from the teams table
 * Used for cache invalidation when admin makes changes
 */
async function getTeamsVersion() {
  try {
    const { data, error } = await withTimeout(
      supabase
        .from('teams')
        .select('updated_at')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single(),
      5000,
      'Teams version check timed out'
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

    const { data, timestamp, version, seasonId } = JSON.parse(cached);
    const age = Date.now() - timestamp;

    // Return cache info including whether it's expired
    return {
      data,
      version,
      seasonId,
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
function saveToCache(data, version, seasonId) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now(),
      version,
      seasonId,
    }));
  } catch (err) {
    console.warn('[usePublicTeams] Failed to save cache:', err.message);
  }
}

/**
 * Hook for fetching teams on the public Teams page.
 * Fetches only active teams from the active season.
 * No authentication required (public read via RLS).
 *
 * Features:
 * - Shows cached data immediately for instant load
 * - Refreshes in background if cache is stale or version changed
 * - 1 hour cache TTL with smart invalidation on admin changes
 */
export function usePublicTeams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isBackgroundRefresh = useRef(false);

  /**
   * Fetch fresh data from Supabase
   */
  const fetchFromSupabase = useCallback(async () => {
    // First get active season
    const { data: activeSeason, error: seasonError } = await withTimeout(
      supabase
        .from('seasons')
        .select('id, name')
        .eq('is_active', true)
        .single(),
      5000,
      'Active season check timed out'
    );

    if (seasonError) {
      throw seasonError;
    }

    if (!activeSeason) {
      return { teams: [], seasonId: null };
    }

    // Then get teams for that season
    const { data, error: fetchError } = await withTimeout(
      supabase
        .from('teams')
        .select(`
          id,
          name,
          grade_level,
          gender,
          tier,
          practice_location,
          practice_days,
          practice_time,
          head_coach:coaches!teams_head_coach_id_fkey(id, first_name, last_name)
        `)
        .eq('is_active', true)
        .eq('season_id', activeSeason.id)
        .order('grade_level', { ascending: true }),
      10000,
      'Teams fetch timed out'
    );

    if (fetchError) {
      throw fetchError;
    }

    // Fetch player counts for each team
    const teamIds = data?.map(t => t.id) || [];

    let countMap = {};
    if (teamIds.length > 0) {
      const { data: rosterCounts } = await withTimeout(
        supabase
          .from('team_roster')
          .select('team_id')
          .in('team_id', teamIds)
          .eq('is_active', true),
        5000,
        'Roster count fetch timed out'
      );

      rosterCounts?.forEach((r) => {
        countMap[r.team_id] = (countMap[r.team_id] || 0) + 1;
      });
    }

    // Add player counts to teams
    const teamsWithCounts = data?.map((team) => ({
      ...team,
      player_count: countMap[team.id] || 0,
    })) || [];

    return { teams: teamsWithCounts, seasonId: activeSeason.id };
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
      console.log(`[usePublicTeams] Loaded ${cached.data.length} teams from cache (age: ${Math.round(cached.age / 1000)}s)`);

      // If cache isn't expired, check version in background
      if (!cached.isExpired) {
        isBackgroundRefresh.current = true;

        // Check if version changed (admin made updates)
        const currentVersion = await getTeamsVersion();
        if (currentVersion && currentVersion !== cached.version) {
          console.log('[usePublicTeams] Version changed, refreshing data...');
        } else {
          // Cache is still valid
          console.log('[usePublicTeams] Cache is valid, no refresh needed');
          isBackgroundRefresh.current = false;
          return;
        }
      } else {
        console.log('[usePublicTeams] Cache expired, refreshing in background...');
        isBackgroundRefresh.current = true;
      }
    } else {
      // No cache, show loading
      setLoading(true);
    }

    setError(null);

    try {
      const { teams: freshTeams, seasonId } = await fetchFromSupabase();
      const version = await getTeamsVersion();

      console.log(`[usePublicTeams] Loaded ${freshTeams.length} teams from Supabase`);
      setTeams(freshTeams);

      // Save to cache
      if (freshTeams.length > 0) {
        saveToCache(freshTeams, version, seasonId);
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
  }, [fetchFromSupabase]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return { teams, loading, error, refetch: fetchTeams };
}
