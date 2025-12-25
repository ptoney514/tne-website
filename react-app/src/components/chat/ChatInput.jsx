import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

/**
 * ChatInput - Message input field with send button
 *
 * @param {Object} props
 * @param {Function} props.onSend - Callback when message is sent
 * @param {boolean} [props.disabled=false] - Whether input is disabled
 * @param {string} [props.placeholder='Type a message...'] - Placeholder text
 */
export default function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Type a message...',
}) {
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);

  // Focus input when not disabled
  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSend(trimmedMessage);
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 p-4 border-t border-white/10"
      data-testid="chat-input-form"
    >
      <input
        ref={inputRef}
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-tne-red/50 focus:ring-1 focus:ring-tne-red/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        data-testid="chat-input"
        aria-label="Chat message input"
      />
      <button
        type="submit"
        disabled={disabled || !message.trim()}
        className="w-10 h-10 rounded-xl bg-tne-red hover:bg-tne-red-dark disabled:bg-white/10 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
        data-testid="chat-send-button"
        aria-label="Send message"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
}
