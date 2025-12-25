import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChatMessage from '../../../components/chat/ChatMessage';

describe('ChatMessage', () => {
  it('should render user message', () => {
    const message = {
      role: 'user',
      content: 'Hello, I have a question about tryouts',
    };

    render(<ChatMessage message={message} />);

    const messageElement = screen.getByTestId('chat-message-user');
    expect(messageElement).toBeInTheDocument();
    expect(screen.getByText('Hello, I have a question about tryouts')).toBeInTheDocument();
  });

  it('should render assistant message', () => {
    const message = {
      role: 'assistant',
      content: 'Hi! I can help you with tryout information.',
    };

    render(<ChatMessage message={message} />);

    const messageElement = screen.getByTestId('chat-message-assistant');
    expect(messageElement).toBeInTheDocument();
    expect(screen.getByText('Hi! I can help you with tryout information.')).toBeInTheDocument();
  });

  it('should display timestamp when provided', () => {
    const timestamp = new Date('2025-12-24T10:30:00').toISOString();
    const message = {
      role: 'user',
      content: 'Test message',
      timestamp,
    };

    render(<ChatMessage message={message} />);

    // Should show time in HH:MM format
    expect(screen.getByText(/10:30/)).toBeInTheDocument();
  });

  it('should have different styling for user vs assistant', () => {
    const userMessage = { role: 'user', content: 'User message' };
    const assistantMessage = { role: 'assistant', content: 'Assistant message' };

    const { rerender } = render(<ChatMessage message={userMessage} />);

    const userElement = screen.getByTestId('chat-message-user');
    expect(userElement).toHaveClass('flex-row-reverse');

    rerender(<ChatMessage message={assistantMessage} />);

    const assistantElement = screen.getByTestId('chat-message-assistant');
    expect(assistantElement).not.toHaveClass('flex-row-reverse');
  });

  it('should preserve whitespace in message content', () => {
    const message = {
      role: 'assistant',
      content: 'Line 1\nLine 2\nLine 3',
    };

    render(<ChatMessage message={message} />);

    const text = screen.getByText(/Line 1/);
    expect(text).toHaveClass('whitespace-pre-wrap');
  });
});
