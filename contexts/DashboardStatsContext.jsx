'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api-client';
import { useSeason } from '@/contexts/SeasonContext';

const DashboardStatsContext = createContext(null);

export function DashboardStatsProvider({ children }) {
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
      const [data, registrations] = await Promise.all([
        api.get(`/admin/dashboard${params}`),
        api.get(`/admin/registrations${params}`).catch(() => []),
      ]);

      setStats({
        teams: data.teams?.total || 0,
        players: data.players?.onRoster || 0,
        registrations: data.registrations?.total || 0,
        pendingRegistrations: data.registrations?.pending || 0,
        pendingPayments: 0,
        tryoutSignups: data.tryouts?.recentSignups || 0,
      });

      const regs = (Array.isArray(registrations) ? registrations : [])
        .slice(0, 6)
        .map(r => ({ ...r, type: 'registration' }));
      const tryouts = (data.recentTryoutSignups || [])
        .map(t => ({ ...t, type: 'tryout_signup' }));
      const merged = [...regs, ...tryouts]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 6);
      setRecentActivity(merged);
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

  return (
    <DashboardStatsContext.Provider
      value={{
        stats,
        recentActivity,
        upcomingEvents,
        loading,
        error,
        refetch: fetchStats,
      }}
    >
      {children}
    </DashboardStatsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDashboardStats() {
  const context = useContext(DashboardStatsContext);
  if (!context) {
    throw new Error('useDashboardStats must be used within a DashboardStatsProvider');
  }
  return context;
}
