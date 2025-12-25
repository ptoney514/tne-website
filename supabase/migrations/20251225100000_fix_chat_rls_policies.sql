-- Fix overly permissive RLS policies for chat tables
-- Security fix: Remove broad anonymous SELECT/UPDATE access
-- API endpoints use service role key (bypasses RLS), so anon doesn't need these

-- Drop overly permissive chat_sessions policies
DROP POLICY IF EXISTS "Allow anonymous read own session" ON chat_sessions;
DROP POLICY IF EXISTS "Allow anonymous update own session" ON chat_sessions;

-- Drop overly permissive chat_messages policies
DROP POLICY IF EXISTS "Allow anonymous read own messages" ON chat_messages;
DROP POLICY IF EXISTS "Allow anonymous update feedback" ON chat_messages;

-- Note: We keep the INSERT policies for anon because the chat API
-- could potentially use anon key for non-sensitive inserts
-- But the actual implementation uses service role key for all operations

-- If we want anon clients to be able to read their OWN session data
-- (e.g., for session persistence), we'd need to implement proper
-- session ownership validation in a custom RPC function

-- Comments for documentation
COMMENT ON TABLE chat_sessions IS 'Chat sessions - API access via service role only, admin access via authenticated role';
COMMENT ON TABLE chat_messages IS 'Chat messages - API access via service role only, admin access via authenticated role';
