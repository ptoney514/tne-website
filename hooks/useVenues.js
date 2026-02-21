import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api-client';

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
      const data = await api.get('/admin/venues');
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
    const data = await api.post('/admin/venues', venueData);
    await fetchVenues();
    return data;
  };

  const updateVenue = async (id, venueData) => {
    const data = await api.patch(`/admin/venues?id=${id}`, venueData);
    await fetchVenues();
    return data;
  };

  const deleteVenue = async (id) => {
    await api.delete(`/admin/venues?id=${id}`);
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
      const data = await api.get(`/admin/venues?id=${venueId}`);
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
