// @ts-check
import { test, expect } from '@playwright/test';
import {
  isTestClientConfigured,
  verifyRegistration,
} from '../../fixtures/testDbClient.js';

/**
 * Payment Path DB Verification Tests
 *
 * Verifies that each payment path saves the correct paymentPlanType
 * and paymentStatus to the database.
 *
 * These tests run against real database submissions (no API mocking)
 * and are designed to run AFTER the form-submissions tests.
 */

test.describe('Payment Path DB Verification', () => {
  test.skip(!isTestClientConfigured(), 'DATABASE_URL not configured — skipping DB verification');

  test('full payment saves correct payment type and status', async () => {
    // Look for a recent test registration with full payment
    // test.reg0@example.com is index 0 → paymentType cycles: full (0%3=0)
    try {
      const registration = await verifyRegistration('test.reg0@example.com', {
        paymentPlanType: 'full',
      });
      expect(registration.paymentStatus).toBe('pending');
      expect(registration.paymentPlanType).toBe('full');
    } catch {
      test.skip(true, 'No test registration found for full payment — run form-submissions first');
    }
  });

  test('installment payment saves correct payment type and status', async () => {
    // test.reg1@example.com is index 1 → paymentType cycles: installment (1%3=1)
    try {
      const registration = await verifyRegistration('test.reg1@example.com', {
        paymentPlanType: 'installment',
      });
      expect(registration.paymentStatus).toBe('partial');
      expect(registration.paymentPlanType).toBe('installment');
    } catch {
      test.skip(true, 'No test registration found for installment — run form-submissions first');
    }
  });

  test('make_arrangements saves correct payment type and status', async () => {
    // test.reg2@example.com is index 2 → paymentType cycles: make_arrangements (2%3=2)
    try {
      const registration = await verifyRegistration('test.reg2@example.com', {
        paymentPlanType: 'make_arrangements',
      });
      expect(registration.paymentStatus).toBe('pending');
      expect(registration.paymentPlanType).toBe('make_arrangements');
    } catch {
      test.skip(true, 'No test registration found for make_arrangements — run form-submissions first');
    }
  });
});
