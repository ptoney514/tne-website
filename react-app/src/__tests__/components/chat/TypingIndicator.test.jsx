import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TypingIndicator from '../../../components/chat/TypingIndicator';

describe('TypingIndicator', () => {
  it('should render the typing indicator', () => {
    render(<TypingIndicator />);

    const indicator = screen.getByTestId('typing-indicator');
    expect(indicator).toBeInTheDocument();
  });

  it('should render three animated dots', () => {
    const { container } = render(<TypingIndicator />);

    const dots = container.querySelectorAll('.animate-bounce');
    expect(dots).toHaveLength(3);
  });

  it('should have staggered animation delays', () => {
    const { container } = render(<TypingIndicator />);

    const dots = container.querySelectorAll('.animate-bounce');

    expect(dots[0]).toHaveStyle({ animationDelay: '0ms' });
    expect(dots[1]).toHaveStyle({ animationDelay: '150ms' });
    expect(dots[2]).toHaveStyle({ animationDelay: '300ms' });
  });

  it('should have correct styling', () => {
    const { container } = render(<TypingIndicator />);

    const dotsContainer = container.querySelector('.bg-white\\/10');
    expect(dotsContainer).toBeInTheDocument();
    expect(dotsContainer).toHaveClass('rounded-2xl');
  });
});
