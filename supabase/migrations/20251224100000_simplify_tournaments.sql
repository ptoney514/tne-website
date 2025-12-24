-- Migration: Simplify Tournament Management
-- Issue: #8 - Tournament Manager Simplification
--
-- Tournaments are just events on a team's schedule, like games or practices.
-- This migration removes the over-engineered tournament tables and adds
-- necessary fields to the events table instead.

-- =============================================================================
-- DROP TOURNAMENT TABLES (created in 20251223200000_add_tournaments.sql)
-- =============================================================================

-- Drop triggers first
DROP TRIGGER IF EXISTS update_tournament_registrations_updated_at ON tournament_registrations;
DROP TRIGGER IF EXISTS update_tournaments_updated_at ON tournaments;

-- Drop policies
DROP POLICY IF EXISTS "Admins can manage tournament registrations" ON tournament_registrations;
DROP POLICY IF EXISTS "Anyone can view tournament registrations" ON tournament_registrations;
DROP POLICY IF EXISTS "Admins can manage tournaments" ON tournaments;
DROP POLICY IF EXISTS "Anyone can view tournaments" ON tournaments;

-- Drop indexes
DROP INDEX IF EXISTS idx_tournament_registrations_team;
DROP INDEX IF EXISTS idx_tournament_registrations_tournament;
DROP INDEX IF EXISTS idx_tournaments_status;
DROP INDEX IF EXISTS idx_tournaments_start_date;
DROP INDEX IF EXISTS idx_tournaments_season;

-- Drop tables
DROP TABLE IF EXISTS tournament_registrations;
DROP TABLE IF EXISTS tournaments;

-- =============================================================================
-- ADD FIELDS TO EVENTS TABLE
-- =============================================================================

-- Add external_url for linking to tournament organizer's website
ALTER TABLE events ADD COLUMN IF NOT EXISTS external_url TEXT;

-- Add is_featured flag for high-profile tournaments
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;

-- Create index for featured events (useful for homepage/featured sections)
CREATE INDEX IF NOT EXISTS idx_events_featured ON events(is_featured) WHERE is_featured = true;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON COLUMN events.external_url IS 'Link to external tournament website for details, registration, etc.';
COMMENT ON COLUMN events.is_featured IS 'Flag to highlight high-profile tournaments on the schedule';
