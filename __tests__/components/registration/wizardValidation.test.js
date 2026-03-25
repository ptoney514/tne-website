import { describe, it, expect } from 'vitest';
import { validateStep3 } from '@/components/registration/wizardValidation';

describe('validateStep3', () => {
  it('should return error when paymentPlanType is empty', () => {
    const errors = validateStep3({ paymentPlanType: '' });
    expect(errors.paymentPlanType).toBe('Please select a payment option');
  });

  it('should return error when paymentPlanType is missing', () => {
    const errors = validateStep3({});
    expect(errors.paymentPlanType).toBe('Please select a payment option');
  });

  it('should pass for full payment', () => {
    const errors = validateStep3({ paymentPlanType: 'full' });
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it('should return error for installment without paymentPlanOption', () => {
    const errors = validateStep3({ paymentPlanType: 'installment', paymentPlanOption: '' });
    expect(errors.paymentPlanOption).toBe('Please select a payment plan');
  });

  it('should pass for installment with paymentPlanOption', () => {
    const errors = validateStep3({ paymentPlanType: 'installment', paymentPlanOption: 'planA' });
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it('should pass for make_arrangements with no extra fields', () => {
    const errors = validateStep3({ paymentPlanType: 'make_arrangements' });
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it('should pass for make_arrangements with optional notes', () => {
    const errors = validateStep3({
      paymentPlanType: 'make_arrangements',
      specialRequestNotes: 'Some notes',
    });
    expect(Object.keys(errors)).toHaveLength(0);
  });
});
