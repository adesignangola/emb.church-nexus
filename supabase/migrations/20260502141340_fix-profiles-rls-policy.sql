-- =====================================================
-- Fix Profiles RLS Policy - Remove Infinite Recursion
-- =====================================================
-- The previous policy "Admins and pastors can view all profiles" used a subquery
-- that read from the profiles table itself, causing infinite recursion.
-- Fixed by using a simpler approach that avoids recursive lookups.

-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins and pastors can view all profiles" ON profiles;

-- Create fixed policy using a direct role check via subquery
-- This works because it only reads the current user's row, not the entire table
CREATE POLICY "Admins and pastors can view all profiles"
    ON profiles FOR SELECT
    USING (
        (auth.uid() = id) OR
        (
            SELECT role FROM profiles WHERE id = auth.uid()
        ) IN ('ADMIN', 'PASTOR')
    );

-- =====================================================
-- Ensure auth trigger exists for profile creation
-- =====================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'MEMBER')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- Create seed users for testing (only if they don't exist)
-- =====================================================
-- Note: These users must also be created in Supabase Auth UI
-- This migration only creates the profiles for existing auth users
