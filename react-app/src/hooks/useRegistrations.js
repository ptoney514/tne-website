import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('registrations')
        .select(`
          *,
          team:teams(id, name, grade_level, gender)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setRegistrations(data || []);
    } catch (err) {
      console.error('Error fetching registrations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTeams = useCallback(async () => {
    const { data, error } = await supabase
      .from('teams')
      .select('id, name, grade_level, gender')
      .eq('is_active', true)
      .order('grade_level', { ascending: true });

    if (error) {
      console.error('Error fetching teams:', error);
      return;
    }
    setTeams(data || []);
  }, []);

  useEffect(() => {
    fetchRegistrations();
    fetchTeams();
  }, [fetchRegistrations, fetchTeams]);

  const updateRegistration = async (id, updates) => {
    const { data, error } = await supabase
      .from('registrations')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    await fetchRegistrations();
    return data;
  };

  const updateStatus = async (id, status) => {
    return updateRegistration(id, {
      status,
      reviewed_at: new Date().toISOString(),
    });
  };

  const updatePaymentStatus = async (id, paymentStatus, paymentAmount = null) => {
    const updates = { payment_status: paymentStatus };
    if (paymentStatus === 'paid') {
      updates.payment_date = new Date().toISOString();
    }
    if (paymentAmount !== null) {
      updates.payment_amount = paymentAmount;
    }
    return updateRegistration(id, updates);
  };

  const assignToTeam = async (id, teamId) => {
    return updateRegistration(id, { team_id: teamId });
  };

  const deleteRegistration = async (id) => {
    const { error } = await supabase
      .from('registrations')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    await fetchRegistrations();
  };

  // Convert registration to a player record
  const convertToPlayer = async (registration) => {
    // Create player record
    const { data: player, error: playerError } = await supabase
      .from('players')
      .insert({
        first_name: registration.player_first_name,
        last_name: registration.player_last_name,
        date_of_birth: registration.player_date_of_birth,
        graduating_year: registration.player_graduating_year,
        current_grade: registration.player_current_grade,
        gender: registration.player_gender,
        jersey_size: registration.jersey_size,
        position: registration.position,
        medical_notes: registration.medical_notes,
        emergency_contact_name: registration.emergency_contact_name,
        emergency_contact_phone: registration.emergency_contact_phone,
        emergency_contact_relationship: registration.emergency_contact_relationship,
      })
      .select()
      .single();

    if (playerError) throw playerError;

    // Create parent record
    const { data: parent, error: parentError } = await supabase
      .from('parents')
      .insert({
        first_name: registration.parent_first_name,
        last_name: registration.parent_last_name,
        email: registration.parent_email,
        phone: registration.parent_phone,
        relationship: registration.parent_relationship,
        address_street: registration.parent_address_street,
        address_city: registration.parent_address_city,
        address_state: registration.parent_address_state,
        address_zip: registration.parent_address_zip,
      })
      .select()
      .single();

    if (parentError) throw parentError;

    // Link player to parent
    await supabase
      .from('players')
      .update({ primary_parent_id: parent.id })
      .eq('id', player.id);

    // If team is assigned, add to roster
    if (registration.team_id) {
      await supabase.from('team_roster').insert({
        team_id: registration.team_id,
        player_id: player.id,
        payment_status: registration.payment_status,
        is_active: true,
      });
    }

    // Update registration to mark as converted
    await updateRegistration(registration.id, {
      status: 'approved',
      player_id: player.id,
    });

    return player;
  };

  return {
    registrations,
    teams,
    loading,
    error,
    refetch: fetchRegistrations,
    updateRegistration,
    updateStatus,
    updatePaymentStatus,
    assignToTeam,
    deleteRegistration,
    convertToPlayer,
  };
}
