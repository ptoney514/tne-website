import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useDashboardStats() {
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

      // Fetch all stats in parallel
      const [
        teamsResult,
        playersResult,
        registrationsResult,
        pendingRegistrationsResult,
        pendingPaymentsResult,
        tryoutSignupsResult,
        recentActivityResult,
        upcomingEventsResult,
      ] = await Promise.all([
        // Teams count (active only)
        supabase.from('teams').select('id', { count: 'exact', head: true }).eq('is_active', true),
        // Players count
        supabase.from('players').select('id', { count: 'exact', head: true }),
        // Total registrations
        supabase.from('registrations').select('id', { count: 'exact', head: true }),
        // Pending registrations
        supabase.from('registrations').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        // Pending payments (team roster)
        supabase.from('team_roster').select('id', { count: 'exact', head: true }).eq('payment_status', 'pending'),
        // Tryout signups (registered status)
        supabase.from('tryout_signups').select('id', { count: 'exact', head: true }).eq('status', 'registered'),
        // Recent activity (last 5 registrations)
        supabase
          .from('registrations')
          .select('id, player_first_name, player_last_name, status, created_at')
          .order('created_at', { ascending: false })
          .limit(5),
        // Upcoming events (next 7 days)
        supabase
          .from('events')
          .select('id, title, event_type, date, start_time, location, team_id')
          .gte('date', new Date().toISOString().split('T')[0])
          .eq('is_cancelled', false)
          .order('date', { ascending: true })
          .order('start_time', { ascending: true })
          .limit(5),
      ]);

      setStats({
        teams: teamsResult.count || 0,
        players: playersResult.count || 0,
        registrations: registrationsResult.count || 0,
        pendingRegistrations: pendingRegistrationsResult.count || 0,
        pendingPayments: pendingPaymentsResult.count || 0,
        tryoutSignups: tryoutSignupsResult.count || 0,
      });

      setRecentActivity(recentActivityResult.data || []);
      setUpcomingEvents(upcomingEventsResult.data || []);
    } catch (err) {
      console.error('Dashboard stats error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

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
