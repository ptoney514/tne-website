-- =============================================
-- ADD COACH FIELDS FOR COACHES MANAGEMENT PAGE
-- Issue #35
-- =============================================

-- Add new columns to coaches table
ALTER TABLE coaches ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'head_coach';
ALTER TABLE coaches ADD COLUMN IF NOT EXISTS years_with_org INTEGER DEFAULT 0;
ALTER TABLE coaches ADD COLUMN IF NOT EXISTS specialty TEXT;
ALTER TABLE coaches ADD COLUMN IF NOT EXISTS has_usa_cert BOOLEAN DEFAULT FALSE;
ALTER TABLE coaches ADD COLUMN IF NOT EXISTS has_cpr_cert BOOLEAN DEFAULT FALSE;
ALTER TABLE coaches ADD COLUMN IF NOT EXISTS has_background_check BOOLEAN DEFAULT FALSE;

-- Add comments for documentation
COMMENT ON COLUMN coaches.role IS 'Coach role: head_coach, assistant_coach, trainer';
COMMENT ON COLUMN coaches.years_with_org IS 'Number of years coaching with TNE';
COMMENT ON COLUMN coaches.specialty IS 'Coaching specialty: offense, defense, skills, etc.';
COMMENT ON COLUMN coaches.has_usa_cert IS 'Has USA Basketball coaching certification';
COMMENT ON COLUMN coaches.has_cpr_cert IS 'Has CPR/First Aid certification';
COMMENT ON COLUMN coaches.has_background_check IS 'Has passed background check';
