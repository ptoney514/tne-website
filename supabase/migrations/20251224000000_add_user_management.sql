-- Migration: Add User Management Support
-- Issue: #40 - feat: Add User Management page under Settings

-- =============================================================================
-- PROFILES TABLE ADDITIONS
-- =============================================================================

-- Add is_active flag for soft-delete / deactivation
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add avatar_url for profile pictures
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add index for filtering by active status
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);

-- =============================================================================
-- USER_INVITES TABLE
-- =============================================================================

-- Table to track pending user invitations
CREATE TABLE IF NOT EXISTS user_invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL,
    display_name TEXT,
    role user_role NOT NULL DEFAULT 'parent',
    personal_message TEXT,
    linked_coach_id UUID REFERENCES coaches(id) ON DELETE SET NULL,
    linked_parent_id UUID REFERENCES parents(id) ON DELETE SET NULL,
    invited_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    accepted_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_user_invites_status ON user_invites(status);
CREATE INDEX IF NOT EXISTS idx_user_invites_email ON user_invites(email);
CREATE INDEX IF NOT EXISTS idx_user_invites_invited_by ON user_invites(invited_by);

-- Unique constraint to prevent duplicate pending invites to same email
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_invites_email_pending
    ON user_invites(email)
    WHERE status = 'pending';

-- =============================================================================
-- ROW LEVEL SECURITY FOR USER_INVITES
-- =============================================================================

ALTER TABLE user_invites ENABLE ROW LEVEL SECURITY;

-- Admins can view all invites
CREATE POLICY "Admins can view all invites" ON user_invites
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Admins can create invites
CREATE POLICY "Admins can create invites" ON user_invites
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Admins can update invites (cancel, resend, etc.)
CREATE POLICY "Admins can update invites" ON user_invites
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Admins can delete invites
CREATE POLICY "Admins can delete invites" ON user_invites
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- =============================================================================
-- UPDATED_AT TRIGGER FOR USER_INVITES
-- =============================================================================

CREATE OR REPLACE TRIGGER set_user_invites_updated_at
    BEFORE UPDATE ON user_invites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- FUNCTION TO EXPIRE OLD INVITES (can be called by cron or manually)
-- =============================================================================

CREATE OR REPLACE FUNCTION expire_old_invites()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE user_invites
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'pending' AND expires_at < NOW();

    GET DIAGNOSTICS expired_count = ROW_COUNT;
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users (admins will call this)
GRANT EXECUTE ON FUNCTION expire_old_invites() TO authenticated;
