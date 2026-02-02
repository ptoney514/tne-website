import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api-client';

export function useTryoutSignups() {
  const [signups, setSignups] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSignups = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.get('/admin/tryout-signups');
      setSignups(data || []);
    } catch (err) {
      console.error('Error fetching tryout signups:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSessions = useCallback(async () => {
    try {
      const data = await api.get('/admin/tryouts');
      setSessions(data || []);
    } catch (err) {
      console.error('Error fetching tryout sessions:', err);
    }
  }, []);

  useEffect(() => {
    fetchSignups();
    fetchSessions();
  }, [fetchSignups, fetchSessions]);

  const updateSignup = async (id, updates) => {
    const data = await api.patch(`/admin/tryout-signups?id=${id}`, updates);
    await fetchSignups();
    return data;
  };

  const updateStatus = async (id, status) => {
    return updateSignup(id, { status });
  };

  const updateSession = async (id, sessionId) => {
    return updateSignup(id, { tryout_session_id: sessionId });
  };

  const deleteSignup = async (id) => {
    await api.delete(`/admin/tryout-signups?id=${id}`);
    await fetchSignups();
  };

  const convertToPlayer = async (signup) => {
    // Create player via registrations approve action
    // or use a dedicated endpoint
    console.log('convertToPlayer would create player from signup:', signup);
    await fetchSignups();
    return {};
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
