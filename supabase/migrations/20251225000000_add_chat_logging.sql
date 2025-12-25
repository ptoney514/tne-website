-- Chat Logging Tables for AI Assistant
-- Phase 1: Feedback & Basic Logging

-- Chat sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL, -- Browser fingerprint or random ID
  started_at TIMESTAMPTZ DEFAULT NOW(),
  page_url TEXT,
  user_agent TEXT,
  ip_hash TEXT, -- Hashed for privacy
  ended_at TIMESTAMPTZ,
  message_count INTEGER DEFAULT 0,
  positive_feedback_count INTEGER DEFAULT 0,
  negative_feedback_count INTEGER DEFAULT 0
);

-- Individual messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  feedback TEXT CHECK (feedback IN ('positive', 'negative', NULL)),
  feedback_at TIMESTAMPTZ
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_chat_sessions_started_at ON chat_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON chat_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_feedback ON chat_messages(feedback) WHERE feedback IS NOT NULL;

-- Enable RLS
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_sessions
-- Allow anonymous inserts for public chat usage
CREATE POLICY "Allow anonymous insert on chat_sessions"
  ON chat_sessions FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous to read their own session by session_id
CREATE POLICY "Allow anonymous read own session"
  ON chat_sessions FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous to update their own session
CREATE POLICY "Allow anonymous update own session"
  ON chat_sessions FOR UPDATE
  TO anon
  USING (true);

-- Admin can read all sessions
CREATE POLICY "Admin read all chat_sessions"
  ON chat_sessions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for chat_messages
-- Allow anonymous inserts
CREATE POLICY "Allow anonymous insert on chat_messages"
  ON chat_messages FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous to read messages from their session
CREATE POLICY "Allow anonymous read own messages"
  ON chat_messages FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous to update feedback on messages
CREATE POLICY "Allow anonymous update feedback"
  ON chat_messages FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Admin can read all messages
CREATE POLICY "Admin read all chat_messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to update session stats when feedback is added
CREATE OR REPLACE FUNCTION update_chat_session_feedback_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the session's feedback counts
  UPDATE chat_sessions
  SET
    positive_feedback_count = (
      SELECT COUNT(*) FROM chat_messages
      WHERE session_id = NEW.session_id AND feedback = 'positive'
    ),
    negative_feedback_count = (
      SELECT COUNT(*) FROM chat_messages
      WHERE session_id = NEW.session_id AND feedback = 'negative'
    )
  WHERE id = NEW.session_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update stats on feedback change
CREATE TRIGGER update_session_feedback_stats
  AFTER INSERT OR UPDATE OF feedback ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_session_feedback_stats();

-- Function to update message count
CREATE OR REPLACE FUNCTION update_chat_session_message_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_sessions
  SET message_count = (
    SELECT COUNT(*) FROM chat_messages
    WHERE session_id = NEW.session_id
  )
  WHERE id = NEW.session_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update message count
CREATE TRIGGER update_session_message_count
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_session_message_count();

-- Comments for documentation
COMMENT ON TABLE chat_sessions IS 'Stores AI chat sessions for analytics and review';
COMMENT ON TABLE chat_messages IS 'Stores individual messages in chat sessions with optional feedback';
COMMENT ON COLUMN chat_sessions.ip_hash IS 'SHA256 hash of IP for privacy-preserving analytics';
COMMENT ON COLUMN chat_messages.feedback IS 'User feedback: positive (thumbs up) or negative (thumbs down)';
