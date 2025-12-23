-- =============================================
-- TNE DATABASE CLEANUP SCRIPT
-- =============================================
-- Run this BEFORE running tne-supabase-schema.sql
-- This drops all existing objects to start fresh
-- =============================================

-- Drop triggers and policies (wrapped to handle missing tables)
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop triggers (ignore errors if table doesn't exist)
    FOR r IN (SELECT tgname, relname FROM pg_trigger t
              JOIN pg_class c ON t.tgrelid = c.oid
              JOIN pg_namespace n ON c.relnamespace = n.oid
              WHERE n.nspname = 'public' AND NOT t.tgisinternal) LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I', r.tgname, r.relname);
    END LOOP;

    -- Drop auth trigger if exists
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    END IF;

    -- Drop all RLS policies
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Drop tables in correct order (respecting foreign key dependencies)
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS registrations CASCADE;
DROP TABLE IF EXISTS tryout_signups CASCADE;
DROP TABLE IF EXISTS tryout_sessions CASCADE;
DROP TABLE IF EXISTS team_roster CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS parents CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS coaches CASCADE;
DROP TABLE IF EXISTS seasons CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS calculate_age(DATE) CASCADE;
DROP FUNCTION IF EXISTS auth.user_role() CASCADE;
DROP FUNCTION IF EXISTS auth.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS gender CASCADE;
DROP TYPE IF EXISTS registration_status CASCADE;
DROP TYPE IF EXISTS registration_source CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS tryout_signup_status CASCADE;
DROP TYPE IF EXISTS event_type CASCADE;

-- =============================================
-- CLEANUP COMPLETE
-- Now run tne-supabase-schema.sql
-- =============================================
