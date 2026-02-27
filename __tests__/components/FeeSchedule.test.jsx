import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import FeeSchedule from '@/components/payments/FeeSchedule';

// Mock the hooks with vi.fn so we can override per-test
const mockUseRegistrationStatus = vi.fn();
const mockUseSeasonFees = vi.fn();

vi.mock('@/hooks/useRegistrationStatus', () => ({
  useRegistrationStatus: (...args) => mockUseRegistrationStatus(...args),
}));

vi.mock('@/hooks/useSeasonFees', () => ({
  useSeasonFees: (...args) => mockUseSeasonFees(...args),
}));

const mockFees = [
  { id: '1', name: 'Boys Fall (3rd-8th)', description: 'Fall season registration', amount: 300 },
  { id: '2', name: 'Girls (3rd-8th)', description: 'Full season registration', amount: 450 },
  { id: '3', name: 'Jr. 3SSB (5th-8th)', description: 'Elite circuit registration', amount: 1400 },
];

beforeEach(() => {
  mockUseRegistrationStatus.mockReturnValue({
    seasonId: 'test-season-1',
    seasonName: 'Fall 2025',
    loading: false,
    error: null,
  });
  mockUseSeasonFees.mockReturnValue({
    fees: mockFees,
    loading: false,
    error: null,
  });
});

describe('FeeSchedule', () => {
  it('should render the fee schedule section', () => {
    render(<FeeSchedule />);

    const feeSchedule = screen.getByTestId('fee-schedule');
    expect(feeSchedule).toBeInTheDocument();
  });

  it('should display the season indicator from API', () => {
    render(<FeeSchedule />);

    expect(screen.getByTestId('season-indicator')).toHaveTextContent('Fall 2025');
  });

  it('should display the section heading', () => {
    render(<FeeSchedule />);

    expect(screen.getByText('Fee Schedule')).toBeInTheDocument();
    expect(
      screen.getByText('Select your payment type from the dropdown menu')
    ).toBeInTheDocument();
  });

  it('should render fee items from API', () => {
    render(<FeeSchedule />);

    const feeList = screen.getByTestId('fee-list');
    expect(feeList).toBeInTheDocument();

    mockFees.forEach((_, index) => {
      const feeItem = screen.getByTestId(`fee-item-${index}`);
      expect(feeItem).toBeInTheDocument();
    });
  });

  it('should display fee names from API', () => {
    render(<FeeSchedule />);

    mockFees.forEach((fee) => {
      expect(screen.getByText(fee.name)).toBeInTheDocument();
    });
  });

  it('should display fee amounts formatted as currency', () => {
    render(<FeeSchedule />);

    expect(screen.getByText('$300')).toBeInTheDocument();
    expect(screen.getByText('$450')).toBeInTheDocument();
    expect(screen.getByText('$1,400')).toBeInTheDocument();
  });

  it('should display help section with contact info', () => {
    render(<FeeSchedule />);

    const helpSection = screen.getByTestId('help-section');
    expect(helpSection).toBeInTheDocument();

    expect(
      screen.getByText(/Questions about fees or need a payment plan\?/)
    ).toBeInTheDocument();
    expect(screen.getByText('amitch2am@gmail.com')).toBeInTheDocument();
    expect(screen.getByText('(402) 510-4919')).toBeInTheDocument();
  });

  it('should have correct contact links', () => {
    render(<FeeSchedule />);

    const emailLink = screen.getByText('amitch2am@gmail.com');
    expect(emailLink.closest('a')).toHaveAttribute(
      'href',
      'mailto:amitch2am@gmail.com'
    );

    const phoneLink = screen.getByText('(402) 510-4919');
    expect(phoneLink.closest('a')).toHaveAttribute('href', 'tel:+14025104919');
  });
});

describe('FeeSchedule - Empty State', () => {
  it('should show empty state when no fees', () => {
    mockUseSeasonFees.mockReturnValue({
      fees: [],
      loading: false,
      error: null,
    });

    render(<FeeSchedule />);
    expect(screen.getByTestId('fee-empty-state')).toBeInTheDocument();
    expect(screen.getByText('Fee schedule will be available soon')).toBeInTheDocument();
  });
});
