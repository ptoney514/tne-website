import { createClient } from '@supabase/supabase-js';

// Initialize Supabase clients
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Service role client for data access (bypasses RLS)
const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Anon client for auth verification
const supabaseAuth = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check Supabase config
  if (!supabaseAdmin || !supabaseAuth) {
    console.error('Supabase is not configured for analytics');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    // Verify authentication from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify the JWT and get user
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if user is admin using service role (bypass RLS)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get days parameter (default 30)
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch sessions with nested messages using service role
    const { data: sessions, error: sessionsError } = await supabaseAdmin
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

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError);
      return res.status(500).json({ error: 'Failed to fetch analytics' });
    }

    // Calculate stats
    const totalChats = sessions?.length || 0;
    const totalMessages = sessions?.reduce((sum, s) => sum + (s.message_count || 0), 0) || 0;
    const positiveCount = sessions?.reduce((sum, s) => sum + (s.positive_feedback_count || 0), 0) || 0;
    const negativeCount = sessions?.reduce((sum, s) => sum + (s.negative_feedback_count || 0), 0) || 0;
    const totalFeedback = positiveCount + negativeCount;
    const satisfactionRate = totalFeedback > 0 ? Math.round((positiveCount / totalFeedback) * 100) : 0;
    const avgMessagesPerChat = totalChats > 0 ? (totalMessages / totalChats).toFixed(1) : '0';

    // Extract recent conversations with sorted messages
    const recentConversations = sessions?.slice(0, 10).map(session => {
      const messages = (session.chat_messages || []).sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );
      const { chat_messages: _unused, ...sessionData } = session;
      return { ...sessionData, messages };
    }) || [];

    return res.status(200).json({
      stats: {
        totalChats,
        totalMessages,
        positiveCount,
        negativeCount,
        satisfactionRate,
        avgMessagesPerChat,
      },
      recentConversations,
    });
  } catch (error) {
    console.error('Chat analytics API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
