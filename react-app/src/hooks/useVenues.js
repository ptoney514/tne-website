import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook for managing venues (admin)
 */
export function useVenues() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVenues = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('venues')
        .select('*')
        .order('name');

      if (fetchError) throw fetchError;
      setVenues(data || []);
    } catch (err) {
      console.error('Error fetching venues:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  const createVenue = async (venueData) => {
    const { data, error } = await supabase
      .from('venues')
      .insert(venueData)
      .select()
      .single();

    if (error) throw error;
    await fetchVenues();
    return data;
  };

  const updateVenue = async (id, venueData) => {
    const { data, error } = await supabase
      .from('venues')
      .update(venueData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    await fetchVenues();
    return data;
  };

  const deleteVenue = async (id) => {
    const { error } = await supabase
      .from('venues')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchVenues();
  };

  return {
    venues,
    loading,
    error,
    createVenue,
    updateVenue,
    deleteVenue,
    refetch: fetchVenues,
  };
}

/**
 * Hook for fetching a single venue
 */
export function useVenue(venueId) {
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVenue = useCallback(async () => {
    if (!venueId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('venues')
        .select('*')
        .eq('id', venueId)
        .single();

      if (fetchError) throw fetchError;
      setVenue(data);
    } catch (err) {
      console.error('Error fetching venue:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [venueId]);

  useEffect(() => {
    fetchVenue();
  }, [fetchVenue]);

  return {
    venue,
    loading,
    error,
    refetch: fetchVenue,
  };
}
