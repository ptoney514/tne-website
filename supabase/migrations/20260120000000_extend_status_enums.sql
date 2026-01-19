-- Extend status columns with new values for registration wizard
-- This migration updates CHECK constraints to support the granular statuses
-- used by the multi-step registration flow

-- =============================================================================
-- UPDATE REGISTRATIONS TABLE STATUS CONSTRAINTS
-- =============================================================================

-- First, drop existing CHECK constraints if they exist
-- Note: We use ALTER COLUMN to modify the constraint inline with PostgreSQL
-- The constraint names are auto-generated, so we'll use a pattern to find them

-- For payment_status: Add pending_verification, payment_plan_active, awaiting_approval
-- For status: Add draft, pending_payment, payment_plan_active, awaiting_approval, fully_paid, roster_confirmed

-- Drop the old constraints (these may or may not exist depending on initial schema)
DO $$
BEGIN
    -- Try to drop payment_status constraint
    ALTER TABLE registrations DROP CONSTRAINT IF EXISTS registrations_payment_status_check;
EXCEPTION WHEN undefined_object THEN
    -- Constraint doesn't exist, continue
END $$;

DO $$
BEGIN
    -- Try to drop status constraint
    ALTER TABLE registrations DROP CONSTRAINT IF EXISTS registrations_status_check;
EXCEPTION WHEN undefined_object THEN
    -- Constraint doesn't exist, continue
END $$;

-- Add new payment_status constraint with extended values
-- Original values: pending, paid, partial, waived
-- New values: pending_verification, payment_plan_active, awaiting_approval
ALTER TABLE registrations
DROP CONSTRAINT IF EXISTS registrations_payment_status_check;

ALTER TABLE registrations
ADD CONSTRAINT registrations_payment_status_check
CHECK (payment_status IS NULL OR payment_status IN (
    'pending',
    'paid',
    'partial',
    'waived',
    'refunded',
    'pending_verification',
    'payment_plan_active',
    'awaiting_approval'
));

-- Add new status constraint with extended values
-- Original values: pending, approved, rejected
-- New values: draft, pending_payment, payment_plan_active, awaiting_approval, fully_paid, roster_confirmed
ALTER TABLE registrations
DROP CONSTRAINT IF EXISTS registrations_status_check;

ALTER TABLE registrations
ADD CONSTRAINT registrations_status_check
CHECK (status IS NULL OR status IN (
    'pending',
    'approved',
    'rejected',
    'draft',
    'pending_payment',
    'payment_plan_active',
    'awaiting_approval',
    'fully_paid',
    'roster_confirmed'
));

-- =============================================================================
-- ADD PAYMENT_TERMS_ACKNOWLEDGED COLUMN
-- =============================================================================

-- Add column to track payment terms acknowledgment (non-blocking fix)
ALTER TABLE registrations
ADD COLUMN IF NOT EXISTS payment_terms_acknowledged BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN registrations.payment_terms_acknowledged IS 'Whether parent acknowledged and agreed to payment terms';

-- =============================================================================
-- UPDATE COMMENTS FOR DOCUMENTATION
-- =============================================================================

COMMENT ON COLUMN registrations.payment_status IS 'Payment status: pending, paid, partial, waived, refunded, pending_verification, payment_plan_active, awaiting_approval';
COMMENT ON COLUMN registrations.status IS 'Registration status: pending, approved, rejected, draft, pending_payment, payment_plan_active, awaiting_approval, fully_paid, roster_confirmed';
