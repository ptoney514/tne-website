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
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Single query: Fetch sessions with nested messages using Supabase relations
      const { data: sessions, error: sessionsError } = await supabase
        .from('chat_sessions')
        .select(`
          *,
          chat_messages (
            id,
            role,
            content,
            created_at,
            feedback,
            feedback_at
          )
        `)
        .gte('started_at', startDate.toISOString())
        .order('started_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      // Calculate stats from sessions
      const totalChats = sessions?.length || 0;
      const totalMessages = sessions?.reduce((sum, s) => sum + (s.message_count || 0), 0) || 0;
      const positiveCount = sessions?.reduce((sum, s) => sum + (s.positive_feedback_count || 0), 0) || 0;
      const negativeCount = sessions?.reduce((sum, s) => sum + (s.negative_feedback_count || 0), 0) || 0;
      const totalFeedback = positiveCount + negativeCount;
      const satisfactionRate = totalFeedback > 0 ? Math.round((positiveCount / totalFeedback) * 100) : 0;
      const avgMessagesPerChat = totalChats > 0 ? (totalMessages / totalChats).toFixed(1) : 0;

      setStats({
        totalChats,
        totalMessages,
        positiveCount,
        negativeCount,
        satisfactionRate,
        avgMessagesPerChat,
      });

      // Extract recent conversations with sorted messages
      const recentWithMessages = sessions?.slice(0, 10).map(session => {
        // Sort messages by created_at ascending and rename to 'messages'
        const messages = (session.chat_messages || []).sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
        // Remove chat_messages key and use messages instead
        const { chat_messages: _chat_messages, ...sessionData } = session;
        return { ...sessionData, messages };
      }) || [];

      setRecentConversations(recentWithMessages);
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
