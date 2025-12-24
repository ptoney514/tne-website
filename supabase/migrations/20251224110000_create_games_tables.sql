-- Migration: Create Games and Game Teams Tables
-- Issue: #8 - Redesign Games/Tournaments Management
--
-- This creates a tournament-centric data model where games/tournaments
-- are created first, then teams are assigned to them.

-- =============================================================================
-- GAMES TABLE (master records for games/tournaments)
-- =============================================================================

CREATE TABLE IF NOT EXISTS games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    game_type TEXT NOT NULL CHECK (game_type IN ('game', 'tournament')),
    name TEXT NOT NULL,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    location TEXT,
    address TEXT,
    external_url TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_games_season ON games(season_id);
CREATE INDEX IF NOT EXISTS idx_games_date ON games(date);
CREATE INDEX IF NOT EXISTS idx_games_type ON games(game_type);

-- =============================================================================
-- GAME_TEAMS TABLE (many-to-many: teams assigned to games)
-- =============================================================================

CREATE TABLE IF NOT EXISTS game_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    opponent TEXT,
    is_home_game BOOLEAN,
    result TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(game_id, team_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_game_teams_game ON game_teams(game_id);
CREATE INDEX IF NOT EXISTS idx_game_teams_team ON game_teams(team_id);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_teams ENABLE ROW LEVEL SECURITY;

-- Games policies
CREATE POLICY "Anyone can view games" ON games
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage games" ON games
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Game teams policies
CREATE POLICY "Anyone can view game_teams" ON game_teams
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage game_teams" ON game_teams
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

CREATE TRIGGER update_games_updated_at
    BEFORE UPDATE ON games
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE games IS 'Master records for games and tournaments';
COMMENT ON TABLE game_teams IS 'Teams assigned to games/tournaments (many-to-many)';
COMMENT ON COLUMN games.game_type IS 'Type of event: game (single match) or tournament (multi-game event)';
COMMENT ON COLUMN games.external_url IS 'Link to external tournament website for details';
COMMENT ON COLUMN games.is_featured IS 'Highlight featured tournaments on public schedule';
COMMENT ON COLUMN game_teams.opponent IS 'Opponent team name (for single games)';
COMMENT ON COLUMN game_teams.result IS 'Game result: W, L, T, or tournament placement';
