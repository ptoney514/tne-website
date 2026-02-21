import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api-client';

// Cache configuration
const CACHE_KEY = 'tne_seasons_cache';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Load cached seasons from localStorage
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
 * Save seasons to localStorage cache
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
    console.warn('[usePublicSeasons] Failed to save cache:', err.message);
  }
}

// Sentinel value: seasons haven't been fetched yet
const NOT_LOADED = Symbol('NOT_LOADED');

/**
 * Hook for fetching active seasons on public pages.
 * Uses the public API with caching for performance.
 *
 * Features:
 * - Shows cached data immediately for instant load
 * - Refreshes in background if cache is stale
 * - 1 hour cache TTL
 * - Auto-selects the most recent season (first in sorted list)
 *
 * Returns:
 * - selectedSeasonId: string (season UUID) or null (no seasons exist, fetch all teams)
 * - ready: true once seasons have been loaded (even if empty)
 */
export function usePublicSeasons() {
  const [seasons, setSeasons] = useState([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState(NOT_LOADED);
  const [loading, setLoading] = useState(true);

  const fetchSeasons = useCallback(async () => {
    const cached = loadFromCache();

    if (cached?.data && cached.data.length > 0) {
      setSeasons(cached.data);
      setSelectedSeasonId((prev) => prev === NOT_LOADED ? cached.data[0].id : prev);
      setLoading(false);

      if (!cached.isExpired) {
        return;
      }
    }

    try {
      const data = await api.get('/public/seasons');
      const seasonsList = data || [];
      setSeasons(seasonsList);

      if (seasonsList.length > 0) {
        setSelectedSeasonId((prev) => prev === NOT_LOADED ? seasonsList[0].id : prev);
        saveToCache(seasonsList);
      } else {
        // No seasons exist - signal that we're ready but with no season filter
        setSelectedSeasonId(null);
      }
    } catch (err) {
      console.warn('[usePublicSeasons] Failed to fetch seasons:', err.message);
      if (!cached?.data || cached.data.length === 0) {
        setSeasons([]);
        // On error with no cache, allow teams to load without filter
        setSelectedSeasonId(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSeasons();
  }, [fetchSeasons]);

  const selectedSeason = seasons.find((s) => s.id === selectedSeasonId) || null;
  const ready = selectedSeasonId !== NOT_LOADED;

  return {
    seasons,
    selectedSeasonId: ready ? selectedSeasonId : null,
    selectedSeason,
    setSelectedSeasonId,
    loading,
    ready,
  };
}
