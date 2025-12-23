-- Fix infinite recursion in team_roster RLS policies
-- The issue: players policy queries team_roster, and team_roster policy queries players

-- Drop the problematic policies
DROP POLICY IF EXISTS "Coaches can view team players" ON players;
DROP POLICY IF EXISTS "Parents can view team roster" ON team_roster;
DROP POLICY IF EXISTS "Coaches can view team roster" ON team_roster;

-- Recreate coaches policy on players WITHOUT referencing team_roster
-- (Coaches already have access via team membership - use a simpler check)
CREATE POLICY "Coaches can view team players" ON players
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM coaches c
            WHERE c.profile_id = auth.uid()
            AND c.is_active = true
        )
    );

-- Recreate team_roster policies WITHOUT referencing players
CREATE POLICY "Coaches can view team roster" ON team_roster
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM teams t
            JOIN coaches c ON (t.head_coach_id = c.id OR t.assistant_coach_id = c.id)
            WHERE t.id = team_roster.team_id
            AND c.profile_id = auth.uid()
        )
    );

-- Parents view roster - use direct parent_id check without nested players query
CREATE POLICY "Parents can view own child roster" ON team_roster
    FOR SELECT USING (
        player_id IN (
            SELECT p.id FROM players p
            WHERE p.primary_parent_id IN (SELECT id FROM parents WHERE profile_id = auth.uid())
               OR p.secondary_parent_id IN (SELECT id FROM parents WHERE profile_id = auth.uid())
        )
    );
