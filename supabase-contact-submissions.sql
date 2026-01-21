-- =============================================
-- CONTACT SUBMISSIONS TABLE
-- =============================================
-- Run this SQL in your Supabase SQL Editor to create
-- the contact_submissions table for storing contact form entries.

CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit contact form (public insert)
CREATE POLICY "Anyone can submit contact" ON contact_submissions
    FOR INSERT WITH CHECK (true);

-- Only admins can view contact submissions
CREATE POLICY "Admins can view contacts" ON contact_submissions
    FOR SELECT USING (public.is_admin());

-- Only admins can update contact submissions (mark as read, etc.)
CREATE POLICY "Admins can update contacts" ON contact_submissions
    FOR UPDATE USING (public.is_admin());

-- Create trigger to update updated_at
CREATE TRIGGER update_contact_submissions_updated_at
    BEFORE UPDATE ON contact_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Create index for common queries
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
