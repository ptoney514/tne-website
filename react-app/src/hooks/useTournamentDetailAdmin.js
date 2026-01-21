import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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
      // Check if details already exist
      const { data: existing } = await supabase
        .from('tournament_details')
        .select('id')
        .eq('game_id', gameId)
        .single();

      if (existing) {
        // Update existing
        const { data, error: updateError } = await supabase
          .from('tournament_details')
          .update(detailsData)
          .eq('game_id', gameId)
          .select()
          .single();

        if (updateError) throw updateError;
        return data;
      } else {
        // Create new
        const { data, error: insertError } = await supabase
          .from('tournament_details')
          .insert({ ...detailsData, game_id: gameId })
          .select()
          .single();

        if (insertError) throw insertError;
        return data;
      }
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
    const { data: existing } = await supabase
      .from('tournament_details')
      .select('*')
      .eq('game_id', gameId)
      .single();

    if (existing) return existing;

    const { data: created, error } = await supabase
      .from('tournament_details')
      .insert({ game_id: gameId })
      .select()
      .single();

    if (error) throw error;
    return created;
  };

  // Link hotel to tournament with rate info
  const addHotelToTournament = async (tournamentDetailId, hotelId, rateInfo = {}) => {
    const { data, error } = await supabase
      .from('tournament_hotels')
      .insert({
        tournament_detail_id: tournamentDetailId,
        hotel_id: hotelId,
        ...rateInfo,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  // Update hotel rate info
  const updateTournamentHotel = async (id, rateInfo) => {
    const { data, error } = await supabase
      .from('tournament_hotels')
      .update(rateInfo)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  // Remove hotel from tournament
  const removeHotelFromTournament = async (tournamentDetailId, hotelId) => {
    const { error } = await supabase
      .from('tournament_hotels')
      .delete()
      .eq('tournament_detail_id', tournamentDetailId)
      .eq('hotel_id', hotelId);

    if (error) throw error;
  };

  // Link place to tournament
  const addPlaceToTournament = async (tournamentDetailId, placeId, linkInfo = {}) => {
    const { data, error } = await supabase
      .from('tournament_nearby_places')
      .insert({
        tournament_detail_id: tournamentDetailId,
        nearby_place_id: placeId,
        ...linkInfo,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  // Update place link info
  const updateTournamentPlace = async (id, linkInfo) => {
    const { data, error } = await supabase
      .from('tournament_nearby_places')
      .update(linkInfo)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  // Remove place from tournament
  const removePlaceFromTournament = async (tournamentDetailId, placeId) => {
    const { error } = await supabase
      .from('tournament_nearby_places')
      .delete()
      .eq('tournament_detail_id', tournamentDetailId)
      .eq('nearby_place_id', placeId);

    if (error) throw error;
  };

  // Bulk add nearby places (for agent use)
  // Accepts array of places with optional existing_id for known places
  const bulkAddNearbyPlaces = async (tournamentDetailId, places) => {
    // Separate places to create vs just link
    const placesToCreate = places.filter(p => !p.existing_id);
    const placesToLink = places.filter(p => p.existing_id);

    // Create new places
    if (placesToCreate.length > 0) {
      const { data: newPlaces, error: createError } = await supabase
        .from('nearby_places')
        .insert(placesToCreate.map(p => ({
          name: p.name,
          place_type: p.place_type,
          category: p.category,
          description: p.description,
          street_address: p.street_address,
          city: p.city,
          state: p.state,
          zip_code: p.zip_code,
          latitude: p.latitude,
          longitude: p.longitude,
          google_place_id: p.google_place_id,
          yelp_id: p.yelp_id,
          rating: p.rating,
          review_count: p.review_count,
          price_range: p.price_range,
          cuisine_type: p.cuisine_type,
          is_family_friendly: p.is_family_friendly,
          phone: p.phone,
          website_url: p.website_url,
        })))
        .select();

      if (createError) throw createError;

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
      const { error: linkError } = await supabase
        .from('tournament_nearby_places')
        .insert(
          placesToLink.map(p => ({
            tournament_detail_id: tournamentDetailId,
            nearby_place_id: p.existing_id,
            distance_miles: p.distance_miles,
            has_team_discount: p.has_team_discount,
            team_discount_info: p.team_discount_info,
          }))
        );

      if (linkError) throw linkError;
    }

    // Update places_populated_at timestamp
    await supabase
      .from('tournament_details')
      .update({ places_populated_at: new Date().toISOString() })
      .eq('id', tournamentDetailId);

    return placesToLink.length;
  };

  // Bulk add hotels (for agent use)
  const bulkAddHotels = async (tournamentDetailId, hotels) => {
    const hotelsToCreate = hotels.filter(h => !h.existing_id);
    const hotelsToLink = hotels.filter(h => h.existing_id);

    // Create new hotels
    if (hotelsToCreate.length > 0) {
      const { data: newHotels, error: createError } = await supabase
        .from('hotels')
        .insert(hotelsToCreate.map(h => ({
          name: h.name,
          brand: h.brand,
          street_address: h.street_address,
          city: h.city,
          state: h.state,
          zip_code: h.zip_code,
          phone: h.phone,
          website_url: h.website_url,
          booking_url: h.booking_url,
          latitude: h.latitude,
          longitude: h.longitude,
          amenities: h.amenities,
          star_rating: h.star_rating,
          google_place_id: h.google_place_id,
        })))
        .select();

      if (createError) throw createError;

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
      const { error: linkError } = await supabase
        .from('tournament_hotels')
        .insert(
          hotelsToLink.map(h => ({
            tournament_detail_id: tournamentDetailId,
            hotel_id: h.existing_id,
            distance_miles: h.distance_miles,
            drive_time_minutes: h.drive_time_minutes,
            nightly_rate: h.nightly_rate,
            is_team_rate: false,
          }))
        );

      if (linkError) throw linkError;
    }

    return hotelsToLink.length;
  };

  // Find existing place by Google Place ID (for deduplication)
  const findPlaceByGoogleId = async (googlePlaceId) => {
    if (!googlePlaceId) return null;

    const { data } = await supabase
      .from('nearby_places')
      .select('id')
      .eq('google_place_id', googlePlaceId)
      .single();

    return data;
  };

  // Find existing hotel by Google Place ID (for deduplication)
  const findHotelByGoogleId = async (googlePlaceId) => {
    if (!googlePlaceId) return null;

    const { data } = await supabase
      .from('hotels')
      .select('id')
      .eq('google_place_id', googlePlaceId)
      .single();

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
      const { data: game, error: gameError } = await supabase
        .from('games')
        .select(`
          *,
          tournament_details(
            *,
            venue:venues(*),
            tournament_hotels(
              *,
              hotel:hotels(*)
            ),
            tournament_nearby_places(
              *,
              nearby_place:nearby_places(*)
            )
          )
        `)
        .eq('id', gameId)
        .single();

      if (gameError) throw gameError;

      setData({
        game,
        details: game.tournament_details?.[0] || null,
        venue: game.tournament_details?.[0]?.venue || null,
        hotels: game.tournament_details?.[0]?.tournament_hotels || [],
        places: game.tournament_details?.[0]?.tournament_nearby_places || [],
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
