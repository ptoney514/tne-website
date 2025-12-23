-- =============================================
-- TNE UNITED EXPRESS - SUPABASE SCHEMA (FIXED)
-- =============================================
-- Version: 1.1
-- Fixed: Helper functions moved to public schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ENUM TYPES
-- =============================================

CREATE TYPE user_role AS ENUM ('admin', 'coach', 'parent');
CREATE TYPE gender AS ENUM ('male', 'female');
CREATE TYPE registration_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE registration_source AS ENUM ('tryout_offer', 'direct');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'partial', 'waived');
CREATE TYPE tryout_signup_status AS ENUM ('registered', 'attended', 'offered', 'declined', 'no_show');
CREATE TYPE event_type AS ENUM ('practice', 'game', 'tournament', 'tryout', 'other');

-- =============================================
-- PROFILES (extends Supabase auth.users)
-- =============================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'parent',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_role ON profiles(role);

-- =============================================
-- SEASONS
-- =============================================

CREATE TABLE seasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_seasons_active ON seasons(is_active) WHERE is_active = true;

-- =============================================
-- COACHES
-- =============================================

CREATE TABLE coaches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    bio TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_coaches_active ON coaches(is_active);

-- =============================================
-- TEAMS
-- =============================================

CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    grade_level TEXT NOT NULL,
    gender gender NOT NULL,
    head_coach_id UUID REFERENCES coaches(id) ON DELETE SET NULL,
    assistant_coach_id UUID REFERENCES coaches(id) ON DELETE SET NULL,
    practice_location TEXT,
    practice_days TEXT,
    practice_time TEXT,
    team_fee DECIMAL(10,2),
    uniform_fee DECIMAL(10,2),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_teams_season ON teams(season_id);
CREATE INDEX idx_teams_grade ON teams(grade_level);
CREATE INDEX idx_teams_active ON teams(is_active);

-- =============================================
-- PARENTS / GUARDIANS
-- =============================================

CREATE TABLE parents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_street TEXT,
    address_city TEXT,
    address_state TEXT,
    address_zip TEXT,
    relationship TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_parents_email ON parents(email);
CREATE INDEX idx_parents_profile ON parents(profile_id);

-- =============================================
-- PLAYERS
-- =============================================

CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    graduating_year INTEGER NOT NULL,
    current_grade TEXT NOT NULL,
    gender gender NOT NULL,
    primary_parent_id UUID REFERENCES parents(id) ON DELETE SET NULL,
    secondary_parent_id UUID REFERENCES parents(id) ON DELETE SET NULL,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_relationship TEXT,
    medical_notes TEXT,
    jersey_number TEXT,
    jersey_size TEXT,
    position TEXT,
    years_experience INTEGER,
    prior_tne_player BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_players_grade ON players(current_grade);
CREATE INDEX idx_players_graduating ON players(graduating_year);
CREATE INDEX idx_players_parent ON players(primary_parent_id);

-- =============================================
-- TEAM ROSTER
-- =============================================

CREATE TABLE team_roster (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    jersey_number TEXT,
    position TEXT,
    payment_status payment_status NOT NULL DEFAULT 'pending',
    payment_amount DECIMAL(10,2),
    payment_date DATE,
    payment_notes TEXT,
    joined_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(team_id, player_id)
);

CREATE INDEX idx_roster_team ON team_roster(team_id);
CREATE INDEX idx_roster_player ON team_roster(player_id);
CREATE INDEX idx_roster_payment ON team_roster(payment_status);

-- =============================================
-- TRYOUT SESSIONS
-- =============================================

CREATE TABLE tryout_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    location TEXT NOT NULL,
    grade_levels TEXT[],
    gender gender,
    max_capacity INTEGER,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tryouts_season ON tryout_sessions(season_id);
CREATE INDEX idx_tryouts_date ON tryout_sessions(date);

-- =============================================
-- TRYOUT SIGNUPS
-- =============================================

