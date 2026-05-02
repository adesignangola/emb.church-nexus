-- =====================================================
-- Fix Profiles RLS - Remove ALL recursion
-- =====================================================

-- Drop ALL existing policies on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins and pastors can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Admins and pastors can manage profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- 1. All authenticated users can read all profiles
-- No subqueries, no recursion - just true
CREATE POLICY "profiles_select_all_authenticated"
    ON profiles FOR SELECT
    TO authenticated
    USING (true);

-- 2. Users can update their own profile only
CREATE POLICY "profiles_update_own"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 3. Create a SECURITY DEFINER function for admin role checks
-- This bypasses RLS and can be used by other tables' policies
CREATE OR REPLACE FUNCTION is_admin_or_pastor(user_id UUID)
RETURNS BOOLEAN AS $$
    SELECT role IN ('ADMIN', 'PASTOR')
    FROM profiles
    WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;
