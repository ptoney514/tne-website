import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api-client';
import { useSeason } from '../contexts/SeasonContext';

export function useDashboardStats() {
  const { selectedSeason } = useSeason();
  const [stats, setStats] = useState({
    teams: 0,
    players: 0,
    registrations: 0,
    pendingRegistrations: 0,
    pendingPayments: 0,
    tryoutSignups: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = selectedSeason?.id ? `?seasonId=${selectedSeason.id}` : '';
      const data = await api.get(`/admin/dashboard${params}`);

      setStats({
        teams: data.teams?.total || 0,
        players: data.players?.total || 0,
        registrations: data.registrations?.total || 0,
        pendingRegistrations: data.registrations?.pending || 0,
        pendingPayments: 0, // Not currently tracked in dashboard endpoint
        tryoutSignups: data.tryouts?.recentSignups || 0,
      });

      // Recent activity and upcoming events would need separate endpoints
      // For now, leave them empty
      setRecentActivity([]);
      setUpcomingEvents([]);
    } catch (err) {
      console.error('Dashboard stats error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedSeason?.id]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    recentActivity,
    upcomingEvents,
    loading,
    error,
    refetch: fetchStats,
  };
}
