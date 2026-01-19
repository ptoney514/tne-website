-- Add payment commitment fields to registrations table
-- Supports the multi-step registration wizard with payment plan selection

-- Payment commitment fields
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS payment_plan_type VARCHAR(20);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS payment_plan_option VARCHAR(50);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS initial_amount_due DECIMAL(10,2);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS remaining_balance DECIMAL(10,2);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS payment_reference_id VARCHAR(20);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS payment_confirmed BOOLEAN DEFAULT FALSE;

-- Separate waiver fields for granular tracking
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS waiver_liability BOOLEAN DEFAULT FALSE;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS waiver_medical BOOLEAN DEFAULT FALSE;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS waiver_media BOOLEAN DEFAULT FALSE;

-- Special arrangement request fields
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS special_request_reason VARCHAR(50);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS special_request_notes TEXT;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS special_request_approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS special_request_approved_by UUID REFERENCES auth.users(id);

-- Add comments for documentation
COMMENT ON COLUMN registrations.payment_plan_type IS 'Type of payment: full, installment, or special_request';
COMMENT ON COLUMN registrations.payment_plan_option IS 'Selected payment plan (plan_1, plan_2, etc.) for installment type';
COMMENT ON COLUMN registrations.initial_amount_due IS 'Amount due at registration (full amount or deposit)';
COMMENT ON COLUMN registrations.remaining_balance IS 'Remaining balance after initial payment';
COMMENT ON COLUMN registrations.payment_reference_id IS 'Unique reference ID for tracking payments (TNE-YYYY-XXXX)';
COMMENT ON COLUMN registrations.payment_confirmed IS 'Whether user confirmed they submitted payment';
COMMENT ON COLUMN registrations.waiver_liability IS 'Liability waiver acceptance';
COMMENT ON COLUMN registrations.waiver_medical IS 'Medical authorization waiver acceptance';
COMMENT ON COLUMN registrations.waiver_media IS 'Photo/video release waiver acceptance';
COMMENT ON COLUMN registrations.special_request_reason IS 'Reason for special payment arrangement request';
COMMENT ON COLUMN registrations.special_request_notes IS 'Additional details for special request';
COMMENT ON COLUMN registrations.special_request_approved_at IS 'When special request was approved';
COMMENT ON COLUMN registrations.special_request_approved_by IS 'Admin who approved the special request';

-- Update status column to support new granular statuses
-- Valid statuses: draft, pending_payment, payment_plan_active, awaiting_approval, fully_paid, roster_confirmed
COMMENT ON COLUMN registrations.status IS 'Registration status: draft, pending_payment, payment_plan_active, awaiting_approval, fully_paid, roster_confirmed';

-- Create index on payment_reference_id for quick lookups
CREATE INDEX IF NOT EXISTS idx_registrations_payment_reference_id ON registrations(payment_reference_id);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
