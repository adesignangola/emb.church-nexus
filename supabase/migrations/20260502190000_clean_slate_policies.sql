-- =====================================================
-- CLEAN SLATE: Drop ALL policies and recreate from scratch
-- =====================================================

-- =====================================================
-- PART 1: Drop ALL existing policies on ALL tables
-- =====================================================

-- Profiles
DROP POLICY IF EXISTS "users_read_own" ON profiles;
DROP POLICY IF EXISTS "admin_pastors_read_all" ON profiles;
DROP POLICY IF EXISTS "users_update_own" ON profiles;
DROP POLICY IF EXISTS "admins_manage_all" ON profiles;
DROP POLICY IF EXISTS "enable_insert_authenticated" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins and pastors can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;

-- Appointments
DROP POLICY IF EXISTS "Authorized roles can manage appointments" ON appointments;

-- Sermons
DROP POLICY IF EXISTS "Pastors and admins can manage sermons" ON sermons;

-- Events
DROP POLICY IF EXISTS "Authorized roles can manage events" ON events;

-- Visitors
DROP POLICY IF EXISTS "Authorized roles can manage visitors" ON visitors;

-- Schedules
DROP POLICY IF EXISTS "Authorized roles can manage schedules" ON schedules;

-- School Classes
DROP POLICY IF EXISTS "Authorized roles can manage school classes" ON school_classes;

-- Kids Groups
DROP POLICY IF EXISTS "Authorized roles can manage kids groups" ON kids_groups;

-- Messages
DROP POLICY IF EXISTS "Authorized roles can manage messages" ON messages;

-- Leadership Positions
DROP POLICY IF EXISTS "Admins can manage leadership positions" ON leadership_positions;

-- Church Profile
DROP POLICY IF EXISTS "Admins can manage church profile" ON church_profile;

-- Pastoral Notes
DROP POLICY IF EXISTS "Pastors and admins can view notes" ON pastoral_notes;
DROP POLICY IF EXISTS "Pastors and admins can manage notes" ON pastoral_notes;

-- Transactions
DROP POLICY IF EXISTS "Authorized roles can manage transactions" ON transactions;

-- Worship Services
DROP POLICY IF EXISTS "Authorized roles can manage worship services" ON worship_services;

-- Members
DROP POLICY IF EXISTS "Users can view members" ON members;
DROP POLICY IF EXISTS "Authorized roles can manage members" ON members;

