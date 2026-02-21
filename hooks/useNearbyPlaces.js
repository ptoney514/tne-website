import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api-client';

/**
 * Hook for managing nearby places (admin)
 */
export function useNearbyPlaces() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPlaces = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.get('/admin/nearby-places');
      setPlaces(data || []);
    } catch (err) {
      console.error('Error fetching nearby places:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  const createPlace = async (placeData) => {
    const data = await api.post('/admin/nearby-places', placeData);
    await fetchPlaces();
    return data;
  };

  const updatePlace = async (id, placeData) => {
    const data = await api.patch(`/admin/nearby-places?id=${id}`, placeData);
    await fetchPlaces();
    return data;
  };

  const deletePlace = async (id) => {
    await api.delete(`/admin/nearby-places?id=${id}`);
    await fetchPlaces();
  };

  // Bulk create places (for agent use)
  const bulkCreatePlaces = async (placesArray) => {
    const data = await api.post('/admin/nearby-places', placesArray);
    await fetchPlaces();
    return data;
  };

  return {
    places,
    loading,
    error,
    createPlace,
    updatePlace,
    deletePlace,
    bulkCreatePlaces,
    refetch: fetchPlaces,
  };
}

/**
 * Hook for fetching places by type
 */
export function usePlacesByType(placeType) {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPlaces = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const url = placeType && placeType !== 'all'
        ? `/admin/nearby-places?placeType=${encodeURIComponent(placeType)}`
        : '/admin/nearby-places';
      const data = await api.get(url);
      setPlaces(data || []);
    } catch (err) {
      console.error('Error fetching places:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [placeType]);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  return {
    places,
    loading,
    error,
    refetch: fetchPlaces,
  };
}

/**
 * Hook for fetching places by city/state
 */
export function usePlacesByLocation(city, state, placeType = null) {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPlaces = useCallback(async () => {
    if (!city || !state) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let url = `/admin/nearby-places?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}`;
      if (placeType) {
        url += `&placeType=${encodeURIComponent(placeType)}`;
      }
      const data = await api.get(url);
      setPlaces(data || []);
    } catch (err) {
      console.error('Error fetching places:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [city, state, placeType]);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  return {
    places,
    loading,
    error,
    refetch: fetchPlaces,
  };
}
