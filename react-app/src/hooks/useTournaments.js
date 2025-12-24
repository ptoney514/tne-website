import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useSeason } from '../contexts/SeasonContext';

export function useTournaments() {
  const { selectedSeason } = useSeason();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTournaments = useCallback(async () => {
    if (!selectedSeason?.id) {
      setTournaments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('tournaments')
        .select(`
          *,
          registrations:tournament_registrations(
            id,
            team_id,
            payment_status,
            status,
            placement,
            team:teams(id, name, grade_level, gender)
          )
        `)
        .eq('season_id', selectedSeason.id)
        .order('start_date', { ascending: true });

      if (fetchError) throw fetchError;

      // Add computed fields
      const tournamentsWithCounts = data.map(t => ({
        ...t,
        registered_teams_count: t.registrations?.length || 0,
      }));

      setTournaments(tournamentsWithCounts);
    } catch (err) {
      console.error('Error fetching tournaments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedSeason?.id]);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  const createTournament = async (tournamentData) => {
    const { data, error } = await supabase
      .from('tournaments')
      .insert({
        ...tournamentData,
        season_id: selectedSeason.id,
      })
      .select()
      .single();

    if (error) throw error;
    await fetchTournaments();
    return data;
  };

  const updateTournament = async (id, tournamentData) => {
    const { data, error } = await supabase
      .from('tournaments')
      .update(tournamentData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    await fetchTournaments();
    return data;
  };

  const deleteTournament = async (id) => {
    const { error } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchTournaments();
  };

  // Tournament registrations
  const registerTeam = async (tournamentId, teamId) => {
    const { data, error } = await supabase
      .from('tournament_registrations')
      .insert({
        tournament_id: tournamentId,
        team_id: teamId,
      })
      .select()
      .single();

    if (error) throw error;
    await fetchTournaments();
    return data;
  };

  const updateRegistration = async (registrationId, updateData) => {
    const { data, error } = await supabase
      .from('tournament_registrations')
      .update(updateData)
      .eq('id', registrationId)
      .select()
      .single();

    if (error) throw error;
    await fetchTournaments();
    return data;
  };

  const removeRegistration = async (registrationId) => {
    const { error } = await supabase
      .from('tournament_registrations')
      .delete()
      .eq('id', registrationId);

    if (error) throw error;
    await fetchTournaments();
  };

  return {
    tournaments,
    loading,
    error,
    createTournament,
    updateTournament,
    deleteTournament,
    registerTeam,
    updateRegistration,
    removeRegistration,
    refetch: fetchTournaments,
  };
}
