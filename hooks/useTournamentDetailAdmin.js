import { useState, useCallback, useEffect } from 'react';
import { api } from '@/lib/api-client';

/**
 * Hook for admin management of tournament details
 * Handles complex operations like linking hotels and places to tournaments
 */
export function useTournamentDetailAdmin() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Create or update tournament details
  const saveTournamentDetails = async (gameId, detailsData) => {
    setSaving(true);
    setError(null);

    try {
      const data = await api.post('/admin/tournaments', {
        gameId,
        ...detailsData,
      });
      return data;
    } catch (err) {
      console.error('Error saving tournament details:', err);
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // Get or create tournament details for a game
  const getOrCreateDetails = async (gameId) => {
    const existing = await api.get(`/admin/tournaments?gameId=${gameId}`);
    if (existing) return existing;

    const created = await api.post('/admin/tournaments', { gameId });
    return created;
  };

  // Link hotel to tournament with rate info
  const addHotelToTournament = async (tournamentDetailId, hotelId, rateInfo = {}) => {
    const data = await api.post('/admin/tournament-hotels', {
      tournamentDetailId,
      hotelId,
      ...rateInfo,
    });
    return data;
  };

  // Update hotel rate info
  const updateTournamentHotel = async (id, rateInfo) => {
    const data = await api.patch(`/admin/tournament-hotels?id=${id}`, rateInfo);
    return data;
  };

  // Remove hotel from tournament
  const removeHotelFromTournament = async (tournamentDetailId, hotelId) => {
    await api.delete(`/admin/tournament-hotels?tournamentDetailId=${tournamentDetailId}&hotelId=${hotelId}`);
  };

  // Link place to tournament
  const addPlaceToTournament = async (tournamentDetailId, placeId, linkInfo = {}) => {
    const data = await api.post('/admin/tournament-places', {
      tournamentDetailId,
      nearbyPlaceId: placeId,
      ...linkInfo,
    });
    return data;
  };

  // Update place link info
  const updateTournamentPlace = async (id, linkInfo) => {
    const data = await api.patch(`/admin/tournament-places?id=${id}`, linkInfo);
    return data;
  };

  // Remove place from tournament
  const removePlaceFromTournament = async (tournamentDetailId, placeId) => {
    await api.delete(`/admin/tournament-places?tournamentDetailId=${tournamentDetailId}&nearbyPlaceId=${placeId}`);
  };

  // Bulk add nearby places (for agent use)
  const bulkAddNearbyPlaces = async (tournamentDetailId, places) => {
    // Separate places to create vs just link
    const placesToCreate = places.filter(p => !p.existing_id);
    const placesToLink = [...places.filter(p => p.existing_id)];

    // Create new places
    if (placesToCreate.length > 0) {
      const newPlaces = await api.post('/admin/nearby-places', placesToCreate.map(p => ({
        name: p.name,
        placeType: p.place_type,
        category: p.category,
        description: p.description,
        streetAddress: p.street_address,
        city: p.city,
        state: p.state,
        zipCode: p.zip_code,
        latitude: p.latitude,
        longitude: p.longitude,
        googlePlaceId: p.google_place_id,
        yelpId: p.yelp_id,
        rating: p.rating,
        reviewCount: p.review_count,
        priceRange: p.price_range,
        cuisineType: p.cuisine_type,
        isFamilyFriendly: p.is_family_friendly,
        phone: p.phone,
        websiteUrl: p.website_url,
      })));

      // Add newly created places to link list
      newPlaces.forEach((np, i) => {
        placesToLink.push({
          existing_id: np.id,
          distance_miles: placesToCreate[i].distance_miles,
          has_team_discount: placesToCreate[i].has_team_discount,
          team_discount_info: placesToCreate[i].team_discount_info,
        });
      });
    }

    // Link all places to tournament
    if (placesToLink.length > 0) {
      await api.post('/admin/tournament-places', placesToLink.map(p => ({
        tournamentDetailId,
        nearbyPlaceId: p.existing_id,
        distanceMiles: p.distance_miles,
        hasTeamDiscount: p.has_team_discount,
        teamDiscountInfo: p.team_discount_info,
      })));
    }

    return placesToLink.length;
  };

  // Bulk add hotels (for agent use)
  const bulkAddHotels = async (tournamentDetailId, hotels) => {
    const hotelsToCreate = hotels.filter(h => !h.existing_id);
    const hotelsToLink = [...hotels.filter(h => h.existing_id)];

    // Create new hotels
    if (hotelsToCreate.length > 0) {
      const newHotels = await api.post('/admin/hotels', hotelsToCreate.map(h => ({
        name: h.name,
        brand: h.brand,
        streetAddress: h.street_address,
        city: h.city,
        state: h.state,
        zipCode: h.zip_code,
        phone: h.phone,
        websiteUrl: h.website_url,
        bookingUrl: h.booking_url,
        latitude: h.latitude,
        longitude: h.longitude,
        amenities: h.amenities,
        starRating: h.star_rating,
        googlePlaceId: h.google_place_id,
      })));

      newHotels.forEach((nh, i) => {
        hotelsToLink.push({
          existing_id: nh.id,
          distance_miles: hotelsToCreate[i].distance_miles,
          drive_time_minutes: hotelsToCreate[i].drive_time_minutes,
          nightly_rate: hotelsToCreate[i].nightly_rate,
        });
      });
    }

    // Link all hotels to tournament
    if (hotelsToLink.length > 0) {
      await api.post('/admin/tournament-hotels', hotelsToLink.map(h => ({
        tournamentDetailId,
        hotelId: h.existing_id,
        distanceMiles: h.distance_miles,
        driveTimeMinutes: h.drive_time_minutes,
        nightlyRate: h.nightly_rate,
        isTeamRate: false,
      })));
    }

    return hotelsToLink.length;
  };

  // Find existing place by Google Place ID (for deduplication)
  const findPlaceByGoogleId = async (googlePlaceId) => {
    if (!googlePlaceId) return null;

    const data = await api.get(`/admin/nearby-places?googlePlaceId=${encodeURIComponent(googlePlaceId)}`);
    return data;
  };

  // Find existing hotel by Google Place ID (for deduplication)
  const findHotelByGoogleId = async (googlePlaceId) => {
    if (!googlePlaceId) return null;

    const data = await api.get(`/admin/hotels?googlePlaceId=${encodeURIComponent(googlePlaceId)}`);
    return data;
  };

  return {
    saving,
    error,
    saveTournamentDetails,
    getOrCreateDetails,
    addHotelToTournament,
    updateTournamentHotel,
    removeHotelFromTournament,
    addPlaceToTournament,
    updateTournamentPlace,
    removePlaceFromTournament,
    bulkAddNearbyPlaces,
    bulkAddHotels,
    findPlaceByGoogleId,
    findHotelByGoogleId,
  };
}

/**
 * Hook for fetching tournament detail for admin editing
 */
export function useTournamentDetailForEdit(gameId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!gameId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch game with tournament details
      const game = await api.get(`/admin/games?id=${gameId}`);
      const details = await api.get(`/admin/tournaments?gameId=${gameId}`);

      setData({
        game,
        details: details || null,
        venue: details?.venue || null,
        hotels: details?.tournament_hotels || [],
        places: details?.tournament_nearby_places || [],
      });
    } catch (err) {
      console.error('Error fetching tournament for edit:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}
