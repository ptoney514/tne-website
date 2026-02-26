import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api-client';
import { useSeason } from '@/contexts/SeasonContext';

export function useRegistrations() {
  const { selectedSeason } = useSeason();
  const [registrations, setRegistrations] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = selectedSeason?.id ? `?seasonId=${selectedSeason.id}` : '';
      const data = await api.get(`/admin/registrations${params}`);
      setRegistrations(data || []);
    } catch (err) {
      console.error('Error fetching registrations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedSeason?.id]);

  const fetchTeams = useCallback(async () => {
    try {
      const data = await api.get('/admin/teams');
      setTeams(
        (data || []).map((t) => ({
          id: t.id,
          name: t.name,
          grade_level: t.grade_level,
          gender: t.gender,
        }))
      );
    } catch (err) {
      console.error('Error fetching teams:', err);
    }
  }, []);

  useEffect(() => {
    fetchRegistrations();
    fetchTeams();
  }, [fetchRegistrations, fetchTeams]);

  const updateRegistration = async (id, updates) => {
    const data = await api.patch(`/admin/registrations?id=${id}`, updates);
    await fetchRegistrations();
    return data;
  };

  const updateStatus = async (id, status) => {
    if (status === 'approved') {
      const data = await api.patch(`/admin/registrations?id=${id}&action=approve`, {});
      await fetchRegistrations();
      return data;
    }
    if (status === 'rejected') {
      const data = await api.patch(`/admin/registrations?id=${id}&action=reject`, {});
      await fetchRegistrations();
      return data;
    }
    return updateRegistration(id, { status });
  };

  const updatePaymentStatus = async (id, paymentStatus, paymentAmount = null) => {
    const updates = { payment_status: paymentStatus };
    if (paymentAmount !== null) {
      updates.amount_paid = paymentAmount;
    }
    return updateRegistration(id, updates);
  };

  const assignToTeam = async (id, teamId) => {
    return updateRegistration(id, { team_id: teamId });
  };

  const deleteRegistration = async (id) => {
    await api.delete(`/admin/registrations?id=${id}`);
    await fetchRegistrations();
  };

  // Convert registration to a player record (uses the approve action)
  const convertToPlayer = async (registration) => {
    const data = await api.patch(
      `/admin/registrations?id=${registration.id}&action=approve`,
      {}
    );
    await fetchRegistrations();
    return data;
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
