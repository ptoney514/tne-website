import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FeeSchedule from '../../components/payments/FeeSchedule';
import { feeItems } from '../../constants/payments';

describe('FeeSchedule', () => {
  it('should render the fee schedule section', () => {
    render(<FeeSchedule />);

    const feeSchedule = screen.getByTestId('fee-schedule');
    expect(feeSchedule).toBeInTheDocument();
  });

  it('should display the season indicator', () => {
    render(<FeeSchedule />);

    expect(screen.getByText('2025-26 Season')).toBeInTheDocument();
  });

  it('should display the section heading', () => {
    render(<FeeSchedule />);

    expect(screen.getByText('Fee Schedule')).toBeInTheDocument();
    expect(
      screen.getByText('Select your payment type from the dropdown menu')
    ).toBeInTheDocument();
  });

  it('should render all fee items', () => {
    render(<FeeSchedule />);

    const feeList = screen.getByTestId('fee-list');
    expect(feeList).toBeInTheDocument();

    feeItems.forEach((_, index) => {
      const feeItem = screen.getByTestId(`fee-item-${index}`);
      expect(feeItem).toBeInTheDocument();
    });
  });

  it('should display all fee names', () => {
    render(<FeeSchedule />);

    feeItems.forEach((item) => {
      expect(screen.getByText(item.name)).toBeInTheDocument();
    });
  });

  it('should display all fee descriptions', () => {
    render(<FeeSchedule />);

    // Check unique descriptions individually, handle duplicates with getAllByText
    expect(screen.getByText('Fall season registration')).toBeInTheDocument();
    expect(screen.getByText('Full season registration')).toBeInTheDocument();
    expect(screen.getByText('Winter season registration')).toBeInTheDocument();
    expect(screen.getByText('Elite circuit registration')).toBeInTheDocument();
    expect(screen.getAllByText('Youth development')).toHaveLength(2);
    expect(screen.getByText('Payment plan option')).toBeInTheDocument();
  });

  it('should render 7 fee items', () => {
    render(<FeeSchedule />);

    expect(feeItems).toHaveLength(7);
    feeItems.forEach((_, index) => {
      expect(screen.getByTestId(`fee-item-${index}`)).toBeInTheDocument();
    });
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

  it('should highlight the partial payment option', () => {
    render(<FeeSchedule />);

    // Find the partial payment item (index 6)
    const partialPaymentItem = screen.getByTestId('fee-item-6');
    expect(partialPaymentItem).toHaveClass('bg-tne-red/5');
  });

  it('should display correct fee amounts', () => {
    render(<FeeSchedule />);

    // Check specific fee amounts (some have duplicates)
    expect(screen.getByText('$300')).toBeInTheDocument(); // Boys Fall
    expect(screen.getAllByText('$450')).toHaveLength(2); // Girls & Boys Winter
    expect(screen.getByText('$1,400')).toBeInTheDocument(); // Jr. 3SSB
    expect(screen.getAllByText('$200')).toHaveLength(2); // K-2nd Fall & Winter
    expect(screen.getByText('$150')).toBeInTheDocument(); // Partial Payment
  });

  it('should include Jr. 3SSB elite option', () => {
    render(<FeeSchedule />);

    expect(screen.getByText('Jr. 3SSB (5th-8th)')).toBeInTheDocument();
    expect(screen.getByText('Elite circuit registration')).toBeInTheDocument();
  });
});