CREATE TABLE tryout_signups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES tryout_sessions(id) ON DELETE CASCADE,
    player_first_name TEXT NOT NULL,
    player_last_name TEXT NOT NULL,
    player_date_of_birth DATE NOT NULL,
    player_graduating_year INTEGER NOT NULL,
    player_current_grade TEXT NOT NULL,
    player_gender gender NOT NULL,
    years_experience INTEGER,
    prior_tne_player BOOLEAN DEFAULT false,
    parent_first_name TEXT NOT NULL,
    parent_last_name TEXT NOT NULL,
    parent_email TEXT NOT NULL,
    parent_phone TEXT NOT NULL,
    emergency_contact_name TEXT NOT NULL,
    emergency_contact_phone TEXT NOT NULL,
    emergency_contact_relationship TEXT,
    status tryout_signup_status NOT NULL DEFAULT 'registered',
    offered_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    offer_sent_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_signups_session ON tryout_signups(session_id);
CREATE INDEX idx_signups_status ON tryout_signups(status);
CREATE INDEX idx_signups_email ON tryout_signups(parent_email);

-- =============================================
-- REGISTRATIONS
-- =============================================

CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source registration_source NOT NULL,
    tryout_signup_id UUID REFERENCES tryout_signups(id) ON DELETE SET NULL,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    player_first_name TEXT NOT NULL,
    player_last_name TEXT NOT NULL,
    player_date_of_birth DATE NOT NULL,
    player_graduating_year INTEGER NOT NULL,
    player_current_grade TEXT NOT NULL,
    player_gender gender NOT NULL,
    jersey_size TEXT,
    position TEXT,
    medical_notes TEXT,
    parent_first_name TEXT NOT NULL,
    parent_last_name TEXT NOT NULL,
    parent_email TEXT NOT NULL,
    parent_phone TEXT NOT NULL,
    parent_address_street TEXT,
    parent_address_city TEXT,
    parent_address_state TEXT,
    parent_address_zip TEXT,
    parent_relationship TEXT,
    emergency_contact_name TEXT NOT NULL,
    emergency_contact_phone TEXT NOT NULL,
    emergency_contact_relationship TEXT,
    waiver_accepted BOOLEAN NOT NULL DEFAULT false,
    waiver_accepted_at TIMESTAMPTZ,
    payment_status payment_status NOT NULL DEFAULT 'pending',
    payment_amount DECIMAL(10,2),
    payment_date DATE,
    payment_transaction_id TEXT,
    status registration_status NOT NULL DEFAULT 'pending',
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_player_id UUID REFERENCES players(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_registrations_status ON registrations(status);
CREATE INDEX idx_registrations_source ON registrations(source);
CREATE INDEX idx_registrations_team ON registrations(team_id);
CREATE INDEX idx_registrations_payment ON registrations(payment_status);

-- =============================================
-- EVENTS / SCHEDULE
-- =============================================

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    event_type event_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    location TEXT,
    address TEXT,
    opponent TEXT,
    is_home_game BOOLEAN,
    tournament_name TEXT,
    notes TEXT,
    is_cancelled BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_team ON events(team_id);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_season ON events(season_id);

-- =============================================
-- ANNOUNCEMENTS
-- =============================================

CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT false,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    published_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_announcements_team ON announcements(team_id);
CREATE INDEX idx_announcements_public ON announcements(is_public);

-- =============================================
-- HELPER FUNCTIONS (in public schema)
-- =============================================

CREATE OR REPLACE FUNCTION calculate_age(dob DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN EXTRACT(YEAR FROM age(CURRENT_DATE, dob));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Helper function to get user role (in PUBLIC schema, not auth)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
    SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to check if user is admin (in PUBLIC schema, not auth)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
$$ LANGUAGE sql SECURITY DEFINER;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_coaches_updated_at BEFORE UPDATE ON coaches FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_parents_updated_at BEFORE UPDATE ON parents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_tryout_sessions_updated_at BEFORE UPDATE ON tryout_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_tryout_signups_updated_at BEFORE UPDATE ON tryout_signups FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_roster ENABLE ROW LEVEL SECURITY;
ALTER TABLE tryout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tryout_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILES POLICIES
-- =============================================

CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update all profiles" ON profiles
    FOR UPDATE USING (public.is_admin());

-- =============================================
-- SEASONS POLICIES
-- =============================================

CREATE POLICY "Anyone can view seasons" ON seasons
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage seasons" ON seasons
    FOR ALL USING (public.is_admin());

-- =============================================
-- COACHES POLICIES
-- =============================================

CREATE POLICY "Anyone can view active coaches" ON coaches
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can view all coaches" ON coaches
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can manage coaches" ON coaches
    FOR ALL USING (public.is_admin());

-- =============================================
-- TEAMS POLICIES
-- =============================================

CREATE POLICY "Anyone can view active teams" ON teams
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can view all teams" ON teams
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can manage teams" ON teams
    FOR ALL USING (public.is_admin());

-- =============================================
-- PLAYERS POLICIES
-- =============================================

CREATE POLICY "Admins can view all players" ON players
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Parents can view own players" ON players
    FOR SELECT USING (
        primary_parent_id IN (SELECT id FROM parents WHERE profile_id = auth.uid())
        OR secondary_parent_id IN (SELECT id FROM parents WHERE profile_id = auth.uid())
    );

CREATE POLICY "Coaches can view team players" ON players
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM team_roster tr
            JOIN teams t ON tr.team_id = t.id
            JOIN coaches c ON (t.head_coach_id = c.id OR t.assistant_coach_id = c.id)
            WHERE tr.player_id = players.id
            AND c.profile_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage players" ON players
    FOR ALL USING (public.is_admin());

CREATE POLICY "Parents can update own players" ON players
    FOR UPDATE USING (
        primary_parent_id IN (SELECT id FROM parents WHERE profile_id = auth.uid())
        OR secondary_parent_id IN (SELECT id FROM parents WHERE profile_id = auth.uid())
    );

-- =============================================
-- TEAM_ROSTER POLICIES
-- =============================================

CREATE POLICY "Admins can manage roster" ON team_roster
    FOR ALL USING (public.is_admin());

CREATE POLICY "Coaches can view team roster" ON team_roster
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM teams t
            JOIN coaches c ON (t.head_coach_id = c.id OR t.assistant_coach_id = c.id)
            WHERE t.id = team_roster.team_id
            AND c.profile_id = auth.uid()
        )
    );

