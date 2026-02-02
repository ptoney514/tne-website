import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api-client';

/**
 * Hook for public tryout sessions display and signup
 */
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
      const data = await api.get('/public/tryouts');
      setSessions(data || []);
    } catch (err) {
      console.error('Error fetching tryout sessions:', err);
      setError(err.message || 'Failed to fetch sessions');
      // Return sample data as fallback
      setSessions(getSampleSessions());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const submitSignup = useCallback(async (signupData) => {
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      await api.post('/public/tryout-signup', {
        tryout_session_id: signupData.sessionId,
        player_first_name: signupData.playerFirstName,
        player_last_name: signupData.playerLastName,
        player_date_of_birth: signupData.playerDob,
        player_grade: signupData.playerGrade,
        player_gender: signupData.playerGender,
        parent_first_name: signupData.parentFirstName,
        parent_last_name: signupData.parentLastName,
        parent_email: signupData.parentEmail,
        parent_phone: signupData.parentPhone,
        previous_experience: signupData.previousExperience,
        how_heard_about_us: signupData.howHeardAboutUs,
      });

      setSubmitSuccess(true);
      return { success: true };
    } catch (err) {
      console.error('Error submitting tryout signup:', err);
      const message = err.data?.error || err.message || 'Failed to submit registration';
      setSubmitError(message);
      return { success: false, error: message };
    } finally {
      setSubmitting(false);
    }
  }, []);

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

/**
 * Hook for admin tryout session management
 */
export function useTryoutSessionsAdmin(options = {}) {
  const { seasonId, includeSignups = false } = options;
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (seasonId) params.append('seasonId', seasonId);
      if (includeSignups) params.append('includeSignups', 'true');

      const queryString = params.toString();
      const data = await api.get(
        `/admin/tryouts${queryString ? `?${queryString}` : ''}`
      );
      setSessions(data || []);
    } catch (err) {
      console.error('Error fetching tryout sessions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [seasonId, includeSignups]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const createSession = async (sessionData) => {
    const data = await api.post('/admin/tryouts', sessionData);
    await fetchSessions();
    return data;
  };

  const updateSession = async (id, sessionData) => {
    const data = await api.patch(`/admin/tryouts?id=${id}`, sessionData);
    await fetchSessions();
    return data;
  };

  const deleteSession = async (id) => {
    await api.delete(`/admin/tryouts?id=${id}`);
    await fetchSessions();
  };

  return {
    sessions,
    loading,
    error,
    refetch: fetchSessions,
    createSession,
    updateSession,
    deleteSession,
  };
}

// Sample data for development/fallback
function getSampleSessions() {
  const today = new Date();
  const formatDate = (daysOffset) => {
    const date = new Date(today);
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split('T')[0];
  };

  return [
    {
      id: '1',
      date: formatDate(14),
      start_time: '09:00',
      end_time: '12:00',
      location: 'Central Recreation Center',
      grade_levels: '4th-5th',
      gender: 'both',
      max_participants: 30,
      spots_remaining: 25,
      registration_open: true,
    },
    {
      id: '2',
      date: formatDate(15),
      start_time: '13:00',
      end_time: '16:00',
      location: 'Central Recreation Center',
      grade_levels: '6th-7th',
      gender: 'both',
      max_participants: 25,
      spots_remaining: 20,
      registration_open: true,
    },
  ];
}
