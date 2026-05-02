-- =====================================================
-- Fix Profiles RLS - Simple and reliable
-- =====================================================

-- Disable and re-enable RLS to clear any stuck policies
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop ALL policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins and pastors can view all profiles" ON profiles;
DROP POLICY IF EXISTS "profiles_select_all_authenticated" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_manage_admin" ON profiles;

-- 1. ALL authenticated users can read ALL profiles (no recursion, no subqueries)
CREATE POLICY "profiles_read_all"
    ON profiles FOR SELECT
    TO authenticated
    USING (true);

-- 2. Users can update their own profile
CREATE POLICY "profiles_update_own"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 3. Create function for admin/pastor checks (used by OTHER tables)
-- SECURITY DEFINER bypasses RLS on the profiles table
CREATE OR REPLACE FUNCTION is_admin_or_pastor(user_id UUID)
RETURNS BOOLEAN AS $$
    SELECT role IN ('ADMIN', 'PASTOR')
    FROM profiles
    WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- 4. Function to check if user has a specific role
CREATE OR REPLACE FUNCTION has_role(user_id UUID, check_role TEXT)
RETURNS BOOLEAN AS $$
    SELECT role = check_role
    FROM profiles
    WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;