-- =====================================================
-- PART 2: Recreate the has_role function (SECURITY DEFINER)
-- =====================================================
CREATE OR REPLACE FUNCTION has_role(check_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND check_role = ANY(roles)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PART 3: Recreate the handle_new_user trigger
-- =====================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_roles TEXT[];
BEGIN
  IF NEW.raw_user_meta_data ? 'roles' AND jsonb_array_length(NEW.raw_user_meta_data->'roles') > 0 THEN
    v_roles := (SELECT array_agg(val)::TEXT[] FROM jsonb_array_elements_text(NEW.raw_user_meta_data->'roles') val);
  ELSE
    v_roles := '{"MEMBER"}';
  END IF;
  
  INSERT INTO public.profiles (id, full_name, email, roles)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email,
    v_roles
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    roles = EXCLUDED.roles;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- PART 4: Recreate ALL policies from scratch
-- =====================================================

-- PROFILES
-- Rule 1: Every user can read their own profile
CREATE POLICY "profiles_read_own" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Rule 2: Admins and Pastors can read ALL profiles
CREATE POLICY "profiles_read_all" ON profiles
  FOR SELECT
  USING (has_role('ADMIN') OR has_role('PASTOR'));

-- Rule 3: Users can update their own profile (phone, full_name, etc.)
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Rule 4: Admins can manage ALL profiles (create, update, delete)
CREATE POLICY "profiles_admin_manage" ON profiles
  FOR ALL
  USING (has_role('ADMIN'));

-- Rule 5: Allow insert (trigger uses this, so service role can insert)
CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT
  WITH CHECK (true);

-- APPOINTMENTS
CREATE POLICY "appointments_manage" ON appointments
  FOR ALL TO authenticated
  USING (has_role('ADMIN') OR has_role('PASTOR') OR has_role('SECRETARY'))
  WITH CHECK (has_role('ADMIN') OR has_role('PASTOR') OR has_role('SECRETARY'));

-- SERMONS
CREATE POLICY "sermons_manage" ON sermons
  FOR ALL TO authenticated
  USING (has_role('ADMIN') OR has_role('PASTOR'))
  WITH CHECK (has_role('ADMIN') OR has_role('PASTOR'));

-- EVENTS
CREATE POLICY "events_manage" ON events
  FOR ALL TO authenticated
  USING (has_role('ADMIN') OR has_role('SECRETARY'))
  WITH CHECK (has_role('ADMIN') OR has_role('SECRETARY'));

-- VISITORS
CREATE POLICY "visitors_manage" ON visitors
  FOR ALL TO authenticated
  USING (has_role('ADMIN') OR has_role('SECRETARY'))
  WITH CHECK (has_role('ADMIN') OR has_role('SECRETARY'));

-- SCHEDULES
CREATE POLICY "schedules_manage" ON schedules
  FOR ALL TO authenticated
  USING (has_role('ADMIN') OR has_role('PASTOR') OR has_role('DEPT_LEADER'))
  WITH CHECK (has_role('ADMIN') OR has_role('PASTOR') OR has_role('DEPT_LEADER'));

-- SCHOOL CLASSES
CREATE POLICY "school_classes_manage" ON school_classes
  FOR ALL TO authenticated
  USING (has_role('ADMIN') OR has_role('SECRETARY'))
  WITH CHECK (has_role('ADMIN') OR has_role('SECRETARY'));

-- KIDS GROUPS
CREATE POLICY "kids_groups_manage" ON kids_groups
  FOR ALL TO authenticated
  USING (has_role('ADMIN') OR has_role('DEPT_LEADER'))
  WITH CHECK (has_role('ADMIN') OR has_role('DEPT_LEADER'));

-- MESSAGES
CREATE POLICY "messages_manage" ON messages
  FOR ALL TO authenticated
  USING (has_role('ADMIN') OR has_role('SECRETARY'))
  WITH CHECK (has_role('ADMIN') OR has_role('SECRETARY'));

-- LEADERSHIP POSITIONS
CREATE POLICY "leadership_manage" ON leadership_positions
  FOR ALL TO authenticated
  USING (has_role('ADMIN'))
  WITH CHECK (has_role('ADMIN'));

-- CHURCH PROFILE
CREATE POLICY "church_profile_manage" ON church_profile
  FOR ALL TO authenticated
  USING (has_role('ADMIN'))
  WITH CHECK (has_role('ADMIN'));

-- PASTORAL NOTES
CREATE POLICY "pastoral_notes_read" ON pastoral_notes
  FOR SELECT TO authenticated
  USING (has_role('ADMIN') OR has_role('PASTOR'));

CREATE POLICY "pastoral_notes_manage" ON pastoral_notes
  FOR ALL TO authenticated
  USING (has_role('ADMIN') OR has_role('PASTOR'))
  WITH CHECK (has_role('ADMIN') OR has_role('PASTOR'));

-- TRANSACTIONS
CREATE POLICY "transactions_manage" ON transactions
  FOR ALL TO authenticated
  USING (has_role('ADMIN') OR has_role('TREASURER'))
  WITH CHECK (has_role('ADMIN') OR has_role('TREASURER'));

-- WORSHIP SERVICES
CREATE POLICY "worship_manage" ON worship_services
  FOR ALL TO authenticated
  USING (has_role('ADMIN') OR has_role('PASTOR') OR has_role('DEPT_LEADER'))
  WITH CHECK (has_role('ADMIN') OR has_role('PASTOR') OR has_role('DEPT_LEADER'));

-- MEMBERS
CREATE POLICY "members_read" ON members
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "members_manage" ON members
  FOR ALL TO authenticated
  USING (has_role('ADMIN') OR has_role('SECRETARY'))
  WITH CHECK (has_role('ADMIN') OR has_role('SECRETARY'));

-- =====================================================
-- PART 5: Ensure RLS is enabled on all tables
-- =====================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE kids_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE leadership_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE pastoral_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE worship_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PART 6: Create/fix profile for Ruben Bitumba
-- =====================================================
-- Find the user in auth.users and ensure profile exists with correct roles
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'rubenbitumba@embchurch.com' LIMIT 1;
  
  IF v_user_id IS NOT NULL THEN
    INSERT INTO profiles (id, full_name, email, roles)
    VALUES (v_user_id, 'Ruben Bitumba', 'rubenbitumba@embchurch.com', '{"ADMIN", "PASTOR"}')
    ON CONFLICT (id) DO UPDATE SET
      full_name = 'Ruben Bitumba',
      roles = '{"ADMIN", "PASTOR"}';
  END IF;
END $$;
