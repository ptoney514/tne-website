import { pgEnum } from 'drizzle-orm/pg-core';

// User roles for access control
export const userRoleEnum = pgEnum('user_role', ['admin', 'coach', 'parent']);

// Gender options
export const genderEnum = pgEnum('gender', ['male', 'female']);

// Registration workflow status
export const registrationStatusEnum = pgEnum('registration_status', [
  'pending',
  'approved',
  'rejected',
]);

// How registration was initiated
export const registrationSourceEnum = pgEnum('registration_source', [
  'tryout_offer',
  'direct',
]);

// Payment tracking
export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'paid',
  'partial',
  'waived',
]);

// Tryout signup workflow
export const tryoutSignupStatusEnum = pgEnum('tryout_signup_status', [
  'registered',
  'attended',
  'offered',
  'declined',
  'no_show',
]);

// Event types for schedule
export const eventTypeEnum = pgEnum('event_type', [
  'practice',
  'game',
  'tournament',
  'tryout',
  'other',
]);
