import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TagBadge } from '@/components/TagBadge';

describe('TagBadge', () => {
  it('should render 3SSB tag badge', () => {
    render(<TagBadge tag="3ssb" />);

    const badge = screen.getByTestId('tag-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('3SSB');
    expect(badge).toHaveAttribute('data-tag', '3ssb');
  });

  it('should render tournament tag badge', () => {
    render(<TagBadge tag="tournament" />);

    const badge = screen.getByTestId('tag-badge');
    expect(badge).toHaveTextContent('Tournament');
    expect(badge).toHaveAttribute('data-tag', 'tournament');
  });

  it('should render recruiting tag badge', () => {
    render(<TagBadge tag="recruiting" />);

    const badge = screen.getByTestId('tag-badge');
    expect(badge).toHaveTextContent('Recruiting');
    expect(badge).toHaveAttribute('data-tag', 'recruiting');
  });

  it('should return null for invalid tag', () => {
    const { container } = render(<TagBadge tag="invalid" />);
    expect(container.firstChild).toBeNull();
  });

  it('should return null for undefined tag', () => {
    const { container } = render(<TagBadge tag={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('should apply small size classes by default', () => {
    render(<TagBadge tag="3ssb" />);

    const badge = screen.getByTestId('tag-badge');
    expect(badge.className).toContain('text-[9px]');
  });

  it('should apply medium size classes when size=md', () => {
    render(<TagBadge tag="3ssb" size="md" />);

    const badge = screen.getByTestId('tag-badge');
    expect(badge.className).toContain('text-xs');
  });

  it('should apply custom className', () => {
    render(<TagBadge tag="3ssb" className="custom-class" />);

    const badge = screen.getByTestId('tag-badge');
    expect(badge.className).toContain('custom-class');
  });

  it('should have correct color classes for 3ssb', () => {
    render(<TagBadge tag="3ssb" />);

    const badge = screen.getByTestId('tag-badge');
    expect(badge.className).toContain('bg-purple-100');
    expect(badge.className).toContain('text-purple-700');
  });

  it('should have correct color classes for tournament', () => {
    render(<TagBadge tag="tournament" />);

    const badge = screen.getByTestId('tag-badge');
    expect(badge.className).toContain('bg-orange-100');
    expect(badge.className).toContain('text-orange-700');
  });
});
