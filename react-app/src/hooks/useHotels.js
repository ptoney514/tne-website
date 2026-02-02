import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api-client';

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
      const data = await api.get('/admin/hotels');
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
    const data = await api.post('/admin/hotels', hotelData);
    await fetchHotels();
    return data;
  };

  const updateHotel = async (id, hotelData) => {
    const data = await api.patch(`/admin/hotels?id=${id}`, hotelData);
    await fetchHotels();
    return data;
  };

  const deleteHotel = async (id) => {
    await api.delete(`/admin/hotels?id=${id}`);
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
      const data = await api.get(`/admin/hotels?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}`);
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
