import { MessageCircle, X } from 'lucide-react';

/**
 * ChatButton - Floating action button to toggle chat widget
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether chat panel is open
 * @param {Function} props.onClick - Click handler to toggle chat
 * @param {boolean} [props.showBadge=false] - Whether to show notification badge
 * @param {number} [props.badgeCount=1] - Number to show in badge
 */
export default function ChatButton({
  isOpen,
  onClick,
  showBadge = false,
  badgeCount = 1,
}) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-tne-red hover:bg-tne-red-dark text-white shadow-lg shadow-tne-red/30 transition-all duration-200 flex items-center justify-center group"
      aria-label={isOpen ? 'Close chat' : 'Open chat'}
      data-testid="chat-toggle-button"
    >
      {/* Icon with rotation animation */}
      <div
        className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : 'rotate-0'}`}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </div>

      {/* Notification Badge */}
      {showBadge && badgeCount > 0 && (
        <span
          className="absolute -top-1 -right-1 w-5 h-5 bg-white text-tne-red text-xs font-bold rounded-full flex items-center justify-center shadow-md"
          data-testid="chat-badge"
        >
          {badgeCount > 9 ? '9+' : badgeCount}
        </span>
      )}

      {/* Pulse animation ring */}
      {!isOpen && (
        <span className="absolute inset-0 rounded-full bg-tne-red animate-ping opacity-20" />
      )}
    </button>
  );
}
