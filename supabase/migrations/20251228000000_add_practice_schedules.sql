-- Migration: Add Practice Schedules
-- Allows tracking multiple practice sessions per team with different days/locations
--
-- Design: Many-to-many relationship allows teams to share practice sessions
-- Example: "TNE Jr 3SSB 7th/8th" can have one practice session linked to multiple teams

-- =============================================================================
-- PRACTICE_SESSIONS TABLE (practice time slots)
-- =============================================================================

CREATE TABLE IF NOT EXISTS practice_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location TEXT NOT NULL,
    address TEXT,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_practice_sessions_season ON practice_sessions(season_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_day ON practice_sessions(day_of_week);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_active ON practice_sessions(is_active);

-- =============================================================================
-- PRACTICE_SESSION_TEAMS TABLE (many-to-many: teams assigned to practice sessions)
-- =============================================================================

CREATE TABLE IF NOT EXISTS practice_session_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practice_session_id UUID NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(practice_session_id, team_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_practice_session_teams_session ON practice_session_teams(practice_session_id);
CREATE INDEX IF NOT EXISTS idx_practice_session_teams_team ON practice_session_teams(team_id);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_session_teams ENABLE ROW LEVEL SECURITY;

-- Practice sessions policies
CREATE POLICY "Anyone can view practice_sessions" ON practice_sessions
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage practice_sessions" ON practice_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Practice session teams policies
CREATE POLICY "Anyone can view practice_session_teams" ON practice_session_teams
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage practice_session_teams" ON practice_session_teams
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- =============================================================================
-- TRIGGERS
-- =============================================================================

CREATE TRIGGER update_practice_sessions_updated_at
    BEFORE UPDATE ON practice_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE practice_sessions IS 'Practice time slots with day, time, and location';
COMMENT ON TABLE practice_session_teams IS 'Teams assigned to practice sessions (many-to-many)';
COMMENT ON COLUMN practice_sessions.day_of_week IS 'Day of week: Monday, Tuesday, etc.';
COMMENT ON COLUMN practice_sessions.location IS 'Practice facility name (e.g., Monroe MS, Central HS)';
COMMENT ON COLUMN practice_sessions.address IS 'Full address of practice location';
