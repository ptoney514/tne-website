-- Migration: Tournament Detail System
-- Creates venues, hotels, nearby places, and tournament detail tables
-- Supports reusable venue/hotel libraries and AI agent population

-- =============================================================================
-- VENUES TABLE (Master library of tournament venues)
-- =============================================================================
CREATE TABLE IF NOT EXISTS venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    image_url TEXT,
    street_address TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT,
    phone TEXT,
    website_url TEXT,
    parking_info TEXT,
    court_count INTEGER,
    indoor_outdoor TEXT CHECK (indoor_outdoor IN ('indoor', 'outdoor', 'both')),
    amenities JSONB DEFAULT '[]'::jsonb,
    -- Geolocation for mapping
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    -- Nearest airport info
    airport_name TEXT,
    airport_code TEXT,
    airport_distance_miles DECIMAL(5, 1),
    -- Agent metadata
    google_place_id TEXT,
    last_verified_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_venues_city_state ON venues(city, state);
CREATE INDEX idx_venues_google_place ON venues(google_place_id) WHERE google_place_id IS NOT NULL;

-- =============================================================================
-- HOTELS TABLE (Master library of hotels)
-- =============================================================================
CREATE TABLE IF NOT EXISTS hotels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    brand TEXT,
    street_address TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT,
    phone TEXT,
    website_url TEXT,
    booking_url TEXT,
    -- Geolocation
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    -- Amenities (stored as JSONB for flexibility)
    amenities JSONB DEFAULT '[]'::jsonb,
    -- Star rating (1-5)
    star_rating INTEGER CHECK (star_rating >= 1 AND star_rating <= 5),
    -- Agent metadata
    google_place_id TEXT,
    tripadvisor_id TEXT,
    last_verified_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_hotels_city_state ON hotels(city, state);
CREATE INDEX idx_hotels_google_place ON hotels(google_place_id) WHERE google_place_id IS NOT NULL;

-- =============================================================================
-- NEARBY_PLACES TABLE (Attractions and Restaurants)
-- =============================================================================
CREATE TABLE IF NOT EXISTS nearby_places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    place_type TEXT NOT NULL CHECK (place_type IN ('attraction', 'restaurant', 'entertainment', 'shopping')),
    category TEXT,
    description TEXT,
    street_address TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT,
    phone TEXT,
    website_url TEXT,
    -- Geolocation
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    -- Restaurant-specific
    price_range INTEGER CHECK (price_range >= 1 AND price_range <= 4),
    cuisine_type TEXT,
    is_family_friendly BOOLEAN DEFAULT true,
    -- Hours (stored as JSONB for flexibility)
    hours JSONB,
    -- Agent metadata
    google_place_id TEXT,
    yelp_id TEXT,
    rating DECIMAL(2, 1),
    review_count INTEGER,
    last_verified_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nearby_places_city_state ON nearby_places(city, state);
CREATE INDEX idx_nearby_places_type ON nearby_places(place_type);
CREATE INDEX idx_nearby_places_google ON nearby_places(google_place_id) WHERE google_place_id IS NOT NULL;

-- =============================================================================
-- TOURNAMENT_DETAILS TABLE (Extended tournament information)
-- =============================================================================
CREATE TABLE IF NOT EXISTS tournament_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL UNIQUE REFERENCES games(id) ON DELETE CASCADE,
    -- Venue reference (reusable)
    venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
    -- Tournament description/content
    description TEXT,
    division_count INTEGER,
    total_teams INTEGER,
    age_divisions TEXT[],
    -- Schedule info
    schedule_pdf_url TEXT,
    rules_pdf_url TEXT,
    bracket_url TEXT,
    -- Registration
    registration_url TEXT,
    registration_deadline DATE,
    entry_fee DECIMAL(10, 2),
    -- Map configuration
    map_center_lat DECIMAL(10, 8),
    map_center_lng DECIMAL(11, 8),
    map_zoom_level INTEGER DEFAULT 13,
    -- Team rate info (global for tournament)
    team_rate_code TEXT,
    team_rate_deadline DATE,
    team_rate_description TEXT,
    -- Display flags
    show_hotels BOOLEAN DEFAULT true,
    show_attractions BOOLEAN DEFAULT true,
    show_restaurants BOOLEAN DEFAULT true,
    -- Agent metadata
    places_populated_at TIMESTAMPTZ,
    agent_search_radius_miles INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tournament_details_game ON tournament_details(game_id);
CREATE INDEX idx_tournament_details_venue ON tournament_details(venue_id);

