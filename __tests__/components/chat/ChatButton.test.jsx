import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ChatButton from '@/components/chat/ChatButton';

describe('ChatButton', () => {
  it('should render the chat toggle button', () => {
    render(<ChatButton isOpen={false} onClick={() => {}} />);

    const button = screen.getByTestId('chat-toggle-button');
    expect(button).toBeInTheDocument();
  });

  it('should show "Open chat" aria label when closed', () => {
    render(<ChatButton isOpen={false} onClick={() => {}} />);

    const button = screen.getByTestId('chat-toggle-button');
    expect(button).toHaveAttribute('aria-label', 'Open chat');
  });

  it('should show "Close chat" aria label when open', () => {
    render(<ChatButton isOpen={true} onClick={() => {}} />);

    const button = screen.getByTestId('chat-toggle-button');
    expect(button).toHaveAttribute('aria-label', 'Close chat');
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<ChatButton isOpen={false} onClick={handleClick} />);

    const button = screen.getByTestId('chat-toggle-button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should show notification badge when showBadge is true', () => {
    render(<ChatButton isOpen={false} onClick={() => {}} showBadge={true} badgeCount={3} />);

    const badge = screen.getByTestId('chat-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('3');
  });

  it('should not show notification badge when showBadge is false', () => {
    render(<ChatButton isOpen={false} onClick={() => {}} showBadge={false} badgeCount={3} />);

    expect(screen.queryByTestId('chat-badge')).not.toBeInTheDocument();
  });

  it('should not show badge when count is 0', () => {
    render(<ChatButton isOpen={false} onClick={() => {}} showBadge={true} badgeCount={0} />);

    expect(screen.queryByTestId('chat-badge')).not.toBeInTheDocument();
  });

  it('should show 9+ for badge counts greater than 9', () => {
    render(<ChatButton isOpen={false} onClick={() => {}} showBadge={true} badgeCount={15} />);

    const badge = screen.getByTestId('chat-badge');
    expect(badge).toHaveTextContent('9+');
  });

  it('should have correct styling classes', () => {
    render(<ChatButton isOpen={false} onClick={() => {}} />);

    const button = screen.getByTestId('chat-toggle-button');
    expect(button).toHaveClass('fixed', 'bottom-6', 'right-6', 'z-50');
    expect(button).toHaveClass('bg-tne-red');
  });
});
