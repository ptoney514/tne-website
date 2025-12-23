import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useTryoutSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('tryout_sessions')
        .select('*')
        .eq('is_active', true)
        .gte('session_date', new Date().toISOString().split('T')[0])
        .order('session_date', { ascending: true });

      if (fetchError) throw fetchError;

      setSessions(data || []);
    } catch (err) {
      console.error('Error fetching tryout sessions:', err);
      setError(err.message || 'Failed to fetch sessions');
      // Return sample data for now if Supabase fetch fails
      setSessions(getSampleSessions());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const submitSignup = useCallback(
    async (signupData) => {
      setSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);

      try {
        const { error: insertError } = await supabase
          .from('tryout_signups')
          .insert({
            session_id: signupData.sessionId,
            player_first_name: signupData.playerFirstName,
            player_last_name: signupData.playerLastName,
            player_dob: signupData.playerDob,
            player_grade: signupData.playerGrade,
            player_gender: signupData.playerGender,
            player_school: signupData.playerSchool,
            parent_first_name: signupData.parentFirstName,
            parent_last_name: signupData.parentLastName,
            parent_email: signupData.parentEmail,
            parent_phone: signupData.parentPhone,
            relationship: signupData.relationship,
            status: 'pending',
          });

        if (insertError) throw insertError;

        setSubmitSuccess(true);
        return { success: true };
      } catch (err) {
        console.error('Error submitting tryout signup:', err);
        setSubmitError(err.message || 'Failed to submit registration');
        return { success: false, error: err.message };
      } finally {
        setSubmitting(false);
      }
    },
    []
  );

  const resetSubmitState = useCallback(() => {
    setSubmitting(false);
    setSubmitError(null);
    setSubmitSuccess(false);
  }, []);

  return {
    sessions,
    loading,
    error,
    refetch: fetchSessions,
    submitSignup,
    submitting,
    submitSuccess,
    submitError,
    resetSubmitState,
  };
}

// Sample data for development/fallback
function getSampleSessions() {
  return [
    {
      id: '1',
      session_date: '2026-01-11',
      start_time: '09:00',
      end_time: '12:00',
      location: 'Central Recreation Center',
      grades: '4th-5th',
      description: '4th-5th Grade Tryouts',
      notes: 'Boys & Girls divisions',
      is_active: true,
      spots_available: 30,
    },
    {
      id: '2',
      session_date: '2026-01-12',
      start_time: '13:00',
      end_time: '16:00',
      location: 'Central Recreation Center',
      grades: '6th-7th',
      description: '6th-7th Grade Tryouts',
      notes: 'Boys & Girls divisions',
      is_active: true,
      spots_available: 25,
    },
    {
      id: '3',
      session_date: '2026-01-18',
      start_time: '09:00',
      end_time: '12:00',
      location: 'Gateway High School Gym',
      grades: '8th',
      description: '8th Grade Tryouts',
      notes: 'Boys & Girls divisions',
      is_active: true,
      spots_available: 20,
    },
  ];
}
