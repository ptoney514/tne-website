/**
 * TypingIndicator - Animated dots to show AI is processing
 */
export default function TypingIndicator() {
  return (
    <div
      className="flex items-center gap-1 px-4 py-3"
      data-testid="typing-indicator"
    >
      <div className="flex items-center gap-1 bg-white/10 rounded-2xl px-4 py-2">
        <span
          className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
          style={{ animationDelay: '150ms' }}
        />
        <span
          className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
          style={{ animationDelay: '300ms' }}
        />
      </div>
    </div>
  );
}
