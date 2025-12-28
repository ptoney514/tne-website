-- Add registration control fields to seasons table
-- Allows admin to toggle registration open/closed and set display label

ALTER TABLE seasons ADD COLUMN IF NOT EXISTS registration_open BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE seasons ADD COLUMN IF NOT EXISTS registration_label TEXT;

-- Add comment for documentation
COMMENT ON COLUMN seasons.registration_open IS 'Whether registration is currently open for this season';
COMMENT ON COLUMN seasons.registration_label IS 'Display label for registration (e.g., "Fall/Winter ''25-26")';

-- Update RLS policy to allow public read of registration status
DROP POLICY IF EXISTS "Anyone can view season registration status" ON seasons;
CREATE POLICY "Anyone can view season registration status"
ON seasons FOR SELECT
TO anon
USING (true);
