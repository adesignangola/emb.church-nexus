-- =====================================================
-- CLEAN SLATE: Drop ALL policies and recreate from scratch
-- =====================================================

-- =====================================================
-- PART 1: Drop ALL existing policies on ALL tables
-- =====================================================
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- Disable and re-enable RLS on all tables to clear state
DO $$
DECLARE t RECORD;
BEGIN
  FOR t IN (SELECT DISTINCT tablename FROM pg_policies WHERE schemaname = 'public') LOOP
    EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', t.tablename);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.tablename);
  END LOOP;
END $$;

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
CREATE POLICY "profiles_read_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_read_all" ON profiles FOR SELECT USING (has_role('ADMIN') OR has_role('PASTOR'));
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_admin_manage" ON profiles FOR ALL USING (has_role('ADMIN'));
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (true);

-- APPOINTMENTS
CREATE POLICY "appointments_manage" ON appointments FOR ALL USING (has_role('ADMIN') OR has_role('PASTOR') OR has_role('SECRETARY'));

-- SERMONS
CREATE POLICY "sermons_manage" ON sermons FOR ALL USING (has_role('ADMIN') OR has_role('PASTOR'));

-- EVENTS
CREATE POLICY "events_manage" ON events FOR ALL USING (has_role('ADMIN') OR has_role('SECRETARY'));

-- VISITORS
CREATE POLICY "visitors_manage" ON visitors FOR ALL USING (has_role('ADMIN') OR has_role('SECRETARY'));

-- SCHEDULES
CREATE POLICY "schedules_manage" ON schedules FOR ALL USING (has_role('ADMIN') OR has_role('PASTOR') OR has_role('DEPT_LEADER'));

-- SCHOOL CLASSES
CREATE POLICY "school_classes_manage" ON school_classes FOR ALL USING (has_role('ADMIN') OR has_role('SECRETARY'));

-- KIDS GROUPS
CREATE POLICY "kids_groups_manage" ON kids_groups FOR ALL USING (has_role('ADMIN') OR has_role('DEPT_LEADER'));

-- MESSAGES
CREATE POLICY "messages_manage" ON messages FOR ALL USING (has_role('ADMIN') OR has_role('SECRETARY'));

-- LEADERSHIP POSITIONS
CREATE POLICY "leadership_manage" ON leadership_positions FOR ALL USING (has_role('ADMIN'));

-- CHURCH PROFILE
CREATE POLICY "church_profile_manage" ON church_profile FOR ALL USING (has_role('ADMIN'));

-- PASTORAL NOTES
CREATE POLICY "pastoral_notes_read" ON pastoral_notes FOR SELECT USING (has_role('ADMIN') OR has_role('PASTOR'));
CREATE POLICY "pastoral_notes_manage" ON pastoral_notes FOR ALL USING (has_role('ADMIN') OR has_role('PASTOR'));

-- FINANCIAL TRANSACTIONS
CREATE POLICY "transactions_manage" ON financial_transactions FOR ALL USING (has_role('ADMIN') OR has_role('TREASURER'));

-- DEPARTMENTS
CREATE POLICY "departments_read" ON departments FOR SELECT USING (true);
CREATE POLICY "departments_manage" ON departments FOR ALL USING (has_role('ADMIN') OR has_role('SECRETARY'));

-- NOTIFICATIONS
CREATE POLICY "notifications_read" ON notifications FOR SELECT USING (true);
CREATE POLICY "notifications_manage" ON notifications FOR ALL USING (has_role('ADMIN'));

-- WORSHIP SERVICES
CREATE POLICY "worship_manage" ON worship_services FOR ALL USING (has_role('ADMIN') OR has_role('PASTOR') OR has_role('DEPT_LEADER'));

-- AUDIT LOGS
CREATE POLICY "audit_logs_read" ON audit_logs FOR SELECT USING (has_role('ADMIN'));

-- MEMBERS
CREATE POLICY "members_read" ON members FOR SELECT USING (true);
CREATE POLICY "members_manage" ON members FOR ALL USING (has_role('ADMIN') OR has_role('SECRETARY'));

-- =====================================================
-- PART 5: Create/fix profile for Ruben Bitumba (ADMIN + PASTOR)
-- =====================================================
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
