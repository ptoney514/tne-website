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

      // Fetch sessions with stats
      const { data: sessions, error: sessionsError } = await supabase
        .from('chat_sessions')
        .select('*')
        .gte('started_at', startDate.toISOString())
        .order('started_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      // Calculate stats
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

      // Fetch recent conversations with their messages
      const recentSessionIds = sessions?.slice(0, 10).map(s => s.id) || [];

      if (recentSessionIds.length > 0) {
        const { data: messages, error: messagesError } = await supabase
          .from('chat_messages')
          .select('*')
          .in('session_id', recentSessionIds)
          .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;

        // Group messages by session
        const sessionMessages = {};
        messages?.forEach(msg => {
          if (!sessionMessages[msg.session_id]) {
            sessionMessages[msg.session_id] = [];
          }
          sessionMessages[msg.session_id].push(msg);
        });

        // Combine sessions with their messages
        const conversationsWithMessages = sessions?.slice(0, 10).map(session => ({
          ...session,
          messages: sessionMessages[session.id] || [],
        })) || [];

        setRecentConversations(conversationsWithMessages);
      } else {
        setRecentConversations([]);
      }
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
