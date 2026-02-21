import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatMessage from '@/components/chat/ChatMessage';

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

  it('should show feedback buttons for assistant messages', () => {
    const message = {
      role: 'assistant',
      content: 'Test response',
    };

    render(<ChatMessage message={message} messageIndex={1} isWelcome={false} />);

    expect(screen.getByTestId('feedback-buttons')).toBeInTheDocument();
    expect(screen.getByTestId('feedback-positive')).toBeInTheDocument();
    expect(screen.getByTestId('feedback-negative')).toBeInTheDocument();
  });

  it('should not show feedback buttons for user messages', () => {
    const message = {
      role: 'user',
      content: 'Test question',
    };

    render(<ChatMessage message={message} messageIndex={1} />);

    expect(screen.queryByTestId('feedback-buttons')).not.toBeInTheDocument();
  });

  it('should not show feedback buttons for welcome message', () => {
    const message = {
      role: 'assistant',
      content: 'Welcome message',
    };

    render(<ChatMessage message={message} messageIndex={0} isWelcome={true} />);

    expect(screen.queryByTestId('feedback-buttons')).not.toBeInTheDocument();
  });

  it('should call onFeedback when thumbs up is clicked', async () => {
    const onFeedback = vi.fn().mockResolvedValue(undefined);
    const message = {
      role: 'assistant',
      content: 'Test response',
    };

    render(<ChatMessage message={message} messageIndex={2} isWelcome={false} onFeedback={onFeedback} />);

    const thumbsUp = screen.getByTestId('feedback-positive');
    fireEvent.click(thumbsUp);

    await waitFor(() => {
      expect(onFeedback).toHaveBeenCalledWith(2, 'positive');
    });
  });

  it('should call onFeedback when thumbs down is clicked', async () => {
    const onFeedback = vi.fn().mockResolvedValue(undefined);
    const message = {
      role: 'assistant',
      content: 'Test response',
    };

    render(<ChatMessage message={message} messageIndex={3} isWelcome={false} onFeedback={onFeedback} />);

    const thumbsDown = screen.getByTestId('feedback-negative');
    fireEvent.click(thumbsDown);

    await waitFor(() => {
      expect(onFeedback).toHaveBeenCalledWith(3, 'negative');
    });
  });

  it('should show thank you message after feedback is given', async () => {
    const onFeedback = vi.fn().mockResolvedValue(undefined);
    const message = {
      role: 'assistant',
      content: 'Test response',
    };

    render(<ChatMessage message={message} messageIndex={2} isWelcome={false} onFeedback={onFeedback} />);

    const thumbsUp = screen.getByTestId('feedback-positive');
    fireEvent.click(thumbsUp);

    await waitFor(() => {
      expect(screen.getByText(/Thanks for your feedback/)).toBeInTheDocument();
    });
  });
});
