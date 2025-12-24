-- =============================================================================
-- TNE United Express - 2025-26 Season Seed Data
-- =============================================================================
-- This script seeds coaches, teams, tournaments, and OSA league games
-- for the 2025-26 Winter season.
--
-- Usage:
--   psql $DATABASE_URL -f supabase/seed/games_seed.sql
--
-- To clear and reseed:
--   Run this script again - it truncates existing data first
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. CLEAR EXISTING DATA (respects foreign key order)
-- =============================================================================
-- Note: Using DELETE instead of TRUNCATE to work with RLS
DELETE FROM game_teams;
DELETE FROM games;
DELETE FROM team_roster;
DELETE FROM teams;
DELETE FROM coaches;

-- =============================================================================
-- 2. GET SEASON ID AND INSERT ALL DATA
-- =============================================================================
DO $$
DECLARE
    v_season_id UUID;

    -- Coach IDs
    v_coach_foster UUID;
    v_coach_grixby UUID;
    v_coach_evans UUID;
    v_coach_darryle UUID;

    -- Team IDs (Boys)
    v_team_3rd_4th_foster UUID;
    v_team_4th_grixby UUID;
    v_team_jr3ssb_5th UUID;
    v_team_express_5th UUID;
    v_team_express_6th UUID;
    v_team_jr3ssb_6th UUID;
    v_team_express_7th UUID;
    v_team_express_8th UUID;
    v_team_jr3ssb_7th UUID;
    v_team_jr3ssb_8th UUID;
    v_team_tne_8th UUID;

    -- Team IDs (Girls)
    v_team_girls_5th UUID;
    v_team_girls_6th UUID;
    v_team_girls_7th UUID;
    v_team_girls_8th UUID;

    -- Tournament IDs
    v_tourn_newyear UUID;
    v_tourn_dream UUID;
    v_tourn_tristate UUID;
    v_tourn_frenzy UUID;
    v_tourn_amp UUID;
    v_tourn_midwest UUID;

    -- Loop variables
    v_week_num INT;
    v_game_date DATE;
    v_is_saturday BOOLEAN;

