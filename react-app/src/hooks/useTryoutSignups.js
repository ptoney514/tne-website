import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useTryoutSignups() {
  const [signups, setSignups] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSignups = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('tryout_signups')
        .select(`
          *,
          session:tryout_sessions(id, session_date, start_time, end_time, location, grades, description)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setSignups(data || []);
    } catch (err) {
      console.error('Error fetching tryout signups:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSessions = useCallback(async () => {
    const { data, error } = await supabase
      .from('tryout_sessions')
      .select('id, session_date, start_time, end_time, location, grades, description, is_active')
      .order('session_date', { ascending: true });

    if (error) {
      console.error('Error fetching tryout sessions:', error);
      return;
    }
    setSessions(data || []);
  }, []);

  useEffect(() => {
    fetchSignups();
    fetchSessions();
  }, [fetchSignups, fetchSessions]);

  const updateSignup = async (id, updates) => {
    const { data, error } = await supabase
      .from('tryout_signups')
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

    await fetchSignups();
    return data;
  };

  const updateStatus = async (id, status) => {
    return updateSignup(id, {
      status,
      reviewed_at: new Date().toISOString(),
    });
  };

  const updateSession = async (id, sessionId) => {
    return updateSignup(id, { session_id: sessionId });
  };

  const deleteSignup = async (id) => {
    const { error } = await supabase
      .from('tryout_signups')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    await fetchSignups();
  };

  // Convert tryout signup to a player record (after successful tryout)
  const convertToPlayer = async (signup) => {
    // Create player record
    const { data: player, error: playerError } = await supabase
      .from('players')
      .insert({
        first_name: signup.player_first_name,
        last_name: signup.player_last_name,
        date_of_birth: signup.player_dob,
        current_grade: signup.player_grade,
        gender: signup.player_gender,
      })
      .select()
      .single();

    if (playerError) throw playerError;

    // Create parent record
    const { data: parent, error: parentError } = await supabase
      .from('parents')
      .insert({
        first_name: signup.parent_first_name,
        last_name: signup.parent_last_name,
        email: signup.parent_email,
        phone: signup.parent_phone,
        relationship: signup.relationship,
      })
      .select()
      .single();

    if (parentError) throw parentError;

    // Link player to parent
    await supabase
      .from('players')
      .update({ primary_parent_id: parent.id })
      .eq('id', player.id);

    // Update signup to mark as converted
    await updateSignup(signup.id, {
      status: 'selected',
      player_id: player.id,
    });

    return player;
  };

  return {
    signups,
    sessions,
    loading,
    error,
    refetch: fetchSignups,
    updateSignup,
    updateStatus,
    updateSession,
    deleteSignup,
    convertToPlayer,
  };
}
