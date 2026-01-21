import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook for fetching complete tournament detail data
 * Used by the public tournament detail page
 */
export function useTournamentDetail(gameId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTournamentDetail = useCallback(async () => {
    if (!gameId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch tournament with all related data
      const { data: tournament, error: tournamentError } = await supabase
        .from('games')
        .select(`
          *,
          game_teams(
            id,
            team_id,
            result,
            team:teams(id, name, grade_level, gender)
          ),
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
        .eq('game_type', 'tournament')
        .single();

      if (tournamentError) throw tournamentError;

      // Transform data for easier consumption
      const detail = tournament.tournament_details?.[0] || null;

      const transformedData = {
        tournament: {
          id: tournament.id,
          name: tournament.name,
          date: tournament.date,
          endDate: tournament.end_date,
          startTime: tournament.start_time,
          endTime: tournament.end_time,
          location: tournament.location,
          address: tournament.address,
          externalUrl: tournament.external_url,
          isFeatured: tournament.is_featured,
          notes: tournament.notes,
        },
        teams: tournament.game_teams?.map(gt => ({
          ...gt.team,
          result: gt.result,
        })) || [],
        venue: detail?.venue || null,
        details: detail ? {
          id: detail.id,
          description: detail.description,
          divisionCount: detail.division_count,
          totalTeams: detail.total_teams,
          ageDivisions: detail.age_divisions,
          registrationUrl: detail.registration_url,
          registrationDeadline: detail.registration_deadline,
          entryFee: detail.entry_fee,
          schedulePdfUrl: detail.schedule_pdf_url,
          rulesPdfUrl: detail.rules_pdf_url,
          bracketUrl: detail.bracket_url,
          teamRateCode: detail.team_rate_code,
          teamRateDeadline: detail.team_rate_deadline,
          teamRateDescription: detail.team_rate_description,
          mapCenter: {
            lat: parseFloat(detail.map_center_lat) || detail.venue?.latitude,
            lng: parseFloat(detail.map_center_lng) || detail.venue?.longitude,
          },
          mapZoom: detail.map_zoom_level || 13,
          showHotels: detail.show_hotels,
          showAttractions: detail.show_attractions,
          showRestaurants: detail.show_restaurants,
        } : null,
        hotels: detail?.tournament_hotels
          ?.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
          .map(th => ({
            ...th.hotel,
            linkId: th.id,
            isTeamRate: th.is_team_rate,
            nightlyRate: th.nightly_rate,
            originalRate: th.original_rate,
            discountPercentage: th.discount_percentage,
            teamRateCode: th.team_rate_code,
            bookingDeadline: th.booking_deadline,
            specialBookingUrl: th.special_booking_url,
            distanceMiles: th.distance_miles,
            driveTimeMinutes: th.drive_time_minutes,
          })) || [],
        nearbyPlaces: detail?.tournament_nearby_places
          ?.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
          .map(tnp => ({
            ...tnp.nearby_place,
            linkId: tnp.id,
            distanceMiles: tnp.distance_miles,
            hasTeamDiscount: tnp.has_team_discount,
            teamDiscountInfo: tnp.team_discount_info,
            isRecommended: tnp.is_recommended,
            recommendationNote: tnp.recommendation_note,
          })) || [],
      };

      // Separate places by type
      transformedData.attractions = transformedData.nearbyPlaces.filter(
        p => p.place_type === 'attraction' || p.place_type === 'entertainment'
      );
      transformedData.restaurants = transformedData.nearbyPlaces.filter(
        p => p.place_type === 'restaurant'
      );

      setData(transformedData);
    } catch (err) {
      console.error('Error fetching tournament detail:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    fetchTournamentDetail();
  }, [fetchTournamentDetail]);

  return {
    data,
    loading,
    error,
    refetch: fetchTournamentDetail,
  };
}

/**
 * Hook for fetching all tournaments (for listing page)
 */
export function useTournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTournaments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('games')
        .select(`
          *,
          game_teams(count),
          tournament_details(
            id,
            division_count,
            total_teams,
            venue:venues(name, city, state)
          )
        `)
        .eq('game_type', 'tournament')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (fetchError) throw fetchError;

      const transformed = data.map(t => ({
        id: t.id,
        name: t.name,
        date: t.date,
        endDate: t.end_date,
        location: t.location,
        externalUrl: t.external_url,
        isFeatured: t.is_featured,
        teamsCount: t.game_teams?.[0]?.count || 0,
        divisionCount: t.tournament_details?.[0]?.division_count,
        totalTeams: t.tournament_details?.[0]?.total_teams,
        venue: t.tournament_details?.[0]?.venue,
        hasDetails: !!t.tournament_details?.[0],
      }));

      setTournaments(transformed);
    } catch (err) {
      console.error('Error fetching tournaments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  return {
    tournaments,
    loading,
    error,
    refetch: fetchTournaments,
  };
}