CREATE POLICY "Parents can view team roster" ON team_roster
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM players p
            JOIN parents pr ON (p.primary_parent_id = pr.id OR p.secondary_parent_id = pr.id)
            WHERE p.id = team_roster.player_id
            AND pr.profile_id = auth.uid()
        )
    );

-- =============================================
-- EVENTS POLICIES
-- =============================================

CREATE POLICY "Anyone can view events" ON events
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage events" ON events
    FOR ALL USING (public.is_admin());

-- =============================================
-- TRYOUT SESSIONS POLICIES
-- =============================================

CREATE POLICY "Anyone can view tryout sessions" ON tryout_sessions
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage tryout sessions" ON tryout_sessions
    FOR ALL USING (public.is_admin());

-- =============================================
-- TRYOUT SIGNUPS POLICIES
-- =============================================

CREATE POLICY "Anyone can signup for tryouts" ON tryout_signups
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all signups" ON tryout_signups
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can manage signups" ON tryout_signups
    FOR ALL USING (public.is_admin());

-- =============================================
-- REGISTRATIONS POLICIES
-- =============================================

CREATE POLICY "Anyone can submit registration" ON registrations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all registrations" ON registrations
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can manage registrations" ON registrations
    FOR ALL USING (public.is_admin());

-- =============================================
-- ANNOUNCEMENTS POLICIES
-- =============================================

CREATE POLICY "Anyone can view public announcements" ON announcements
    FOR SELECT USING (is_public = true AND (published_at IS NULL OR published_at <= NOW()));

CREATE POLICY "Admins can view all announcements" ON announcements
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can manage announcements" ON announcements
    FOR ALL USING (public.is_admin());

-- =============================================
-- SEED DATA
-- =============================================

INSERT INTO seasons (name, start_date, end_date, is_active) VALUES
    ('2025-26 Winter', '2025-10-01', '2026-03-31', true);

-- =============================================
-- AUTO-PROFILE TRIGGER (creates profile on signup)
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    'parent'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
