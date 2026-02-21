import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PaymentFAQ from '@/components/payments/PaymentFAQ';
import { faqItems } from '@/constants/payments';

describe('PaymentFAQ', () => {
  it('should render the FAQ section', () => {
    render(<PaymentFAQ />);

    const faqSection = screen.getByTestId('payment-faq');
    expect(faqSection).toBeInTheDocument();
  });

  it('should display the section heading', () => {
    render(<PaymentFAQ />);

    expect(screen.getByText('Payment Questions')).toBeInTheDocument();
    expect(
      screen.getByText('Common questions about fees and payments')
    ).toBeInTheDocument();
  });

  it('should render all FAQ items', () => {
    render(<PaymentFAQ />);

    const faqList = screen.getByTestId('faq-list');
    expect(faqList).toBeInTheDocument();

    // Check that all items are rendered
    faqItems.forEach((item, index) => {
      const faqItem = screen.getByTestId(`faq-item-${index}`);
      expect(faqItem).toBeInTheDocument();
    });
  });

  it('should display all FAQ questions', () => {
    render(<PaymentFAQ />);

    faqItems.forEach((item) => {
      expect(screen.getByText(item.question)).toBeInTheDocument();
    });
  });

  it('should display all FAQ answers', () => {
    render(<PaymentFAQ />);

    faqItems.forEach((item) => {
      expect(screen.getByText(item.answer)).toBeInTheDocument();
    });
  });

  it('should render 5 FAQ items', () => {
    render(<PaymentFAQ />);

    const details = screen.getAllByRole('group');
    expect(details).toHaveLength(5);
  });

  it('should have correct structure for accordion items', () => {
    render(<PaymentFAQ />);

    // Each FAQ item should be a details element
    faqItems.forEach((_, index) => {
      const faqItem = screen.getByTestId(`faq-item-${index}`);
      expect(faqItem.tagName.toLowerCase()).toBe('details');
    });
  });

  it('should include key topics in FAQ', () => {
    render(<PaymentFAQ />);

    // Check for specific important topics
    expect(
      screen.getByText("What's included in the registration fee?")
    ).toBeInTheDocument();
    expect(
      screen.getByText('Can I set up a payment plan?')
    ).toBeInTheDocument();
    expect(screen.getByText('What is Jr. 3SSB?')).toBeInTheDocument();
    expect(
      screen.getByText('Is there financial assistance available?')
    ).toBeInTheDocument();
  });
});
