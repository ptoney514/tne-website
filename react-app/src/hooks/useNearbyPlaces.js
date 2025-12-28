import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

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
      const { data, error: fetchError } = await supabase
        .from('nearby_places')
        .select('*')
        .order('name');

      if (fetchError) throw fetchError;
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
    const { data, error } = await supabase
      .from('nearby_places')
      .insert(placeData)
      .select()
      .single();

    if (error) throw error;
    await fetchPlaces();
    return data;
  };

  const updatePlace = async (id, placeData) => {
    const { data, error } = await supabase
      .from('nearby_places')
      .update(placeData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    await fetchPlaces();
    return data;
  };

  const deletePlace = async (id) => {
    const { error } = await supabase
      .from('nearby_places')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchPlaces();
  };

  // Bulk create places (for agent use)
  const bulkCreatePlaces = async (placesArray) => {
    const { data, error } = await supabase
      .from('nearby_places')
      .insert(placesArray)
      .select();

    if (error) throw error;
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
      let query = supabase
        .from('nearby_places')
        .select('*')
        .order('name');

      if (placeType && placeType !== 'all') {
        query = query.eq('place_type', placeType);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
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
      let query = supabase
        .from('nearby_places')
        .select('*')
        .eq('city', city)
        .eq('state', state)
        .order('name');

      if (placeType) {
        query = query.eq('place_type', placeType);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
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
