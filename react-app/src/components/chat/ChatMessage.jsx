import { Bot, User } from 'lucide-react';

/**
 * ChatMessage - Individual message bubble in chat
 *
 * @param {Object} props
 * @param {Object} props.message - Message object
 * @param {string} props.message.role - 'user' or 'assistant'
 * @param {string} props.message.content - Message text
 * @param {string} [props.message.timestamp] - ISO timestamp
 */
export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex gap-3 px-4 py-2 ${isUser ? 'flex-row-reverse' : ''}`}
      data-testid={`chat-message-${message.role}`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-tne-red' : 'bg-white/10'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Bubble */}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
          isUser
            ? 'bg-tne-red text-white rounded-br-sm'
            : 'bg-white/10 text-white/90 rounded-bl-sm'
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
        {message.timestamp && (
          <span className="block text-[10px] opacity-50 mt-1">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )}
      </div>
    </div>
  );
}
