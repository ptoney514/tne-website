import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useChatAnalytics(days = 30) {
  const [stats, setStats] = useState({
    totalChats: 0,
    totalMessages: 0,
    positiveCount: 0,
    negativeCount: 0,
    satisfactionRate: 0,
    avgMessagesPerChat: 0,
  });
  const [recentConversations, setRecentConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get current session for auth token
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      // Call API endpoint with auth token
      const response = await fetch(`/api/chat-analytics?days=${days}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();

      setStats(data.stats);
      setRecentConversations(data.recentConversations);
    } catch (err) {
      console.error('Failed to fetch chat analytics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    stats,
    recentConversations,
    loading,
    error,
    refetch: fetchAnalytics,
  };
}
