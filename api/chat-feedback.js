import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check Supabase config
  if (!supabase) {
    console.error('Supabase is not configured for feedback');
    return res.status(200).json({ success: true, logged: false });
  }

  try {
    const { sessionId, messageContent, feedback } = req.body;

    if (!sessionId || !messageContent || !feedback) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate feedback type
    if (!['positive', 'negative'].includes(feedback)) {
      return res.status(400).json({ error: 'Invalid feedback type' });
    }

    // Find the session
    const { data: session } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('session_id', sessionId)
      .single();

    if (!session) {
      // Session not found - might not have logged yet, just acknowledge
      return res.status(200).json({ success: true, logged: false });
    }

    // Find the message by content (most recent match in session)
    const { data: message } = await supabase
      .from('chat_messages')
      .select('id')
      .eq('session_id', session.id)
      .eq('content', messageContent)
      .eq('role', 'assistant')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!message) {
      // Message not found - might not have logged yet, just acknowledge
      return res.status(200).json({ success: true, logged: false });
    }

    // Update the message with feedback
    const { error: updateError } = await supabase
      .from('chat_messages')
      .update({
        feedback,
        feedback_at: new Date().toISOString(),
      })
      .eq('id', message.id);

    if (updateError) {
      console.error('Error updating feedback:', updateError);
      return res.status(500).json({ error: 'Failed to save feedback' });
    }

    return res.status(200).json({ success: true, logged: true });
  } catch (error) {
    console.error('Feedback API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
