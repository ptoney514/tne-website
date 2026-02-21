import { useState, useRef, useEffect, useCallback } from 'react';
import { X, RotateCcw } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';

// Quick action chips for common questions
const QUICK_ACTIONS = [
  { id: 'schedule', label: 'Practice schedule', query: 'What are the practice schedules for each team?' },
  { id: 'tryouts', label: 'Tryout dates', query: 'When are the next tryouts?' },
  { id: 'fees', label: 'Registration fees', query: 'What are the registration fees?' },
  { id: 'contact', label: 'Contact info', query: 'How can I contact the coaches?' },
];

// Constants
const STORAGE_KEY = 'tne-chat-messages';
const SESSION_KEY = 'tne-chat-session-id';
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

// Generate or retrieve session ID
const getSessionId = () => {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

// Initial welcome message
const WELCOME_MESSAGE = {
  role: 'assistant',
  content: "Hi! I'm the TNE United Express assistant. I can help you with questions about our teams, schedules, registration, and more. What would you like to know?",
  timestamp: new Date().toISOString(),
};

// Load messages from localStorage
const loadMessages = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Validate structure
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Invalid data, use default
  }
  return [WELCOME_MESSAGE];
};

// Save messages to localStorage
const saveMessages = (messages) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // Storage full or unavailable, ignore
  }
};

/**
 * ChatPanel - Expandable chat interface with messages and input
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether panel is open
 * @param {Function} props.onClose - Callback to close panel
 */
export default function ChatPanel({ isOpen, onClose }) {
  const [messages, setMessages] = useState(loadMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(() => {
    const saved = loadMessages();
    return saved.length === 1;
  });
  const messagesEndRef = useRef(null);
  const lastRequestTimeRef = useRef(0);

  // Persist messages to localStorage
  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Send message to API with rate limiting
  const sendMessage = useCallback(async (content) => {
    // Rate limiting - prevent rapid submissions
    const now = Date.now();
    if (now - lastRequestTimeRef.current < MIN_REQUEST_INTERVAL) {
      return; // Ignore rapid requests
    }
    lastRequestTimeRef.current = now;

    const userMessage = {
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setShowQuickActions(false);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          sessionId: getSessionId(),
          pageUrl: window.location.pathname,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      const assistantMessage = {
        role: 'assistant',
        content: data.message || data.content || "I'm sorry, I couldn't process that request. Please try again.",
        timestamp: new Date().toISOString(),
        messageId: data.messageId, // Store server-generated ID for feedback
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment, or contact us directly at amitch2am@gmail.com.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  // Handle quick action click
  const handleQuickAction = useCallback((action) => {
    sendMessage(action.query);
  }, [sendMessage]);

  // Handle feedback submission
  const handleFeedback = useCallback(async (messageIndex, feedbackType) => {
    const message = messages[messageIndex];
    try {
      const response = await fetch('/api/chat-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: getSessionId(),
          feedback: feedbackType,
          // Prefer messageId for reliable lookup, fallback to content for older messages
          messageId: message?.messageId,
          messageContent: message?.content,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      // Update message with feedback
      setMessages((prev) => {
        const updated = [...prev];
        if (updated[messageIndex]) {
          updated[messageIndex] = { ...updated[messageIndex], feedback: feedbackType };
        }
        return updated;
      });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      throw error; // Re-throw so ChatMessage can revert
    }
  }, [messages]);

  // Reset chat and clear localStorage
  const handleReset = useCallback(() => {
    const freshWelcome = {
      ...WELCOME_MESSAGE,
      timestamp: new Date().toISOString(),
    };
    setMessages([freshWelcome]);
    setShowQuickActions(true);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SESSION_KEY); // Start fresh session on reset
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] h-[520px] max-h-[calc(100vh-120px)] bg-[#151515] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up"
      data-testid="chat-panel"
      role="dialog"
      aria-label="Chat with TNE Assistant"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0a0a0a]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-tne-red flex items-center justify-center">
            <span className="text-white text-sm font-bold">TNE</span>
          </div>
          <div>
            <h3 className="text-white text-sm font-semibold">TNE Assistant</h3>
            <p className="text-white/50 text-xs">Always here to help</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleReset}
            className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Reset chat"
            data-testid="chat-reset-button"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close chat"
            data-testid="chat-close-button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-2">
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            message={message}
            messageIndex={index}
            isWelcome={index === 0 && message.role === 'assistant'}
            onFeedback={handleFeedback}
          />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {showQuickActions && messages.length === 1 && (
        <div className="px-4 pb-2">
          <p className="text-white/40 text-xs mb-2">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action)}
                className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/80 rounded-full transition-colors"
                data-testid={`quick-action-${action.id}`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <ChatInput
        onSend={sendMessage}
        disabled={isLoading}
        placeholder="Ask about teams, schedules, fees..."
      />
    </div>
  );
}