BEGIN
    -- Get the active season
    SELECT id INTO v_season_id FROM seasons WHERE name = '2025-26 Winter' AND is_active = true;

    IF v_season_id IS NULL THEN
        RAISE EXCEPTION 'Season "2025-26 Winter" not found. Please create the season first.';
    END IF;

    RAISE NOTICE 'Using season: 2025-26 Winter (ID: %)', v_season_id;

    -- =============================================================================
    -- 3. INSERT COACHES
    -- =============================================================================
    INSERT INTO coaches (first_name, last_name, email, is_active)
    VALUES ('Coach', 'Foster', 'coach.foster@tneunited.com', true)
    RETURNING id INTO v_coach_foster;

    INSERT INTO coaches (first_name, last_name, email, is_active)
    VALUES ('Coach', 'Grixby', 'coach.grixby@tneunited.com', true)
    RETURNING id INTO v_coach_grixby;

    INSERT INTO coaches (first_name, last_name, email, is_active)
    VALUES ('Coach', 'Evans', 'coach.evans@tneunited.com', true)
    RETURNING id INTO v_coach_evans;

    INSERT INTO coaches (first_name, last_name, email, is_active)
    VALUES ('Coach', 'Darryle', 'coach.darryle@tneunited.com', true)
    RETURNING id INTO v_coach_darryle;

    RAISE NOTICE 'Inserted 4 coaches';

    -- =============================================================================
    -- 4. INSERT BOYS TEAMS
    -- =============================================================================

    -- 3rd/4th Foster
    INSERT INTO teams (season_id, name, grade_level, gender, head_coach_id, practice_location, practice_days, practice_time, is_active)
    VALUES (v_season_id, '3rd/4th Foster', '3rd', 'male', v_coach_foster, 'Monroe MS', 'Mon/Wed', '6:00-7:30 PM', true)
    RETURNING id INTO v_team_3rd_4th_foster;

    -- 4th Grixby/Evans
    INSERT INTO teams (season_id, name, grade_level, gender, head_coach_id, assistant_coach_id, practice_location, practice_days, practice_time, is_active)
    VALUES (v_season_id, '4th Grixby/Evans', '4th', 'male', v_coach_grixby, v_coach_evans, 'Monroe MS', 'Tue/Wed', '6:00-7:30 PM', true)
    RETURNING id INTO v_team_4th_grixby;

    -- TNE Jr 3SSB 5th
    INSERT INTO teams (season_id, name, grade_level, gender, practice_location, practice_days, practice_time, is_active)
    VALUES (v_season_id, 'TNE Jr 3SSB 5th', '5th', 'male', 'Monroe MS', 'Tue/Thu', '6:00-7:30 PM', true)
    RETURNING id INTO v_team_jr3ssb_5th;

    -- Express United 5th
    INSERT INTO teams (season_id, name, grade_level, gender, practice_location, practice_days, practice_time, is_active)
    VALUES (v_season_id, 'Express United 5th', '5th', 'male', 'Monroe MS', 'Tue/Thu', '6:00-7:30 PM', true)
    RETURNING id INTO v_team_express_5th;

    -- Express United 6th
    INSERT INTO teams (season_id, name, grade_level, gender, head_coach_id, practice_location, practice_days, practice_time, is_active)
    VALUES (v_season_id, 'Express United 6th', '6th', 'male', v_coach_darryle, 'McMillan MS / Monroe MS', 'Tue/Thu', '6:00-7:30 PM', true)
    RETURNING id INTO v_team_express_6th;

    -- TNE Jr 3SSB 6th
    INSERT INTO teams (season_id, name, grade_level, gender, practice_location, practice_days, practice_time, is_active)
    VALUES (v_season_id, 'TNE Jr 3SSB 6th', '6th', 'male', 'McMillan MS / Central HS', 'Tue/Wed', '6:00-7:30 PM', true)
    RETURNING id INTO v_team_jr3ssb_6th;

    -- Express United 7th
    INSERT INTO teams (season_id, name, grade_level, gender, practice_location, practice_days, practice_time, is_active)
    VALUES (v_season_id, 'Express United 7th', '7th', 'male', 'Central HS', 'Mon/Wed', '6:00-7:30 PM', true)
    RETURNING id INTO v_team_express_7th;

    -- Express United 8th
    INSERT INTO teams (season_id, name, grade_level, gender, practice_location, practice_days, practice_time, is_active)
    VALUES (v_season_id, 'Express United 8th', '8th', 'male', 'Central HS', 'Mon/Wed', '6:00-7:30 PM', true)
    RETURNING id INTO v_team_express_8th;

    -- TNE Jr 3SSB 7th
    INSERT INTO teams (season_id, name, grade_level, gender, practice_location, practice_days, practice_time, is_active)
    VALUES (v_season_id, 'TNE Jr 3SSB 7th', '7th', 'male', 'Central HS / North HS', 'Wed/Thu', '6:00-7:30 PM', true)
    RETURNING id INTO v_team_jr3ssb_7th;

    -- TNE Jr 3SSB 8th
    INSERT INTO teams (season_id, name, grade_level, gender, practice_location, practice_days, practice_time, is_active)
    VALUES (v_season_id, 'TNE Jr 3SSB 8th', '8th', 'male', 'Central HS / North HS', 'Wed/Thu', '6:00-7:30 PM', true)
    RETURNING id INTO v_team_jr3ssb_8th;

    -- TNE 8th
    INSERT INTO teams (season_id, name, grade_level, gender, practice_location, practice_days, practice_time, is_active)
    VALUES (v_season_id, 'TNE 8th', '8th', 'male', 'Central HS / North HS', 'Wed/Thu', '6:00-7:30 PM', true)
    RETURNING id INTO v_team_tne_8th;

    RAISE NOTICE 'Inserted 11 boys teams';

    -- =============================================================================
    -- 5. INSERT GIRLS TEAMS
    -- =============================================================================

    -- Girls 5th
    INSERT INTO teams (season_id, name, grade_level, gender, practice_location, practice_days, practice_time, is_active)
    VALUES (v_season_id, 'Girls 5th', '5th', 'female', 'North HS / Boys & Girls Club', 'Mon/Thu', '6:30-8:30 PM', true)
    RETURNING id INTO v_team_girls_5th;

    -- Girls 6th
    INSERT INTO teams (season_id, name, grade_level, gender, practice_location, practice_days, practice_time, is_active)
    VALUES (v_season_id, 'Girls 6th', '6th', 'female', 'North HS / Boys & Girls Club', 'Mon/Thu', '6:30-8:30 PM', true)
    RETURNING id INTO v_team_girls_6th;

    -- Girls 7th
    INSERT INTO teams (season_id, name, grade_level, gender, practice_location, practice_days, practice_time, is_active)
    VALUES (v_season_id, 'Girls 7th', '7th', 'female', 'North HS / Boys & Girls Club', 'Mon/Thu', '6:30-8:30 PM', true)
    RETURNING id INTO v_team_girls_7th;

    -- Girls 8th
    INSERT INTO teams (season_id, name, grade_level, gender, practice_location, practice_days, practice_time, is_active)
    VALUES (v_season_id, 'Girls 8th', '8th', 'female', 'North HS / Nathan Hale MS', 'Mon/Thu', '6:30-8:30 PM', true)
    RETURNING id INTO v_team_girls_8th;

    RAISE NOTICE 'Inserted 4 girls teams';

    -- =============================================================================
    -- 6. INSERT TOURNAMENTS
    -- =============================================================================

    -- New Year's Tip-Off (Boys only)
    INSERT INTO games (season_id, game_type, name, date, location, notes, is_featured)
    VALUES (v_season_id, 'tournament', 'New Year''s Tip-Off', '2025-12-27', 'Council Bluffs, IA', 'IWFH - Dec 27-28', true)
    RETURNING id INTO v_tourn_newyear;

    -- I Have A Dream Classic (Boys + Girls)
    INSERT INTO games (season_id, game_type, name, date, location, notes, is_featured)
    VALUES (v_season_id, 'tournament', 'I Have A Dream Classic', '2026-01-02', 'Council Bluffs, IA', 'IWFH - Jan 2-4', true)
    RETURNING id INTO v_tourn_dream;

    -- Tri-State Showdown (Boys only)
    INSERT INTO games (season_id, game_type, name, date, location, notes, is_featured)
    VALUES (v_season_id, 'tournament', 'Tri-State Showdown', '2026-01-23', 'Council Bluffs, IA', 'IWFH - Jan 23-25', false)
    RETURNING id INTO v_tourn_tristate;

    -- February Frenzy (Boys + Girls)
    INSERT INTO games (season_id, game_type, name, date, location, notes, is_featured)
    VALUES (v_season_id, 'tournament', 'February Frenzy', '2026-01-30', 'Elkhorn, NE', 'UBT - Jan 30 - Feb 1', false)
    RETURNING id INTO v_tourn_frenzy;

    -- AMP IT UP (Boys + Girls)
    INSERT INTO games (season_id, game_type, name, date, location, notes, is_featured)
    VALUES (v_season_id, 'tournament', 'AMP IT UP', '2026-02-20', 'Omaha, NE', 'Feb 20-22', false)
    RETURNING id INTO v_tourn_amp;

    -- Midwest Regional Hoops Championship (Boys + Girls)
    INSERT INTO games (season_id, game_type, name, date, location, notes, is_featured)
    VALUES (v_season_id, 'tournament', 'Midwest Regional Hoops Championship', '2026-03-06', 'Elkhorn, NE', 'UBT - Mar 6-8', true)
    RETURNING id INTO v_tourn_midwest;

    RAISE NOTICE 'Inserted 6 tournaments';

    -- =============================================================================
    -- 7. ASSIGN TEAMS TO TOURNAMENTS
    -- =============================================================================

    -- New Year's Tip-Off (Boys only - all 11 boys teams)
    INSERT INTO game_teams (game_id, team_id) VALUES
        (v_tourn_newyear, v_team_3rd_4th_foster),
        (v_tourn_newyear, v_team_4th_grixby),
        (v_tourn_newyear, v_team_jr3ssb_5th),
        (v_tourn_newyear, v_team_express_5th),
        (v_tourn_newyear, v_team_express_6th),
        (v_tourn_newyear, v_team_jr3ssb_6th),
        (v_tourn_newyear, v_team_express_7th),
        (v_tourn_newyear, v_team_express_8th),
        (v_tourn_newyear, v_team_jr3ssb_7th),
        (v_tourn_newyear, v_team_jr3ssb_8th),
        (v_tourn_newyear, v_team_tne_8th);

    -- I Have A Dream Classic (Boys + Girls - all 15 teams)
    INSERT INTO game_teams (game_id, team_id) VALUES
        (v_tourn_dream, v_team_3rd_4th_foster),
        (v_tourn_dream, v_team_4th_grixby),
        (v_tourn_dream, v_team_jr3ssb_5th),
        (v_tourn_dream, v_team_express_5th),
        (v_tourn_dream, v_team_express_6th),
        (v_tourn_dream, v_team_jr3ssb_6th),
        (v_tourn_dream, v_team_express_7th),
        (v_tourn_dream, v_team_express_8th),
        (v_tourn_dream, v_team_jr3ssb_7th),
        (v_tourn_dream, v_team_jr3ssb_8th),
        (v_tourn_dream, v_team_tne_8th),
        (v_tourn_dream, v_team_girls_5th),
        (v_tourn_dream, v_team_girls_6th),
        (v_tourn_dream, v_team_girls_7th),
        (v_tourn_dream, v_team_girls_8th);

    -- Tri-State Showdown (Boys only)
    INSERT INTO game_teams (game_id, team_id) VALUES
        (v_tourn_tristate, v_team_3rd_4th_foster),
        (v_tourn_tristate, v_team_4th_grixby),
        (v_tourn_tristate, v_team_jr3ssb_5th),
        (v_tourn_tristate, v_team_express_5th),
        (v_tourn_tristate, v_team_express_6th),
        (v_tourn_tristate, v_team_jr3ssb_6th),
        (v_tourn_tristate, v_team_express_7th),
        (v_tourn_tristate, v_team_express_8th),
        (v_tourn_tristate, v_team_jr3ssb_7th),
        (v_tourn_tristate, v_team_jr3ssb_8th),
        (v_tourn_tristate, v_team_tne_8th);

    -- February Frenzy (Boys + Girls)
    INSERT INTO game_teams (game_id, team_id) VALUES
        (v_tourn_frenzy, v_team_3rd_4th_foster),
        (v_tourn_frenzy, v_team_4th_grixby),
        (v_tourn_frenzy, v_team_jr3ssb_5th),
        (v_tourn_frenzy, v_team_express_5th),
        (v_tourn_frenzy, v_team_express_6th),
        (v_tourn_frenzy, v_team_jr3ssb_6th),
        (v_tourn_frenzy, v_team_express_7th),
        (v_tourn_frenzy, v_team_express_8th),
        (v_tourn_frenzy, v_team_jr3ssb_7th),
        (v_tourn_frenzy, v_team_jr3ssb_8th),
        (v_tourn_frenzy, v_team_tne_8th),
        (v_tourn_frenzy, v_team_girls_5th),
        (v_tourn_frenzy, v_team_girls_6th),
        (v_tourn_frenzy, v_team_girls_7th),
        (v_tourn_frenzy, v_team_girls_8th);

    -- AMP IT UP (Boys + Girls)
    INSERT INTO game_teams (game_id, team_id) VALUES
        (v_tourn_amp, v_team_3rd_4th_foster),
        (v_tourn_amp, v_team_4th_grixby),
        (v_tourn_amp, v_team_jr3ssb_5th),
        (v_tourn_amp, v_team_express_5th),
        (v_tourn_amp, v_team_express_6th),
        (v_tourn_amp, v_team_jr3ssb_6th),
        (v_tourn_amp, v_team_express_7th),
        (v_tourn_amp, v_team_express_8th),
        (v_tourn_amp, v_team_jr3ssb_7th),
        (v_tourn_amp, v_team_jr3ssb_8th),
        (v_tourn_amp, v_team_tne_8th),
        (v_tourn_amp, v_team_girls_5th),
        (v_tourn_amp, v_team_girls_6th),
        (v_tourn_amp, v_team_girls_7th),
        (v_tourn_amp, v_team_girls_8th);

    -- Midwest Regional Hoops Championship (Boys + Girls)
    INSERT INTO game_teams (game_id, team_id) VALUES
        (v_tourn_midwest, v_team_3rd_4th_foster),
        (v_tourn_midwest, v_team_4th_grixby),
        (v_tourn_midwest, v_team_jr3ssb_5th),
        (v_tourn_midwest, v_team_express_5th),
        (v_tourn_midwest, v_team_express_6th),
        (v_tourn_midwest, v_team_jr3ssb_6th),
        (v_tourn_midwest, v_team_express_7th),
        (v_tourn_midwest, v_team_express_8th),
        (v_tourn_midwest, v_team_jr3ssb_7th),
        (v_tourn_midwest, v_team_jr3ssb_8th),
        (v_tourn_midwest, v_team_tne_8th),
        (v_tourn_midwest, v_team_girls_5th),
        (v_tourn_midwest, v_team_girls_6th),
        (v_tourn_midwest, v_team_girls_7th),
        (v_tourn_midwest, v_team_girls_8th);

    RAISE NOTICE 'Assigned teams to 6 tournaments';

    -- =============================================================================
    -- 8. INSERT OSA LEAGUE GAMES (Jan 3 - Mar 1, 2026)
    -- =============================================================================
    -- 9 weeks of games, alternating Sat/Sun
    -- Week 1: Sat Jan 3, Week 2: Sun Jan 11, Week 3: Sat Jan 17, etc.

    v_is_saturday := true;  -- Start with Saturday

    FOR v_week_num IN 1..9 LOOP
        -- Calculate the game date
        -- Week 1 starts Jan 3, 2026 (Saturday)
        IF v_is_saturday THEN
            v_game_date := '2026-01-03'::DATE + ((v_week_num - 1) * 7);
        ELSE
            v_game_date := '2026-01-04'::DATE + ((v_week_num - 1) * 7);  -- Sunday
        END IF;

        -- Insert a game for each team
        -- Boys teams
        INSERT INTO games (season_id, game_type, name, date, start_time, location, notes)
        VALUES
            (v_season_id, 'game', 'OSA League Game - Week ' || v_week_num, v_game_date, '09:00', 'OSA Gym', '3rd/4th Foster vs OSA Opponent');
        INSERT INTO game_teams (game_id, team_id, opponent, is_home_game)
        SELECT id, v_team_3rd_4th_foster, 'OSA League Opponent', (v_week_num % 2 = 1) FROM games WHERE name = 'OSA League Game - Week ' || v_week_num AND season_id = v_season_id LIMIT 1;

        INSERT INTO games (season_id, game_type, name, date, start_time, location, notes)
        VALUES
            (v_season_id, 'game', 'OSA League Game - Week ' || v_week_num, v_game_date, '10:00', 'OSA Gym', '4th Grixby/Evans vs OSA Opponent');
        INSERT INTO game_teams (game_id, team_id, opponent, is_home_game)
        SELECT g.id, v_team_4th_grixby, 'OSA League Opponent', (v_week_num % 2 = 0)
        FROM games g WHERE g.name = 'OSA League Game - Week ' || v_week_num AND g.season_id = v_season_id AND g.start_time = '10:00' LIMIT 1;

        INSERT INTO games (season_id, game_type, name, date, start_time, location, notes)
        VALUES
            (v_season_id, 'game', 'OSA League Game - Week ' || v_week_num, v_game_date, '11:00', 'OSA Gym', 'TNE Jr 3SSB 5th vs OSA Opponent');
        INSERT INTO game_teams (game_id, team_id, opponent, is_home_game)
        SELECT g.id, v_team_jr3ssb_5th, 'OSA League Opponent', (v_week_num % 2 = 1)
        FROM games g WHERE g.name = 'OSA League Game - Week ' || v_week_num AND g.season_id = v_season_id AND g.start_time = '11:00' LIMIT 1;

        INSERT INTO games (season_id, game_type, name, date, start_time, location, notes)
        VALUES
            (v_season_id, 'game', 'OSA League Game - Week ' || v_week_num, v_game_date, '12:00', 'OSA Gym', 'Express United 5th vs OSA Opponent');
        INSERT INTO game_teams (game_id, team_id, opponent, is_home_game)
        SELECT g.id, v_team_express_5th, 'OSA League Opponent', (v_week_num % 2 = 0)
        FROM games g WHERE g.name = 'OSA League Game - Week ' || v_week_num AND g.season_id = v_season_id AND g.start_time = '12:00' LIMIT 1;

        INSERT INTO games (season_id, game_type, name, date, start_time, location, notes)
        VALUES
            (v_season_id, 'game', 'OSA League Game - Week ' || v_week_num, v_game_date, '13:00', 'OSA Gym', 'Express United 6th vs OSA Opponent');
        INSERT INTO game_teams (game_id, team_id, opponent, is_home_game)
        SELECT g.id, v_team_express_6th, 'OSA League Opponent', (v_week_num % 2 = 1)
        FROM games g WHERE g.name = 'OSA League Game - Week ' || v_week_num AND g.season_id = v_season_id AND g.start_time = '13:00' LIMIT 1;

        INSERT INTO games (season_id, game_type, name, date, start_time, location, notes)
        VALUES
            (v_season_id, 'game', 'OSA League Game - Week ' || v_week_num, v_game_date, '14:00', 'OSA Gym', 'TNE Jr 3SSB 6th vs OSA Opponent');
        INSERT INTO game_teams (game_id, team_id, opponent, is_home_game)
        SELECT g.id, v_team_jr3ssb_6th, 'OSA League Opponent', (v_week_num % 2 = 0)
        FROM games g WHERE g.name = 'OSA League Game - Week ' || v_week_num AND g.season_id = v_season_id AND g.start_time = '14:00' LIMIT 1;

        INSERT INTO games (season_id, game_type, name, date, start_time, location, notes)
        VALUES
            (v_season_id, 'game', 'OSA League Game - Week ' || v_week_num, v_game_date, '15:00', 'OSA Gym', 'Express United 7th vs OSA Opponent');
        INSERT INTO game_teams (game_id, team_id, opponent, is_home_game)
        SELECT g.id, v_team_express_7th, 'OSA League Opponent', (v_week_num % 2 = 1)
        FROM games g WHERE g.name = 'OSA League Game - Week ' || v_week_num AND g.season_id = v_season_id AND g.start_time = '15:00' LIMIT 1;

        INSERT INTO games (season_id, game_type, name, date, start_time, location, notes)
        VALUES
            (v_season_id, 'game', 'OSA League Game - Week ' || v_week_num, v_game_date, '16:00', 'OSA Gym', 'Express United 8th vs OSA Opponent');
        INSERT INTO game_teams (game_id, team_id, opponent, is_home_game)
        SELECT g.id, v_team_express_8th, 'OSA League Opponent', (v_week_num % 2 = 0)
        FROM games g WHERE g.name = 'OSA League Game - Week ' || v_week_num AND g.season_id = v_season_id AND g.start_time = '16:00' LIMIT 1;

        INSERT INTO games (season_id, game_type, name, date, start_time, location, notes)
        VALUES
            (v_season_id, 'game', 'OSA League Game - Week ' || v_week_num, v_game_date, '17:00', 'OSA Gym', 'TNE Jr 3SSB 7th vs OSA Opponent');
        INSERT INTO game_teams (game_id, team_id, opponent, is_home_game)
        SELECT g.id, v_team_jr3ssb_7th, 'OSA League Opponent', (v_week_num % 2 = 1)
        FROM games g WHERE g.name = 'OSA League Game - Week ' || v_week_num AND g.season_id = v_season_id AND g.start_time = '17:00' LIMIT 1;

        INSERT INTO games (season_id, game_type, name, date, start_time, location, notes)
        VALUES
            (v_season_id, 'game', 'OSA League Game - Week ' || v_week_num, v_game_date, '18:00', 'OSA Gym', 'TNE Jr 3SSB 8th vs OSA Opponent');
        INSERT INTO game_teams (game_id, team_id, opponent, is_home_game)
        SELECT g.id, v_team_jr3ssb_8th, 'OSA League Opponent', (v_week_num % 2 = 0)
        FROM games g WHERE g.name = 'OSA League Game - Week ' || v_week_num AND g.season_id = v_season_id AND g.start_time = '18:00' LIMIT 1;

        INSERT INTO games (season_id, game_type, name, date, start_time, location, notes)
        VALUES
            (v_season_id, 'game', 'OSA League Game - Week ' || v_week_num, v_game_date, '19:00', 'OSA Gym', 'TNE 8th vs OSA Opponent');
        INSERT INTO game_teams (game_id, team_id, opponent, is_home_game)
        SELECT g.id, v_team_tne_8th, 'OSA League Opponent', (v_week_num % 2 = 1)
        FROM games g WHERE g.name = 'OSA League Game - Week ' || v_week_num AND g.season_id = v_season_id AND g.start_time = '19:00' LIMIT 1;

        -- Girls teams
        INSERT INTO games (season_id, game_type, name, date, start_time, location, notes)
        VALUES
            (v_season_id, 'game', 'OSA League Game - Week ' || v_week_num, v_game_date, '09:30', 'OSA Gym', 'Girls 5th vs OSA Opponent');
        INSERT INTO game_teams (game_id, team_id, opponent, is_home_game)
        SELECT g.id, v_team_girls_5th, 'OSA League Opponent', (v_week_num % 2 = 0)
        FROM games g WHERE g.name = 'OSA League Game - Week ' || v_week_num AND g.season_id = v_season_id AND g.start_time = '09:30' LIMIT 1;

        INSERT INTO games (season_id, game_type, name, date, start_time, location, notes)
        VALUES
            (v_season_id, 'game', 'OSA League Game - Week ' || v_week_num, v_game_date, '10:30', 'OSA Gym', 'Girls 6th vs OSA Opponent');
        INSERT INTO game_teams (game_id, team_id, opponent, is_home_game)
        SELECT g.id, v_team_girls_6th, 'OSA League Opponent', (v_week_num % 2 = 1)
        FROM games g WHERE g.name = 'OSA League Game - Week ' || v_week_num AND g.season_id = v_season_id AND g.start_time = '10:30' LIMIT 1;

        INSERT INTO games (season_id, game_type, name, date, start_time, location, notes)
        VALUES
            (v_season_id, 'game', 'OSA League Game - Week ' || v_week_num, v_game_date, '11:30', 'OSA Gym', 'Girls 7th vs OSA Opponent');
        INSERT INTO game_teams (game_id, team_id, opponent, is_home_game)
        SELECT g.id, v_team_girls_7th, 'OSA League Opponent', (v_week_num % 2 = 0)
        FROM games g WHERE g.name = 'OSA League Game - Week ' || v_week_num AND g.season_id = v_season_id AND g.start_time = '11:30' LIMIT 1;

        INSERT INTO games (season_id, game_type, name, date, start_time, location, notes)
        VALUES
            (v_season_id, 'game', 'OSA League Game - Week ' || v_week_num, v_game_date, '12:30', 'OSA Gym', 'Girls 8th vs OSA Opponent');
        INSERT INTO game_teams (game_id, team_id, opponent, is_home_game)
        SELECT g.id, v_team_girls_8th, 'OSA League Opponent', (v_week_num % 2 = 1)
        FROM games g WHERE g.name = 'OSA League Game - Week ' || v_week_num AND g.season_id = v_season_id AND g.start_time = '12:30' LIMIT 1;

        -- Alternate Sat/Sun for next week
        v_is_saturday := NOT v_is_saturday;
    END LOOP;

    RAISE NOTICE 'Inserted OSA League games for 9 weeks (% games per week = % total)', 15, 15 * 9;

END $$;

COMMIT;

-- =============================================================================
-- 9. VERIFY COUNTS
-- =============================================================================
SELECT 'Coaches' as table_name, COUNT(*)::text as count FROM coaches
UNION ALL SELECT 'Teams', COUNT(*)::text FROM teams
UNION ALL SELECT 'Games (total)', COUNT(*)::text FROM games
UNION ALL SELECT 'Games (tournaments)', COUNT(*)::text FROM games WHERE game_type = 'tournament'
UNION ALL SELECT 'Games (league games)', COUNT(*)::text FROM games WHERE game_type = 'game'
UNION ALL SELECT 'Game Team Assignments', COUNT(*)::text FROM game_teams
ORDER BY table_name;
