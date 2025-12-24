-- Add tier and tags columns to teams table
-- Tier: single-select classification (TNE Elite, Express United, Development)
-- Tags: multi-select metadata array (3SSB Circuit, Tournament Ready, etc.)

-- Add tier column with default value
ALTER TABLE teams ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'express'
  CHECK (tier IN ('tne', 'express', 'dev'));

-- Add tags column as text array
ALTER TABLE teams ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Create index for tier filtering
CREATE INDEX IF NOT EXISTS idx_teams_tier ON teams(tier);

-- Create GIN index for tags array search
CREATE INDEX IF NOT EXISTS idx_teams_tags ON teams USING GIN(tags);

-- Migrate existing teams based on naming conventions
-- TNE Jr 3SSB teams get 'tne' tier and '3ssb' tag
UPDATE teams
SET tier = 'tne', tags = ARRAY['3ssb']
WHERE name ILIKE '%TNE Jr 3SSB%' OR name ILIKE '%TNE 3SSB%';

-- Express United teams get 'express' tier
UPDATE teams
SET tier = 'express'
WHERE name ILIKE '%Express United%' AND tier = 'express';

-- Girls development teams
UPDATE teams
SET tier = 'dev'
WHERE name ILIKE 'Girls%' AND tier = 'express';

-- Comment for documentation
COMMENT ON COLUMN teams.tier IS 'Program tier: tne (TNE Elite), express (Express United), dev (Development)';
COMMENT ON COLUMN teams.tags IS 'Custom tags array: 3ssb, tournament, recruiting, etc.';
