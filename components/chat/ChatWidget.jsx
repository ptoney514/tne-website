import { useState, useEffect, useCallback } from 'react';
import ChatButton from './ChatButton';
import ChatPanel from './ChatPanel';

// Check localStorage for tooltip seen state (runs once at initialization)
const getInitialTooltipSeenState = () => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('tne-chat-tooltip-seen') === 'true';
};

/**
 * ChatWidget - AI-powered chat assistant for TNE United Express
 *
 * Features:
 * - Floating button in bottom-right corner
 * - Expandable chat panel with message history
 * - Quick action chips for common questions
 * - Typing indicator during AI response
 * - Welcome tooltip on first visit
 *
 * @param {Object} props
 * @param {boolean} [props.defaultOpen=false] - Whether chat starts open
 * @param {boolean} [props.showBadge=true] - Whether to show notification badge
 * @param {number} [props.badgeCount=1] - Number to show in badge
 */
export default function ChatWidget({
  defaultOpen = false,
  showBadge = true,
  badgeCount = 1,
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasSeenTooltip, setHasSeenTooltip] = useState(getInitialTooltipSeenState);

  // Show tooltip after 3 seconds on first visit
  useEffect(() => {
    if (hasSeenTooltip) return;

    const timer = setTimeout(() => {
      if (!isOpen) {
        setShowTooltip(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isOpen, hasSeenTooltip]);

  // Listen for custom event to open chat (from contact page CTA)
  useEffect(() => {
    const handleOpenChat = () => {
      setIsOpen(true);
      setShowTooltip(false);
    };

    window.addEventListener('open-chat-widget', handleOpenChat);
    return () => window.removeEventListener('open-chat-widget', handleOpenChat);
  }, []);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
    setShowTooltip(false);
    if (!hasSeenTooltip) {
      setHasSeenTooltip(true);
      localStorage.setItem('tne-chat-tooltip-seen', 'true');
    }
  }, [hasSeenTooltip]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleTooltipClick = useCallback(() => {
    setIsOpen(true);
    setShowTooltip(false);
    setHasSeenTooltip(true);
    localStorage.setItem('tne-chat-tooltip-seen', 'true');
  }, []);

  return (
    <>
      {/* Floating Chat Button */}
      <ChatButton
        isOpen={isOpen}
        onClick={handleToggle}
        showBadge={showBadge && !isOpen}
        badgeCount={badgeCount}
      />

      {/* Chat Panel */}
      <ChatPanel isOpen={isOpen} onClose={handleClose} />

      {/* Welcome Tooltip */}
      {showTooltip && !isOpen && (
        <div
          className="fixed bottom-24 right-6 z-40 bg-[#151515] border border-white/10 rounded-xl px-4 py-3 shadow-xl max-w-[220px] animate-fade-in-up"
          data-testid="chat-tooltip"
        >
          {/* Arrow pointing down */}
          <div className="absolute -bottom-2 right-6 w-4 h-4 bg-[#151515] border-r border-b border-white/10 transform rotate-45" />
          <p className="text-sm text-white/80 leading-snug">
            👋 Need help finding schedules or team info?
          </p>
          <button
            onClick={handleTooltipClick}
            className="mt-2 text-xs text-tne-red hover:text-white transition-colors font-medium"
          >
            Chat with us →
          </button>
        </div>
      )}
    </>
  );
}
