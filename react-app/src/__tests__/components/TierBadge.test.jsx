import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TierBadge } from '../../components/TierBadge';

describe('TierBadge', () => {
  it('should render TNE Elite badge', () => {
    render(<TierBadge tier="tne" />);

    const badge = screen.getByTestId('tier-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('TNE Elite');
    expect(badge).toHaveAttribute('data-tier', 'tne');
  });

  it('should render Express United badge', () => {
    render(<TierBadge tier="express" />);

    const badge = screen.getByTestId('tier-badge');
    expect(badge).toHaveTextContent('Express United');
    expect(badge).toHaveAttribute('data-tier', 'express');
  });

  it('should render Development badge', () => {
    render(<TierBadge tier="dev" />);

    const badge = screen.getByTestId('tier-badge');
    expect(badge).toHaveTextContent('Development');
    expect(badge).toHaveAttribute('data-tier', 'dev');
  });

  it('should fall back to express for invalid tier', () => {
    render(<TierBadge tier="invalid" />);

    const badge = screen.getByTestId('tier-badge');
    expect(badge).toHaveTextContent('Express United');
  });

  it('should apply small size classes by default', () => {
    render(<TierBadge tier="tne" />);

    const badge = screen.getByTestId('tier-badge');
    expect(badge.className).toContain('text-[9px]');
  });

  it('should apply medium size classes when size=md', () => {
    render(<TierBadge tier="tne" size="md" />);

    const badge = screen.getByTestId('tier-badge');
    expect(badge.className).toContain('text-xs');
  });

  it('should apply custom className', () => {
    render(<TierBadge tier="tne" className="custom-class" />);

    const badge = screen.getByTestId('tier-badge');
    expect(badge.className).toContain('custom-class');
  });

  it('should render colored dot indicator', () => {
    render(<TierBadge tier="tne" />);

    const badge = screen.getByTestId('tier-badge');
    const dot = badge.querySelector('span.rounded-full');
    expect(dot).toBeInTheDocument();
    expect(dot.className).toContain('bg-tne-maroon');
  });
});
