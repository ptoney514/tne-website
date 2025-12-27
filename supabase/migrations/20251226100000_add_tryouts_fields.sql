-- Add tryouts control fields to seasons table
-- This creates a separate toggle from registration for tryout signups

-- Add tryouts_open boolean (defaults to false)
ALTER TABLE seasons ADD COLUMN IF NOT EXISTS tryouts_open BOOLEAN NOT NULL DEFAULT false;

-- Add tryouts_label for display (e.g., "Winter '25-26 Tryouts")
ALTER TABLE seasons ADD COLUMN IF NOT EXISTS tryouts_label TEXT;

-- Comment for clarity
COMMENT ON COLUMN seasons.tryouts_open IS 'Controls whether tryout signup is currently available';
COMMENT ON COLUMN seasons.tryouts_label IS 'Display label for tryout period (e.g., Winter 25-26 Tryouts)';
COMMENT ON COLUMN seasons.registration_open IS 'Controls whether team registration is available (post-selection)';
COMMENT ON COLUMN seasons.registration_label IS 'Display label for registration period';