-- =============================================================================
-- TOURNAMENT_HOTELS (Junction: tournaments with special hotel rates)
-- =============================================================================
CREATE TABLE IF NOT EXISTS tournament_hotels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_detail_id UUID NOT NULL REFERENCES tournament_details(id) ON DELETE CASCADE,
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    -- Team rate information
    is_team_rate BOOLEAN DEFAULT false,
    nightly_rate DECIMAL(10, 2),
    original_rate DECIMAL(10, 2),
    discount_percentage INTEGER,
    team_rate_code TEXT,
    booking_deadline DATE,
    special_booking_url TEXT,
    -- Distance from venue
    distance_miles DECIMAL(4, 1),
    drive_time_minutes INTEGER,
    -- Priority for display order
    display_order INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tournament_detail_id, hotel_id)
);

CREATE INDEX idx_tournament_hotels_tournament ON tournament_hotels(tournament_detail_id);
CREATE INDEX idx_tournament_hotels_hotel ON tournament_hotels(hotel_id);

-- =============================================================================
-- TOURNAMENT_NEARBY_PLACES (Junction: places linked to tournaments)
-- =============================================================================
CREATE TABLE IF NOT EXISTS tournament_nearby_places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_detail_id UUID NOT NULL REFERENCES tournament_details(id) ON DELETE CASCADE,
    nearby_place_id UUID NOT NULL REFERENCES nearby_places(id) ON DELETE CASCADE,
    -- Distance from venue
    distance_miles DECIMAL(4, 1),
    -- Team discount info (for restaurants)
    has_team_discount BOOLEAN DEFAULT false,
    team_discount_info TEXT,
    -- Display settings
    display_order INTEGER DEFAULT 0,
    is_recommended BOOLEAN DEFAULT false,
    recommendation_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tournament_detail_id, nearby_place_id)
);

CREATE INDEX idx_tournament_places_tournament ON tournament_nearby_places(tournament_detail_id);
CREATE INDEX idx_tournament_places_place ON tournament_nearby_places(nearby_place_id);

-- =============================================================================
-- EXTEND GAMES TABLE
-- =============================================================================
ALTER TABLE games ADD COLUMN IF NOT EXISTS end_date DATE;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE nearby_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_nearby_places ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables
CREATE POLICY "Anyone can view venues" ON venues FOR SELECT USING (true);
CREATE POLICY "Anyone can view hotels" ON hotels FOR SELECT USING (true);
CREATE POLICY "Anyone can view nearby_places" ON nearby_places FOR SELECT USING (true);
CREATE POLICY "Anyone can view tournament_details" ON tournament_details FOR SELECT USING (true);
CREATE POLICY "Anyone can view tournament_hotels" ON tournament_hotels FOR SELECT USING (true);
CREATE POLICY "Anyone can view tournament_nearby_places" ON tournament_nearby_places FOR SELECT USING (true);

-- Admin write access
CREATE POLICY "Admins can manage venues" ON venues FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admins can manage hotels" ON hotels FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admins can manage nearby_places" ON nearby_places FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admins can manage tournament_details" ON tournament_details FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admins can manage tournament_hotels" ON tournament_hotels FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admins can manage tournament_nearby_places" ON tournament_nearby_places FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- =============================================================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================================================
CREATE TRIGGER update_venues_updated_at
    BEFORE UPDATE ON venues FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_hotels_updated_at
    BEFORE UPDATE ON hotels FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_nearby_places_updated_at
    BEFORE UPDATE ON nearby_places FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tournament_details_updated_at
    BEFORE UPDATE ON tournament_details FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================================================
COMMENT ON TABLE venues IS 'Master library of tournament venues, reusable across tournaments';
COMMENT ON TABLE hotels IS 'Master library of hotels, can be linked to multiple tournaments';
COMMENT ON TABLE nearby_places IS 'Attractions, restaurants, and entertainment near tournament venues';
COMMENT ON TABLE tournament_details IS 'Extended tournament info for detail pages';
COMMENT ON TABLE tournament_hotels IS 'Links tournaments to hotels with team rate information';
COMMENT ON TABLE tournament_nearby_places IS 'Links tournaments to nearby places for display';
COMMENT ON COLUMN venues.google_place_id IS 'Google Places API ID for geocoding and verification';
COMMENT ON COLUMN tournament_details.places_populated_at IS 'Timestamp when AI agent last populated nearby places';
COMMENT ON COLUMN tournament_details.agent_search_radius_miles IS 'Radius for AI agent to search for nearby places';
