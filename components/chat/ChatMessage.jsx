import { useState } from 'react';
import { Bot, User, ThumbsUp, ThumbsDown } from 'lucide-react';

/**
 * ChatMessage - Individual message bubble in chat
 *
 * @param {Object} props
 * @param {Object} props.message - Message object
 * @param {string} props.message.role - 'user' or 'assistant'
 * @param {string} props.message.content - Message text
 * @param {string} [props.message.timestamp] - ISO timestamp
 * @param {string} [props.message.feedback] - 'positive', 'negative', or null
 * @param {Function} [props.onFeedback] - Callback when feedback is given (messageIndex, feedback)
 * @param {number} [props.messageIndex] - Index of the message for feedback tracking
 * @param {boolean} [props.isWelcome] - Whether this is the welcome message (no feedback)
 */
export default function ChatMessage({ message, onFeedback, messageIndex, isWelcome = false }) {
  const isUser = message.role === 'user';
  const [feedback, setFeedback] = useState(message.feedback || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedback = async (type) => {
    if (isSubmitting || feedback) return; // Already submitted or in progress

    setIsSubmitting(true);
    const newFeedback = feedback === type ? null : type; // Toggle if same, otherwise set
    setFeedback(newFeedback);

    if (onFeedback) {
      try {
        await onFeedback(messageIndex, newFeedback);
      } catch (error) {
        console.error('Failed to submit feedback:', error);
        // Revert on error
        setFeedback(feedback);
      }
    }
    setIsSubmitting(false);
  };

  const showFeedback = !isUser && !isWelcome;

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

      {/* Message Bubble and Feedback */}
      <div className="flex flex-col gap-1 max-w-[75%]">
        <div
          className={`rounded-2xl px-4 py-2 ${
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

        {/* Feedback buttons for assistant messages */}
        {showFeedback && (
          <div className="flex items-center gap-1 ml-1" data-testid="feedback-buttons">
            <button
              onClick={() => handleFeedback('positive')}
              disabled={isSubmitting}
              className={`p-1 rounded transition-colors ${
                feedback === 'positive'
                  ? 'text-green-400 bg-green-400/20'
                  : 'text-white/30 hover:text-white/60 hover:bg-white/5'
              } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Helpful response"
              data-testid="feedback-positive"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleFeedback('negative')}
              disabled={isSubmitting}
              className={`p-1 rounded transition-colors ${
                feedback === 'negative'
                  ? 'text-red-400 bg-red-400/20'
                  : 'text-white/30 hover:text-white/60 hover:bg-white/5'
              } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Not helpful response"
              data-testid="feedback-negative"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
            {feedback && (
              <span className="text-[10px] text-white/40 ml-1">
                Thanks for your feedback!
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
