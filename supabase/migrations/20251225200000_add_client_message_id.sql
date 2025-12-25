-- Add client_message_id for reliable feedback lookup
-- This allows matching messages without relying on content matching

ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS client_message_id TEXT;

-- Index for faster lookups by client message ID
CREATE INDEX IF NOT EXISTS idx_chat_messages_client_id
ON chat_messages(client_message_id)
WHERE client_message_id IS NOT NULL;

COMMENT ON COLUMN chat_messages.client_message_id IS 'Client-generated UUID for reliable message identification in feedback';
