import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook for managing hotels (admin)
 */
export function useHotels() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHotels = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('hotels')
        .select('*')
        .order('name');

      if (fetchError) throw fetchError;
      setHotels(data || []);
    } catch (err) {
      console.error('Error fetching hotels:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  const createHotel = async (hotelData) => {
    const { data, error } = await supabase
      .from('hotels')
      .insert(hotelData)
      .select()
      .single();

    if (error) throw error;
    await fetchHotels();
    return data;
  };

  const updateHotel = async (id, hotelData) => {
    const { data, error } = await supabase
      .from('hotels')
      .update(hotelData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    await fetchHotels();
    return data;
  };

  const deleteHotel = async (id) => {
    const { error } = await supabase
      .from('hotels')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchHotels();
  };

  return {
    hotels,
    loading,
    error,
    createHotel,
    updateHotel,
    deleteHotel,
    refetch: fetchHotels,
  };
}

/**
 * Hook for fetching hotels by city/state (for venue proximity)
 */
export function useHotelsByLocation(city, state) {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHotels = useCallback(async () => {
    if (!city || !state) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('hotels')
        .select('*')
        .eq('city', city)
        .eq('state', state)
        .order('name');

      if (fetchError) throw fetchError;
      setHotels(data || []);
    } catch (err) {
      console.error('Error fetching hotels:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [city, state]);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  return {
    hotels,
    loading,
    error,
    refetch: fetchHotels,
  };
}
