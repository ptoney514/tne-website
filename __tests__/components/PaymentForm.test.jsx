import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import PaymentForm from '@/components/payments/PaymentForm';

const mockUseRegistrationStatus = vi.fn();

vi.mock('@/hooks/useRegistrationStatus', () => ({
  useRegistrationStatus: (...args) => mockUseRegistrationStatus(...args),
}));

beforeEach(() => {
  mockUseRegistrationStatus.mockReturnValue({
    seasonName: 'Summer 2026',
    isRegistrationOpen: true,
    loading: false,
    error: null,
  });
});

describe('PaymentForm', () => {
  it('renders the payment form shell and status badge', () => {
    render(<PaymentForm />);

    expect(screen.getByTestId('payment-form')).toBeInTheDocument();
    expect(screen.getByText('Payment Options')).toBeInTheDocument();
    expect(screen.getByTestId('season-status')).toHaveTextContent(
      'Summer 2026 Registration Open'
    );
  });

  it('renders the live PayPal form configuration', () => {
    render(<PaymentForm />);

    const form = screen.getByTestId('paypal-payment-form');
    expect(form).toHaveAttribute('action', 'https://www.paypal.com/cgi-bin/webscr');
    expect(form).toHaveAttribute('method', 'post');
    expect(form).toHaveAttribute('target', '_blank');
    expect(form.querySelector('input[name="cmd"]')).toHaveValue('_s-xclick');
    expect(form.querySelector('input[name="hosted_button_id"]')).toHaveValue(
      'JR728RWWYXFCU'
    );
    expect(form.querySelector('input[name="currency_code"]')).toHaveValue('USD');
  });

  it('renders the PayPal payment options from the hosted button', () => {
    render(<PaymentForm />);

    const select = screen.getByLabelText('Payment Type');
    const options = within(select).getAllByRole('option');

    expect(options).toHaveLength(10);
    expect(select).toHaveValue('Express United (3rd/4th)');
    expect(screen.getByRole('option', { name: 'TNE Jr 3SSB $1,400.00 USD' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Boys Uniform $110.00 USD' })).toBeInTheDocument();
  });

  it('renders the player input and submit button', () => {
    render(<PaymentForm />);

    expect(screen.getByLabelText('Player Name')).toHaveAttribute('name', 'os1');
    expect(screen.getByLabelText('Player Name')).toHaveAttribute('maxlength', '200');
    expect(screen.getByRole('button', { name: 'Add to Cart' })).toBeInTheDocument();
    expect(
      screen.getByText('A new PayPal tab opens to finish payment securely.')
    ).toBeInTheDocument();
  });
});
