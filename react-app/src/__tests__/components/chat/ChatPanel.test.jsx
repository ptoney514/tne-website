import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatPanel from '../../../components/chat/ChatPanel';

// Mock fetch
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

// Mock scrollIntoView which is not available in jsdom
Element.prototype.scrollIntoView = vi.fn();

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('ChatPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: 'Mock response from AI' }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should not render when closed', () => {
    render(<ChatPanel isOpen={false} onClose={() => {}} />);

    expect(screen.queryByTestId('chat-panel')).not.toBeInTheDocument();
  });

  it('should render when open', () => {
    render(<ChatPanel isOpen={true} onClose={() => {}} />);

    const panel = screen.getByTestId('chat-panel');
    expect(panel).toBeInTheDocument();
  });

  it('should display header with title', () => {
    render(<ChatPanel isOpen={true} onClose={() => {}} />);

    expect(screen.getByText('TNE Assistant')).toBeInTheDocument();
    expect(screen.getByText('Always here to help')).toBeInTheDocument();
  });

  it('should display welcome message', () => {
    render(<ChatPanel isOpen={true} onClose={() => {}} />);

    expect(screen.getByText(/I'm the TNE United Express assistant/)).toBeInTheDocument();
  });

  it('should display quick action buttons', () => {
    render(<ChatPanel isOpen={true} onClose={() => {}} />);

    expect(screen.getByTestId('quick-action-schedule')).toBeInTheDocument();
    expect(screen.getByTestId('quick-action-tryouts')).toBeInTheDocument();
    expect(screen.getByTestId('quick-action-fees')).toBeInTheDocument();
    expect(screen.getByTestId('quick-action-contact')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<ChatPanel isOpen={true} onClose={handleClose} />);

    const closeButton = screen.getByTestId('chat-close-button');
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should send message when submitted', async () => {
    render(<ChatPanel isOpen={true} onClose={() => {}} />);

    const input = screen.getByTestId('chat-input');
    const form = screen.getByTestId('chat-input-form');

    fireEvent.change(input, { target: { value: 'What are the practice times?' } });
    fireEvent.submit(form);

    // User message should appear
    await waitFor(() => {
      expect(screen.getByText('What are the practice times?')).toBeInTheDocument();
    });

    // Should call fetch with correct data
    expect(mockFetch).toHaveBeenCalledWith('/api/chat', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }));
  });

  it('should display AI response after sending message', async () => {
    render(<ChatPanel isOpen={true} onClose={() => {}} />);

    const input = screen.getByTestId('chat-input');
    const form = screen.getByTestId('chat-input-form');

    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Mock response from AI')).toBeInTheDocument();
    });
  });

  it('should show typing indicator while loading', async () => {
    // Create a delayed promise to simulate slow response
    mockFetch.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Response' }),
      }), 100))
    );

    render(<ChatPanel isOpen={true} onClose={() => {}} />);

    const input = screen.getByTestId('chat-input');
    const form = screen.getByTestId('chat-input-form');

    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.submit(form);

    // Typing indicator should appear while loading
    await waitFor(() => {
      expect(screen.getByTestId('typing-indicator')).toBeInTheDocument();
    });
  });

  it('should disable input while loading', async () => {
    mockFetch.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Response' }),
      }), 100))
    );

    render(<ChatPanel isOpen={true} onClose={() => {}} />);

    const input = screen.getByTestId('chat-input');
    const form = screen.getByTestId('chat-input-form');

    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(input).toBeDisabled();
    });
  });

  it('should handle API errors gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    render(<ChatPanel isOpen={true} onClose={() => {}} />);

    const input = screen.getByTestId('chat-input');
    const form = screen.getByTestId('chat-input-form');

    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/trouble connecting/)).toBeInTheDocument();
    });
  });

  it('should reset chat when reset button is clicked', async () => {
    render(<ChatPanel isOpen={true} onClose={() => {}} />);

    // Send a message first
    const input = screen.getByTestId('chat-input');
    const form = screen.getByTestId('chat-input-form');

    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });

    // Click reset
    const resetButton = screen.getByTestId('chat-reset-button');
    fireEvent.click(resetButton);

    // User message should be gone, welcome message should remain
    await waitFor(() => {
      expect(screen.queryByText('Hello')).not.toBeInTheDocument();
      expect(screen.getByText(/I'm the TNE United Express assistant/)).toBeInTheDocument();
    });
  });

  it('should hide quick actions after first message', async () => {
    render(<ChatPanel isOpen={true} onClose={() => {}} />);

    // Quick actions should be visible initially
    expect(screen.getByTestId('quick-action-schedule')).toBeInTheDocument();

    const input = screen.getByTestId('chat-input');
    const form = screen.getByTestId('chat-input-form');

    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.queryByTestId('quick-action-schedule')).not.toBeInTheDocument();
    });
  });

  it('should send quick action query when clicked', async () => {
    render(<ChatPanel isOpen={true} onClose={() => {}} />);

    const scheduleButton = screen.getByTestId('quick-action-schedule');
    fireEvent.click(scheduleButton);

    await waitFor(() => {
      expect(screen.getByText('What are the practice schedules for each team?')).toBeInTheDocument();
    });
  });

  it('should have accessible dialog role', () => {
    render(<ChatPanel isOpen={true} onClose={() => {}} />);

    const panel = screen.getByTestId('chat-panel');
    expect(panel).toHaveAttribute('role', 'dialog');
    expect(panel).toHaveAttribute('aria-label', 'Chat with TNE Assistant');
  });

  it('should save messages to localStorage', async () => {
    render(<ChatPanel isOpen={true} onClose={() => {}} />);

    const input = screen.getByTestId('chat-input');
    const form = screen.getByTestId('chat-input-form');

    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'tne-chat-messages',
        expect.any(String)
      );
    });
  });

  it('should load messages from localStorage on mount', () => {
    const savedMessages = [
      { role: 'assistant', content: 'Welcome!', timestamp: '2025-01-01T00:00:00Z' },
      { role: 'user', content: 'Previous message', timestamp: '2025-01-01T00:01:00Z' },
    ];
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(savedMessages));

    render(<ChatPanel isOpen={true} onClose={() => {}} />);

    expect(screen.getByText('Previous message')).toBeInTheDocument();
  });

  it('should clear localStorage when reset button is clicked', async () => {
    render(<ChatPanel isOpen={true} onClose={() => {}} />);

    // Send a message first
    const input = screen.getByTestId('chat-input');
    const form = screen.getByTestId('chat-input-form');

    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });

    // Click reset
    const resetButton = screen.getByTestId('chat-reset-button');
    fireEvent.click(resetButton);

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('tne-chat-messages');
  });
});
