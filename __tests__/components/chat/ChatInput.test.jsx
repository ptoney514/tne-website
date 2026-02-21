import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ChatInput from '@/components/chat/ChatInput';

describe('ChatInput', () => {
  it('should render the input form', () => {
    render(<ChatInput onSend={() => {}} />);

    const form = screen.getByTestId('chat-input-form');
    expect(form).toBeInTheDocument();
  });

  it('should render the input field with placeholder', () => {
    render(<ChatInput onSend={() => {}} placeholder="Ask a question..." />);

    const input = screen.getByTestId('chat-input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Ask a question...');
  });

  it('should render the send button', () => {
    render(<ChatInput onSend={() => {}} />);

    const button = screen.getByTestId('chat-send-button');
    expect(button).toBeInTheDocument();
  });

  it('should call onSend with message when submitted', () => {
    const handleSend = vi.fn();
    render(<ChatInput onSend={handleSend} />);

    const input = screen.getByTestId('chat-input');
    const form = screen.getByTestId('chat-input-form');

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.submit(form);

    expect(handleSend).toHaveBeenCalledWith('Test message');
  });

  it('should clear input after sending', () => {
    const handleSend = vi.fn();
    render(<ChatInput onSend={handleSend} />);

    const input = screen.getByTestId('chat-input');
    const form = screen.getByTestId('chat-input-form');

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.submit(form);

    expect(input).toHaveValue('');
  });

  it('should not send empty messages', () => {
    const handleSend = vi.fn();
    render(<ChatInput onSend={handleSend} />);

    const form = screen.getByTestId('chat-input-form');
    fireEvent.submit(form);

    expect(handleSend).not.toHaveBeenCalled();
  });

  it('should not send whitespace-only messages', () => {
    const handleSend = vi.fn();
    render(<ChatInput onSend={handleSend} />);

    const input = screen.getByTestId('chat-input');
    const form = screen.getByTestId('chat-input-form');

    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.submit(form);

    expect(handleSend).not.toHaveBeenCalled();
  });

  it('should disable input when disabled prop is true', () => {
    render(<ChatInput onSend={() => {}} disabled={true} />);

    const input = screen.getByTestId('chat-input');
    const button = screen.getByTestId('chat-send-button');

    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
  });

  it('should disable send button when input is empty', () => {
    render(<ChatInput onSend={() => {}} />);

    const button = screen.getByTestId('chat-send-button');
    expect(button).toBeDisabled();
  });

  it('should enable send button when input has text', () => {
    render(<ChatInput onSend={() => {}} />);

    const input = screen.getByTestId('chat-input');
    const button = screen.getByTestId('chat-send-button');

    fireEvent.change(input, { target: { value: 'Hello' } });

    expect(button).not.toBeDisabled();
  });

  it('should have accessible label', () => {
    render(<ChatInput onSend={() => {}} />);

    const input = screen.getByTestId('chat-input');
    expect(input).toHaveAttribute('aria-label', 'Chat message input');
  });

  it('should submit on Enter key', () => {
    const handleSend = vi.fn();
    render(<ChatInput onSend={handleSend} />);

    const input = screen.getByTestId('chat-input');

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(handleSend).toHaveBeenCalledWith('Test message');
  });

  it('should not submit on Shift+Enter', () => {
    const handleSend = vi.fn();
    render(<ChatInput onSend={handleSend} />);

    const input = screen.getByTestId('chat-input');

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });

    expect(handleSend).not.toHaveBeenCalled();
  });

  it('should have maxLength attribute with default value', () => {
    render(<ChatInput onSend={() => {}} />);

    const input = screen.getByTestId('chat-input');
    expect(input).toHaveAttribute('maxLength', '500');
  });

  it('should respect custom maxLength prop', () => {
    render(<ChatInput onSend={() => {}} maxLength={100} />);

    const input = screen.getByTestId('chat-input');
    expect(input).toHaveAttribute('maxLength', '100');
  });
});
